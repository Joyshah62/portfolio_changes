'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { GPUComputationRenderer, type Variable } from 'three/examples/jsm/misc/GPUComputationRenderer.js';
import { bindPointer, flowShock, isCoarsePointer, pointer } from './shared';
import { flowWords, formAt } from '@/data/flowMotion';

/* ------------------------------------------------------------------
   Targets — every particle gets a random inked pixel of each word
------------------------------------------------------------------- */
const FREE_SHARE = 0.14; // particles with seed below this never settle, so the field stays alive

function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Width-normalised glyph positions (x ∈ [-0.5, 0.5]); w flags the accent full stop. */
function wordTarget(word: string, size: number, rand: () => number) {
  const fontPx = 220;
  const c = document.createElement('canvas');
  const g = c.getContext('2d', { willReadFrequently: true })!;
  const sans = getComputedStyle(document.documentElement).getPropertyValue('--font-sans-src').trim() || 'system-ui';
  const font = `700 ${fontPx}px ${sans}, system-ui, sans-serif`;
  g.font = font;
  const body = word.replace(/\.$/, '');
  const bodyW = g.measureText(body).width;
  const W = Math.ceil(g.measureText(word).width + fontPx * 0.2);
  const H = Math.ceil(fontPx * 1.15);
  c.width = W;
  c.height = H;
  g.font = font; // resizing resets context state
  g.letterSpacing = '0px';
  g.textBaseline = 'middle';
  const x0 = (W - g.measureText(word).width) / 2;
  g.fillStyle = '#fff';
  g.fillText(body, x0, H / 2);
  if (body !== word) {
    g.fillStyle = '#f00';
    g.fillText('.', x0 + bodyW, H / 2);
  }
  const data = g.getImageData(0, 0, W, H).data;
  const hits: number[] = [];
  for (let y = 0; y < H; y += 2) {
    for (let x = 0; x < W; x += 2) {
      const k = (y * W + x) * 4;
      if (data[k + 3] > 140) hits.push(x, y, data[k + 1] < 80 ? 1 : 0);
    }
  }
  const out = new Float32Array(size * size * 4);
  const count = hits.length / 3;
  for (let i = 0; i < size * size; i++) {
    if (count === 0) break;
    const h = Math.floor(rand() * count) * 3;
    out[i * 4] = (hits[h] + rand() * 2 - W / 2) / W;
    out[i * 4 + 1] = -(hits[h + 1] + rand() * 2 - H / 2) / W;
    out[i * 4 + 2] = (rand() - 0.5) * 0.02;
    out[i * 4 + 3] = hits[h + 2];
  }
  const tex = new THREE.DataTexture(out, size, size, THREE.RGBAFormat, THREE.FloatType);
  tex.needsUpdate = true;
  return { tex, aspect: H / W };
}

/* ------------------------------------------------------------------
   Simulation shaders (run once per particle per frame on the GPU)
------------------------------------------------------------------- */
// Ashima simplex noise, MIT
const noise = /* glsl */ `
vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + 2.0 * C.xxx;
  vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
  i = mod(i, 289.0);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0 / 7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
vec3 noise3(vec3 p) {
  return vec3(snoise(p), snoise(p + vec3(31.4, -12.7, 7.1)), snoise(p + vec3(-9.2, 23.8, -41.5)));
}
// Divergence-free flow: particles swirl and fold instead of clumping
vec3 curl(vec3 p) {
  const float e = 0.1;
  vec3 dx = vec3(e, 0.0, 0.0), dy = vec3(0.0, e, 0.0), dz = vec3(0.0, 0.0, e);
  vec3 px0 = noise3(p - dx), px1 = noise3(p + dx);
  vec3 py0 = noise3(p - dy), py1 = noise3(p + dy);
  vec3 pz0 = noise3(p - dz), pz1 = noise3(p + dz);
  return vec3(
    (py1.z - py0.z) - (pz1.y - pz0.y),
    (pz1.x - pz0.x) - (px1.z - px0.z),
    (px1.y - px0.y) - (py1.x - py0.x)
  ) / (2.0 * e);
}
`;

const velocityShader = /* glsl */ `
uniform float uTime;
uniform float uDelta;
uniform float uForm;
uniform float uTargetScale;
uniform vec3 uBounds;
uniform vec3 uMouse;
uniform float uStir;
uniform vec4 uShock; // xyz origin, w age in seconds
uniform sampler2D tTarget;
${noise}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec3 p = pos.xyz;
  vec3 v = texture2D(textureVelocity, uv).xyz;
  float seed = pos.w;
  float form = uForm * step(${FREE_SHARE.toFixed(2)}, seed);
  // Stagger arrivals so words assemble stroke by stroke rather than all at once
  form *= smoothstep(0.0, 0.25, uForm - (seed - ${FREE_SHARE.toFixed(2)}) * 0.6);

  vec3 acc = curl(p * 0.32 + vec3(0.0, 0.0, uTime * 0.05)) * mix(1.5, 0.08, form);

  // Spring toward this particle's spot in the current word; underdamped so it lands with a wobble
  vec3 target = texture2D(tTarget, uv).xyz * uTargetScale;
  acc += (target - p) * form * 22.0;

  // Soft walls keep the free flow on screen
  vec3 q = p / uBounds;
  acc -= p * smoothstep(0.85, 1.4, length(q)) * 2.5;

  // Cursor vortex: swirl around it and push slightly outward
  vec3 d = p - uMouse;
  float r = length(d.xy);
  float fall = exp(-r * r * 2.2) * uStir;
  acc += (vec3(-d.y, d.x, 0.0) / (r + 0.08) * 3.2 + normalize(d + 1e-5) * 2.2) * fall;

  // Click shockwave: an expanding ring that kicks particles outward
  vec3 sd = p - uShock.xyz;
  float sr = length(sd);
  float ring = exp(-pow((sr - uShock.w * 5.0) * 2.4, 2.0)) * exp(-uShock.w * 1.6);
  acc += normalize(sd + 1e-5) * ring * 60.0;

  v += acc * uDelta;
  v *= exp(-mix(0.9, 5.5, form) * uDelta);
  gl_FragColor = vec4(v, 1.0);
}
`;

const positionShader = /* glsl */ `
uniform float uDelta;
void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 pos = texture2D(texturePosition, uv);
  vec3 v = texture2D(textureVelocity, uv).xyz;
  gl_FragColor = vec4(pos.xyz + v * uDelta, pos.w);
}
`;

/* ------------------------------------------------------------------
   Render shaders
------------------------------------------------------------------- */
const vertexShader = /* glsl */ `
uniform sampler2D tPosition;
uniform sampler2D tVelocity;
uniform sampler2D tTarget;
uniform float uForm;
uniform float uSize;
uniform float uPixelRatio;
attribute vec2 reference;
varying float vSpeed;
varying float vAccent;
varying float vSeed;
void main() {
  vec4 pos = texture2D(tPosition, reference);
  vSpeed = length(texture2D(tVelocity, reference).xyz);
  vSeed = pos.w;
  vAccent = texture2D(tTarget, reference).w * uForm * step(${FREE_SHARE.toFixed(2)}, pos.w);
  vec4 mv = modelViewMatrix * vec4(pos.xyz, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * uPixelRatio * (0.65 + pos.w * 0.7) * (6.0 / -mv.z);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uCobalt;
uniform vec3 uSignal;
uniform float uAlpha;
varying float vSpeed;
varying float vAccent;
varying float vSeed;
void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.1, r);
  // Calm particles read as paper; fast ones heat up through cobalt into signal orange
  vec3 col = mix(uInk, uCobalt, smoothstep(0.4, 1.6, vSpeed));
  col = mix(col, uSignal, smoothstep(1.6, 3.5, vSpeed));
  col = mix(col, uSignal, max(vAccent, step(0.985, vSeed) * 0.8));
  gl_FragColor = vec4(col * a * uAlpha, 1.0);
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------
   Scene
------------------------------------------------------------------- */
type Sim = {
  gpu: GPUComputationRenderer;
  velocity: Variable;
  position: Variable;
  targets: { tex: THREE.DataTexture; aspect: number }[];
};

function createSim(gl: THREE.WebGLRenderer, size: number): Sim {
  const gpu = new GPUComputationRenderer(size, size, gl);
  // iOS can't render to full-float targets
  if (/iP(hone|ad|od)/.test(navigator.userAgent) || (/Mac/.test(navigator.userAgent) && navigator.maxTouchPoints > 1)) gpu.setDataType(THREE.HalfFloatType);
  const rand = seeded(23);
  const pos0 = gpu.createTexture();
  const p = pos0.image.data as Float32Array;
  for (let i = 0; i < size * size; i++) {
    p[i * 4] = (rand() - 0.5) * 9;
    p[i * 4 + 1] = (rand() - 0.5) * 5;
    p[i * 4 + 2] = (rand() - 0.5) * 3;
    p[i * 4 + 3] = rand(); // per-particle seed, carried along forever
  }
  const velocity = gpu.addVariable('textureVelocity', velocityShader, gpu.createTexture());
  const position = gpu.addVariable('texturePosition', positionShader, pos0);
  gpu.setVariableDependencies(velocity, [position, velocity]);
  gpu.setVariableDependencies(position, [position, velocity]);
  const targets = flowWords.map((w, i) => wordTarget(w, size, seeded(100 + i)));
  Object.assign(velocity.material.uniforms, {
    uTime: { value: 0 },
    uDelta: { value: 0 },
    uForm: { value: 0 },
    uTargetScale: { value: 1 },
    uBounds: { value: new THREE.Vector3(4, 2.4, 1.5) },
    uMouse: { value: new THREE.Vector3(99, 99, 0) },
    uStir: { value: 0 },
    uShock: { value: new THREE.Vector4(0, 0, 0, 99) },
    tTarget: { value: targets[0].tex },
  });
  position.material.uniforms.uDelta = { value: 0 };
  const error = gpu.init();
  if (error) throw new Error(error);
  return { gpu, velocity, position, targets };
}

function Particles({ size, progress }: { size: number; progress: MotionValue<number> }) {
  const { gl, camera, viewport } = useThree();
  const count = size * size;
  const sim = useRef<Sim | null>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const state = useRef({ form: 0, index: 0, stir: 0 });
  const tmp = useMemo(() => ({ ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(), prev: new THREE.Vector3() }), []);

  useEffect(() => {
    const current = createSim(gl, size);
    sim.current = current;
    // The words depend on the web font — resample once fonts are ready
    let live = true;
    document.fonts?.ready.then(() => {
      if (!live) return;
      current.targets.forEach((t, i) => {
        const fresh = wordTarget(flowWords[i], size, seeded(100 + i));
        (t.tex.image.data as Float32Array).set(fresh.tex.image.data as Float32Array);
        t.tex.needsUpdate = true;
        t.aspect = fresh.aspect;
        fresh.tex.dispose();
      });
    });
    return () => {
      live = false;
      sim.current = null;
      current.targets.forEach((t) => t.tex.dispose());
      current.gpu.dispose();
    };
  }, [gl, size]);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const ref = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) ref.set([((i % size) + 0.5) / size, (Math.floor(i / size) + 0.5) / size], i * 2);
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('reference', new THREE.BufferAttribute(ref, 2));
    return g;
  }, [count, size]);

  const uniforms = useMemo(
    () => ({
      tPosition: { value: null as THREE.Texture | null },
      tVelocity: { value: null as THREE.Texture | null },
      tTarget: { value: null as THREE.Texture | null },
      uForm: { value: 0 },
      uSize: { value: 1.5 },
      uPixelRatio: { value: 1 },
      uAlpha: { value: 0.5 },
      uInk: { value: new THREE.Color('#e5d6b7') },
      uCobalt: { value: new THREE.Color('#8993ff') },
      uSignal: { value: new THREE.Color('#ff4f1f') },
    }),
    [],
  );

  useFrame((frame, delta) => {
    const current = sim.current;
    if (!current || !material.current) return;
    const dt = Math.min(delta, 1 / 30);
    const s = state.current;
    const { index, form } = formAt(progress.get());
    // Only swap words while the field is loose, so nothing ever snaps. A jump straight
    // from one word to another dissolves the old one first.
    s.form = THREE.MathUtils.damp(s.form, index === s.index ? form : 0, index === s.index ? 6 : 9, dt);
    if (index !== s.index && s.form < 0.05) s.index = index;
    const target = current.targets[s.index];

    // Word fills most of the width (more on portrait screens), never taller than ~45% of the height
    const scale = Math.min(viewport.width * (viewport.aspect < 1 ? 0.9 : 0.8), (viewport.height * 0.45) / target.aspect);

    // Cursor → z=0 plane; it only stirs hard while it's actually moving over the canvas
    const vu = current.velocity.material.uniforms;
    const rect = gl.domElement.getBoundingClientRect();
    tmp.ndc.set(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -((pointer.clientY - rect.top) / rect.height) * 2 + 1);
    const inside = Math.abs(tmp.ndc.x) <= 1 && Math.abs(tmp.ndc.y) <= 1;
    tmp.ray.setFromCamera(tmp.ndc, camera);
    tmp.prev.copy(vu.uMouse.value);
    if (inside && tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) vu.uMouse.value.lerp(tmp.hit, 1 - Math.exp(-dt * 14));
    const speed = tmp.prev.distanceTo(vu.uMouse.value) / Math.max(dt, 1e-3);
    s.stir = THREE.MathUtils.damp(s.stir, inside ? Math.min(1, 0.25 + speed * 0.15) : 0, 4, dt);

    // Click → shockwave from that point
    const shock = vu.uShock.value as THREE.Vector4;
    if (flowShock.t > 0) {
      flowShock.t = 0;
      tmp.ndc.set(((flowShock.x - rect.left) / rect.width) * 2 - 1, -((flowShock.y - rect.top) / rect.height) * 2 + 1);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) shock.set(tmp.hit.x, tmp.hit.y, 0, 0);
    } else {
      shock.w += dt;
    }

    vu.uTime.value = frame.clock.elapsedTime;
    vu.uDelta.value = dt;
    vu.uForm.value = s.form;
    vu.uTargetScale.value = scale;
    vu.uBounds.value.set(viewport.width * 0.55, viewport.height * 0.55, 1.5);
    vu.uStir.value = s.stir;
    vu.tTarget.value = target.tex;
    current.position.material.uniforms.uDelta.value = dt;
    current.gpu.compute();

    const u = material.current.uniforms;
    u.tPosition.value = current.gpu.getCurrentRenderTarget(current.position).texture;
    u.tVelocity.value = current.gpu.getCurrentRenderTarget(current.velocity).texture;
    u.tTarget.value = target.tex;
    u.uForm.value = s.form;
    u.uPixelRatio.value = gl.getPixelRatio();
  });

  return (
    <points geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export default function FlowScene({
  progress,
  active,
}: {
  progress: MotionValue<number>;
  active: boolean;
}) {
  useEffect(bindPointer, []);
  const coarse = isCoarsePointer();
  return (
    <Canvas
      flat
      dpr={[1, coarse ? 1.5 : 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: false, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {/* 400² = 160k particles on desktop, 160² ≈ 25k on phones (their smaller words saturate with more) */}
      <Particles size={coarse ? 160 : 400} progress={progress} />
    </Canvas>
  );
}
