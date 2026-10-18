'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import type { Activations, DigitModel } from '@/lib/digits';
import { useTheme } from '@/hooks/useTheme';
import { bindPointer, isCoarsePointer, pointer } from './shared';

/* ------------------------------------------------------------------
   Layout: four layers stacked in depth, the group turned so they fan out
   left (input) → right (output).
------------------------------------------------------------------- */
const LAYER_Z = [-3, -1, 1, 3];
const GRID: Array<[number, number, number]> = [
  // cols, rows, spacing
  [28, 28, 0.064],
  [8, 8, 0.23],
  [4, 8, 0.23],
  [1, 10, 0.19],
];

function layerPositions(l: number) {
  const [cols, rows, gap] = GRID[l];
  const out: THREE.Vector3[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push(new THREE.Vector3((c - (cols - 1) / 2) * gap, ((rows - 1) / 2 - r) * gap, LAYER_Z[l]));
    }
  }
  return out;
}

const MAX_SEGMENTS = 64 * 3 + 32 * 3 + 10 * 4;

/* ------------------------------------------------------------------
   Shaders
------------------------------------------------------------------- */
const pointsVertex = /* glsl */ `
attribute float aValue;
uniform float uPixelRatio;
uniform float uScale;
varying float vValue;
void main() {
  vValue = aValue;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = (1.6 + aValue * 4.2) * uPixelRatio * uScale * (8.0 / -mv.z);
}
`;
const pointsFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uSignal;
varying float vValue;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  vec3 col = mix(uInk, uSignal, smoothstep(0.05, 0.6, vValue));
  gl_FragColor = vec4(col, smoothstep(0.5, 0.3, r) * (0.16 + vValue * 0.84));
  #include <colorspace_fragment>
}
`;

const linesVertex = /* glsl */ `
attribute float aT;
attribute float aStrength;
attribute float aLayer;
attribute float aSeed;
varying float vT;
varying float vStrength;
varying float vLayer;
varying float vSeed;
void main() {
  vT = aT; vStrength = aStrength; vLayer = aLayer; vSeed = aSeed;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
const linesFragment = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uSignal;
uniform float uTime;
uniform float uBurst;
varying float vT;
varying float vStrength;
varying float vLayer;
varying float vSeed;
void main() {
  // Steady pulses travelling input → output
  float phase = fract(uTime * 0.55 + vSeed - vT);
  float pulse = smoothstep(0.86, 1.0, phase);
  // A brighter wavefront after each finished stroke
  float front = (uTime - uBurst) * 2.2;
  float burst = exp(-pow((vLayer + vT - front) * 3.0, 2.0));
  float glow = max(pulse * 0.8, burst);
  vec3 col = mix(uInk, uSignal, clamp(vStrength * 0.6 + glow, 0.0, 1.0));
  gl_FragColor = vec4(col, vStrength * (0.22 + glow * 0.78));
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------
   Digit labels beside the output layer (canvas textures, page font)
------------------------------------------------------------------- */
function makeLabel(text: string) {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d')!;
  const sans = getComputedStyle(document.documentElement).getPropertyValue('--font-mono-src').trim() || 'monospace';
  g.fillStyle = '#fff';
  g.font = `500 76px ${sans}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, 64, 68);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ------------------------------------------------------------------
   Scene
------------------------------------------------------------------- */
function Network({ model, acts, burstAt }: { model: DigitModel; acts: Activations | null; burstAt: number }) {
  const { theme } = useTheme();
  const { gl, viewport } = useThree();
  const group = useRef<THREE.Group>(null);
  const nodes = useRef<THREE.InstancedMesh>(null);
  const labelRefs = useRef<(THREE.Sprite | null)[]>([]);

  const ink = theme === 'dark' ? '#e5d6b7' : '#141210';
  const pos = useMemo(() => [0, 1, 2, 3].map(layerPositions), []);
  const nodeCount = 64 + 32 + 10;

  // What's on screen eases toward the latest activations, one layer after another
  const shown = useRef<Float32Array[]>([784, 64, 32, 10].map((n) => new Float32Array(n)));
  const target = useRef<Float32Array[]>([784, 64, 32, 10].map((n) => new Float32Array(n)));
  const arrive = useRef([0, 0, 0, 0]);
  const clock = useRef(0);

  const labels = useMemo(() => Array.from({ length: 10 }, (_, i) => makeLabel(String(i))), []);
  useEffect(() => () => labels.forEach((t) => t.dispose()), [labels]);

  /* Input layer as points */
  const inputGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos[0].flatMap((p) => [p.x, p.y, p.z]), 3));
    g.setAttribute('aValue', new THREE.BufferAttribute(new Float32Array(784), 1));
    return g;
  }, [pos]);

  /* Connection segments, rebuilt from the strongest contributions */
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 6), 3));
    g.setAttribute('aT', new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 2), 1));
    g.setAttribute('aStrength', new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 2), 1));
    g.setAttribute('aLayer', new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 2), 1));
    g.setAttribute('aSeed', new THREE.BufferAttribute(new Float32Array(MAX_SEGMENTS * 2), 1));
    g.setDrawRange(0, 0);
    return g;
  }, []);

  const pointUniforms = useMemo(
    () => ({ uInk: { value: new THREE.Color() }, uSignal: { value: new THREE.Color('#ff4f1f') }, uPixelRatio: { value: 1 }, uScale: { value: 1 } }),
    [],
  );
  const lineUniforms = useMemo(
    () => ({ uInk: { value: new THREE.Color() }, uSignal: { value: new THREE.Color('#ff4f1f') }, uTime: { value: 0 }, uBurst: { value: -10 } }),
    [],
  );
  useEffect(() => {
    pointUniforms.uInk.value.set(ink);
    lineUniforms.uInk.value.set(ink);
  }, [ink, pointUniforms, lineUniforms]);

  useEffect(() => {
    lineUniforms.uBurst.value = burstAt > 0 ? clock.current : -10;
  }, [burstAt, lineUniforms]);

  // New activations: normalise hidden layers for display, stagger their arrival, rebuild connections
  useEffect(() => {
    const now = clock.current;
    if (!acts) {
      target.current.forEach((t) => t.fill(0));
      lineGeo.setDrawRange(0, 0);
      return;
    }
    acts.forEach((a, l) => {
      let max = 0;
      for (const v of a) max = Math.max(max, v);
      const t = target.current[l];
      for (let i = 0; i < a.length; i++) t[i] = l === 0 || l === 3 ? a[i] : max > 0 ? a[i] / max : 0;
      arrive.current[l] = now + l * 0.12;
    });

    const P = lineGeo.getAttribute('position') as THREE.BufferAttribute;
    const T = lineGeo.getAttribute('aT') as THREE.BufferAttribute;
    const S = lineGeo.getAttribute('aStrength') as THREE.BufferAttribute;
    const L = lineGeo.getAttribute('aLayer') as THREE.BufferAttribute;
    const D = lineGeo.getAttribute('aSeed') as THREE.BufferAttribute;
    let seg = 0;
    const push = (l: number, from: number, to: number, strength: number) => {
      const a = pos[l][from], b = pos[l + 1][to];
      P.setXYZ(seg * 2, a.x, a.y, a.z);
      P.setXYZ(seg * 2 + 1, b.x, b.y, b.z);
      T.setX(seg * 2, 0); T.setX(seg * 2 + 1, 1);
      S.setX(seg * 2, strength); S.setX(seg * 2 + 1, strength);
      L.setX(seg * 2, l); L.setX(seg * 2 + 1, l);
      const seed = ((from * 92821 + to * 68917 + l * 31) % 1000) / 1000;
      D.setX(seg * 2, seed); D.setX(seg * 2 + 1, seed);
      seg++;
    };

    // For each node in the next layer, keep its strongest positive incoming contributions
    for (let l = 0; l < 3; l++) {
      const nin = model.arch[l], nout = model.arch[l + 1], w = model.weights[l], src = acts[l], dst = acts[l + 1];
      const keep = l === 2 ? 4 : 3;
      const picks: Array<[number, number, number]> = [];
      let maxC = 0;
      for (let o = 0; o < nout; o++) {
        if (l < 2 && dst[o] <= 0) continue;
        const best: Array<[number, number]> = [];
        for (let i = 0; i < nin; i++) {
          const c = src[i] * w[i * nout + o];
          if (c <= 0) continue;
          if (best.length < keep) best.push([c, i]);
          else if (c > best[keep - 1][0]) best[keep - 1] = [c, i];
          else continue;
          best.sort((x, y) => y[0] - x[0]);
        }
        const weight = l === 2 ? Math.max(0.15, dst[o]) : 1;
        for (const [c, i] of best) {
          picks.push([i, o, c * weight]);
          maxC = Math.max(maxC, c * weight);
        }
      }
      for (const [i, o, c] of picks) if (seg < MAX_SEGMENTS) push(l, i, o, maxC > 0 ? 0.2 + 0.8 * (c / maxC) : 0);
    }
    [P, T, S, L, D].forEach((a) => (a.needsUpdate = true));
    lineGeo.setDrawRange(0, seg * 2);
  }, [acts, model, pos, lineGeo]);

  const color = useMemo(() => new THREE.Color(), []);
  const inkColor = useMemo(() => new THREE.Color(), []);
  const signal = useMemo(() => new THREE.Color('#ff4f1f'), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 0.05);
    clock.current = state.clock.elapsedTime;
    lineUniforms.uTime.value = clock.current;
    pointUniforms.uPixelRatio.value = gl.getPixelRatio();
    inkColor.set(ink);

    // Ease each layer toward its target once its turn arrives
    for (let l = 0; l < 4; l++) {
      if (clock.current < arrive.current[l]) continue;
      const s = shown.current[l], t = target.current[l];
      const k = 1 - Math.exp(-dt * 12);
      for (let i = 0; i < s.length; i++) s[i] += (t[i] - s[i]) * k;
    }

    const value = inputGeo.getAttribute('aValue') as THREE.BufferAttribute;
    (value.array as Float32Array).set(shown.current[0]);
    value.needsUpdate = true;

    const mesh = nodes.current!;
    let n = 0;
    for (let l = 1; l < 4; l++) {
      const s = shown.current[l];
      for (let i = 0; i < s.length; i++, n++) {
        const v = s[i];
        dummy.position.copy(pos[l][i]);
        dummy.scale.setScalar((l === 3 ? 1.35 : 1) * (0.55 + v * 0.95));
        dummy.updateMatrix();
        mesh.setMatrixAt(n, dummy.matrix);
        color.copy(inkColor).lerp(signal, Math.min(1, v * 1.1));
        mesh.setColorAt(n, color);
      }
    }
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;

    // Output labels: the winning digit lights up
    const out = shown.current[3];
    let top = 0;
    for (let i = 1; i < 10; i++) if (out[i] > out[top]) top = i;
    labelRefs.current.forEach((sprite, i) => {
      if (!sprite) return;
      const on = acts && i === top && out[i] > 0.2;
      (sprite.material as THREE.SpriteMaterial).color.copy(on ? signal : inkColor);
      (sprite.material as THREE.SpriteMaterial).opacity = on ? 1 : 0.35 + out[i] * 0.65;
      sprite.scale.setScalar(on ? 0.26 : 0.18);
      // Offset along the group's local axis that points to screen-right, whatever the turn angle
      const yaw = group.current!.rotation.y;
      sprite.position.set(Math.cos(yaw) * 0.3, pos[3][i].y, pos[3][i].z + Math.sin(yaw) * 0.3);
    });

    // Fit to the canvas, with a little parallax from the pointer
    const g = group.current!;
    // Narrow canvases: turn the layers more side-on so the whole network fits larger
    const narrow = viewport.aspect < 1.2;
    g.scale.setScalar(Math.min(1.3, viewport.width / (narrow ? 6.8 : 7.4), viewport.height / 3.1));
    // Leave room on the right for the output digit labels
    g.position.x = narrow ? -viewport.width * 0.04 : 0;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, (narrow ? 1.12 : 0.82) + pointer.x * 0.12, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, 0.08 - pointer.y * 0.08, 3, dt);
  });

  return (
    <group ref={group}>
      <points geometry={inputGeo}>
        <shaderMaterial uniforms={pointUniforms} vertexShader={pointsVertex} fragmentShader={pointsFragment} transparent depthWrite={false} />
      </points>
      <lineSegments geometry={lineGeo}>
        <shaderMaterial uniforms={lineUniforms} vertexShader={linesVertex} fragmentShader={linesFragment} transparent depthWrite={false} />
      </lineSegments>
      <instancedMesh ref={nodes} args={[undefined, undefined, nodeCount]}>
        <sphereGeometry args={[0.045, 14, 14]} />
        <meshBasicMaterial />
      </instancedMesh>
      {labels.map((tex, i) => (
        <sprite
          key={i}
          ref={(s) => { labelRefs.current[i] = s; }}
          position={[0.32, pos[3][i].y, pos[3][i].z]}
          scale={0.18}
        >
          <spriteMaterial map={tex} transparent depthWrite={false} />
        </sprite>
      ))}
    </group>
  );
}

export default function NetworkScene({
  model,
  acts,
  burstAt,
  visible,
}: {
  model: DigitModel;
  acts: Activations | null;
  burstAt: number;
  visible: boolean;
}) {
  useEffect(bindPointer, []);
  const coarse = isCoarsePointer();
  return (
    <Canvas
      flat
      dpr={[1, coarse ? 1.5 : 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 0, 8.5], fov: 34 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Network model={model} acts={acts} burstAt={burstAt} />
    </Canvas>
  );
}
