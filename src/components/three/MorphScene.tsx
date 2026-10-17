'use client';

import { useEffect, useMemo, useRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import type { MotionValue } from 'framer-motion';
import * as THREE from 'three';
import { bindPointer, isCoarsePointer, pointer } from './shared';
import { heroMotion } from '@/data/heroMotion';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/utils/theme';

/* ------------------------------------------------------------------
   Scroll choreography — beat centres are shared with Hero.tsx captions
------------------------------------------------------------------- */
const ss = (e0: number, e1: number, x: number) => THREE.MathUtils.smoothstep(x, e0, e1);

/** 0 sphere → 1 interface → 2 neural net → 3 shield → 4 monogram */
function morphAt(p: number) {
  return heroMotion.morphs.reduce((morph, [start, end]) => morph + ss(start, end, p), 0);
}

/* ------------------------------------------------------------------
   Formations — each returns N xyz positions plus per-point metadata
------------------------------------------------------------------- */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Out = { pos: Float32Array; accent: Float32Array; edge: Float32Array };
const alloc = (n: number): Out => ({ pos: new Float32Array(n * 3), accent: new Float32Array(n), edge: new Float32Array(n).fill(-1) });

function sphere(n: number, rand: () => number) {
  const o = alloc(n);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const th = i * golden;
    const R = 1.55 + (rand() - 0.5) * 0.06;
    o.pos.set([Math.cos(th) * r * R, y * R, Math.sin(th) * r * R], i * 3);
    o.accent[i] = rand() < 0.025 ? 1 : 0;
  }
  return o;
}

/** A floating app window: frame, title bar, sidebar, cards and lines of text. */
function interfacePanel(n: number, rand: () => number) {
  const o = alloc(n);
  const W = 3.6, H = 2.3;
  const rects: Array<[number, number, number, number, number, number]> = [
    // x, y, w, h, weight, accent
    [-W / 2 + 0.12, H / 2 - 0.3, W - 0.24, 0.12, 1, 0], // title bar
    [-W / 2 + 0.12, H / 2 - 0.55, 0.7, H - 0.7, 1.4, 0], // sidebar
    [-0.95, H / 2 - 0.55, 1.15, 0.85, 1.6, 1], // hero card (accent)
    [0.3, H / 2 - 0.55, 1.35, 0.4, 1, 0],
    [0.3, H / 2 - 1.05, 1.35, 0.35, 1, 0],
    [-0.95, -0.05, 2.6, 0.06, 0.5, 0], // text lines
    [-0.95, -0.25, 2.2, 0.06, 0.5, 0],
    [-0.95, -0.45, 2.45, 0.06, 0.5, 0],
    [-0.95, -0.75, 0.8, 0.25, 0.8, 1], // button (accent)
  ];
  const total = rects.reduce((s, r) => s + r[2] * r[3] * r[4], 0);
  const frameShare = 0.32;
  let i = 0;
  // Frame (rounded-rect outline)
  for (; i < n * frameShare; i++) {
    const t = rand() * 2 * (W + H);
    let x, y;
    if (t < W) [x, y] = [-W / 2 + t, H / 2];
    else if (t < W + H) [x, y] = [W / 2, H / 2 - (t - W)];
    else if (t < 2 * W + H) [x, y] = [W / 2 - (t - W - H), -H / 2];
    else [x, y] = [-W / 2, -H / 2 + (t - 2 * W - H)];
    o.pos.set([x + (rand() - 0.5) * 0.02, y + (rand() - 0.5) * 0.02, (rand() - 0.5) * 0.04], i * 3);
  }
  // Content blocks, weighted by area
  for (; i < n; i++) {
    let pick = rand() * total;
    let r = rects[0];
    for (const c of rects) {
      pick -= c[2] * c[3] * c[4];
      if (pick <= 0) { r = c; break; }
    }
    const [x, y, w, h, , accent] = r;
    o.pos.set([x + rand() * w, y - rand() * h, 0.05 + (rand() - 0.5) * 0.03], i * 3);
    o.accent[i] = accent;
  }
  return o;
}

/** A layered neural net: node clusters plus points strung along every connection. */
function neuralNet(n: number, rand: () => number) {
  const o = alloc(n);
  const layers = [4, 6, 6, 3];
  const xs = [-1.9, -0.65, 0.65, 1.9];
  const nodes: THREE.Vector3[][] = layers.map((count, l) =>
    Array.from({ length: count }, (_, k) => new THREE.Vector3(xs[l], (k - (count - 1) / 2) * 0.62, (rand() - 0.5) * 0.5)),
  );
  const edges: [THREE.Vector3, THREE.Vector3][] = [];
  for (let l = 0; l < layers.length - 1; l++) for (const a of nodes[l]) for (const b of nodes[l + 1]) edges.push([a, b]);
  const flat = nodes.flat();
  const nodeShare = 0.42;
  let i = 0;
  for (; i < n * nodeShare; i++) {
    const c = flat[Math.floor(rand() * flat.length)];
    const u = rand() * 2 - 1, th = rand() * Math.PI * 2, r = 0.13 * Math.cbrt(rand());
    const s = Math.sqrt(1 - u * u);
    o.pos.set([c.x + s * Math.cos(th) * r, c.y + s * Math.sin(th) * r, c.z + u * r], i * 3);
    o.accent[i] = c.x > 1.8 ? 1 : 0; // output layer glows
  }
  for (; i < n; i++) {
    const [a, b] = edges[Math.floor(rand() * edges.length)];
    const t = rand();
    o.pos.set([a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t], i * 3);
    o.edge[i] = t; // drives the travelling signal pulses
  }
  return o;
}

/** A shield with a checkmark — the security beat. */
function shield(n: number, rand: () => number) {
  const o = alloc(n);
  const top = 1.45, side = 1.2;
  const poly: [number, number][] = [];
  for (let i = 0; i <= 40; i++) {
    const x = -side + (2 * side * i) / 40;
    poly.push([x, top - 0.12 * (1 - (x / side) ** 2)]); // gentle dip along the top edge
  }
  for (let i = 1; i <= 10; i++) poly.push([side, top - (top - 0.25) * (i / 10)]);
  const bez = (t: number, sx: number): [number, number] => {
    // quadratic from (±side, 0.25) via (±side, -1.0) to the point (0, -1.7)
    const a = (1 - t) * (1 - t), b = 2 * (1 - t) * t, c = t * t;
    return [a * sx + b * sx, a * 0.25 + b * -1.0 + c * -1.7];
  };
  for (let i = 1; i <= 40; i++) poly.push(bez(i / 40, side));
  for (let i = 39; i >= 0; i--) poly.push(bez(i / 40, -side));
  for (let i = 1; i < 10; i++) poly.push([-side, 0.25 + (top - 0.25) * (i / 10)]);

  const lens = [0];
  for (let i = 1; i <= poly.length; i++) {
    const [ax, ay] = poly[i - 1], [bx, by] = poly[i % poly.length];
    lens.push(lens[i - 1] + Math.hypot(bx - ax, by - ay));
  }
  const total = lens[lens.length - 1];
  const onOutline = (k: number): [number, number] => {
    const d = rand() * total;
    let j = 1;
    while (lens[j] < d) j++;
    const t = (d - lens[j - 1]) / (lens[j] - lens[j - 1]);
    const [ax, ay] = poly[j - 1], [bx, by] = poly[j % poly.length];
    const cx = 0, cy = 0.05;
    return [cx + (ax + (bx - ax) * t - cx) * k, cy + (ay + (by - ay) * t - cy) * k];
  };
  const inside = (x: number, y: number) => {
    let hit = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
    }
    return hit;
  };
  const check: [number, number][] = [[-0.55, 0.05], [-0.12, -0.42], [0.62, 0.55]];

  for (let i = 0; i < n; i++) {
    const roll = rand();
    let x, y, z;
    if (roll < 0.38) {
      [x, y] = onOutline(1);
      z = (rand() - 0.5) * 0.24; // the rim has thickness
    } else if (roll < 0.55) {
      [x, y] = onOutline(0.84);
      z = 0.04;
    } else if (roll < 0.75) {
      const seg = rand() < 0.4 ? 0 : 1;
      const t = rand();
      const [ax, ay] = check[seg], [bx, by] = check[seg + 1];
      x = ax + (bx - ax) * t + (rand() - 0.5) * 0.11;
      y = ay + (by - ay) * t + (rand() - 0.5) * 0.11;
      z = 0.08;
      o.accent[i] = 1;
    } else {
      do {
        x = (rand() * 2 - 1) * side;
        y = -1.7 + rand() * (top + 1.7);
      } while (!inside(x / 0.8, (y - 0.05) / 0.8 + 0.05));
      z = (rand() - 0.5) * 0.06;
    }
    o.pos.set([x, y, z], i * 3);
  }
  return o;
}

/** "js" set in the display serif, sampled from a canvas. */
function monogram(n: number, rand: () => number) {
  const o = alloc(n);
  const S = 512;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  const serif = getComputedStyle(document.documentElement).getPropertyValue('--font-serif-src').trim() || 'serif';
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.font = `italic 400px ${serif}`;
  g.fillText('js', S / 2, S * 0.46);
  const data = g.getImageData(0, 0, S, S).data;
  const hits: number[] = [];
  for (let y = 0; y < S; y += 2) for (let x = 0; x < S; x += 2) if (data[(y * S + x) * 4 + 3] > 128) hits.push(x, y);
  const count = hits.length / 2;
  for (let i = 0; i < n; i++) {
    if (count === 0) {
      o.pos.set([(rand() - 0.5) * 3, (rand() - 0.5) * 3, 0], i * 3);
      continue;
    }
    const k = Math.floor(rand() * count) * 2;
    const scale = 3.6 / S;
    o.pos.set([(hits[k] - S / 2) * scale + (rand() - 0.5) * 0.01, -(hits[k + 1] - S / 2) * scale, (rand() - 0.5) * 0.18], i * 3);
    o.accent[i] = rand() < 0.08 ? 1 : 0;
  }
  return o;
}

/* ------------------------------------------------------------------
   Shaders
------------------------------------------------------------------- */
const vertexShader = /* glsl */ `
uniform float uMorph;
uniform float uTime;
uniform float uSize;
uniform float uPixelRatio;
uniform float uReveal;
uniform vec3 uMouse;
attribute vec3 aP1;
attribute vec3 aP2;
attribute vec3 aP3;
attribute vec3 aP4;
attribute vec4 aAccent;   // accent flags for formations 0–3; formation 4 in aAccent4
attribute float aAccent4;
attribute float aEdge;
attribute float aRand;
varying float vAccent;
varying float vPulse;
varying float vTransit;
varying float vWarmth;

vec3 formation(int i) {
  if (i <= 0) return position;
  if (i == 1) return aP1;
  if (i == 2) return aP2;
  if (i == 3) return aP3;
  return aP4;
}
float accentOf(int i) {
  if (i <= 0) return aAccent.x;
  if (i == 1) return aAccent.y;
  if (i == 2) return aAccent.z;
  if (i == 3) return aAccent.w;
  return aAccent4;
}

void main() {
  float seg = floor(uMorph);
  float f = uMorph - seg;
  // Each point leaves on its own schedule, so shapes flow rather than snap
  float delay = aRand * 0.4;
  float k = clamp((f - delay) / 0.6, 0.0, 1.0);
  k = k * k * (3.0 - 2.0 * k);
  int a = int(seg);
  vec3 from = formation(a);
  vec3 to = formation(a + 1);
  vec3 p = mix(from, to, k);

  // Swirl while in transit
  float transit = sin(k * 3.14159);
  float ang = aRand * 6.2831 + uTime * 0.6;
  p += vec3(cos(ang), sin(ang * 1.3), sin(ang)) * transit * 0.35;
  vTransit = transit;
  vWarmth = clamp(p.x * 0.25 + p.z * 0.12 + 0.4, 0.0, 1.0);

  // Assemble from a loose constellation during the opening reveal.
  float scatter = 1.0 - uReveal;
  p += normalize(from + 0.001) * scatter * (0.6 + aRand * 2.0);
  p += vec3(sin(aRand * 30.0), cos(aRand * 24.0), sin(aRand * 18.0)) * scatter * 0.4;

  // Idle breathing
  p += vec3(sin(uTime * 0.8 + aRand * 20.0), cos(uTime * 0.7 + aRand * 17.0), sin(uTime * 0.6 + aRand * 13.0)) * 0.012;

  // Cursor repulsion
  vec3 d = p - uMouse;
  float dist = length(d);
  float push = smoothstep(0.75, 0.0, dist);
  p += normalize(d + 1e-5) * push * 0.45;

  vAccent = mix(accentOf(a), accentOf(a + 1), k);

  // Signals travelling along network connections
  float onNet = (a == 2 || a + 1 == 2) ? (a == 2 ? 1.0 - k : k) : 0.0;
  vPulse = aEdge >= 0.0 ? onNet * smoothstep(0.92, 1.0, 1.0 - abs(fract(aEdge - uTime * 0.45 + aRand * 0.15) - 0.5) * 2.0) : 0.0;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float size = uSize * (1.0 + vAccent * 0.9 + vPulse * 1.4 + push * 0.8);
  gl_PointSize = size * uPixelRatio * (6.0 / -mv.z);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uSignal;
uniform vec3 uCobalt;
varying float vAccent;
varying float vPulse;
varying float vTransit;
varying float vWarmth;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float alpha = smoothstep(0.5, 0.32, r);
  vec3 col = mix(uInk, uSignal, vWarmth * 0.7);
  col = mix(col, uCobalt, vTransit * 0.45);
  col = mix(col, uSignal, max(vAccent, vPulse));
  gl_FragColor = vec4(col, alpha * (0.62 + vAccent * 0.38));
  #include <colorspace_fragment>
}
`;

/* ------------------------------------------------------------------
   Scene
------------------------------------------------------------------- */
/** DOM placeholders the particles fit themselves into, one per phase of the hero. */
export interface Slots {
  intro: RefObject<HTMLElement | null>;
  beat: RefObject<HTMLElement | null>;
  outro: RefObject<HTMLElement | null>;
}

// Natural size (world units) of the formations shown in each slot
const FIT = { intro: [3.8, 3.8], beat: [4.4, 3.7], outro: [2.8, 3.7] } as const;

function Particles({ progress, count, reduced, slots, onReady, theme }: { progress: MotionValue<number>; count: number; reduced: boolean; slots: Slots; onReady?: () => void; theme: Theme }) {
  const { viewport, camera, gl } = useThree();
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const state = useRef({ intro: 0, ready: false });
  const tmp = useMemo(() => ({ ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), plane: new THREE.Plane(), hit: new THREE.Vector3(), inv: new THREE.Matrix4(), normal: new THREE.Vector3() }), []);

  const geometry = useMemo(() => {
    const rand = seeded(7);
    const forms = [sphere(count, rand), interfacePanel(count, rand), neuralNet(count, rand), shield(count, rand), monogram(count, rand)];
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(forms[0].pos, 3));
    g.setAttribute('aP1', new THREE.BufferAttribute(forms[1].pos, 3));
    g.setAttribute('aP2', new THREE.BufferAttribute(forms[2].pos, 3));
    g.setAttribute('aP3', new THREE.BufferAttribute(forms[3].pos, 3));
    g.setAttribute('aP4', new THREE.BufferAttribute(forms[4].pos, 3));
    const acc = new Float32Array(count * 4);
    for (let i = 0; i < count; i++) acc.set([forms[0].accent[i], forms[1].accent[i], forms[2].accent[i], forms[3].accent[i]], i * 4);
    g.setAttribute('aAccent', new THREE.BufferAttribute(acc, 4));
    g.setAttribute('aAccent4', new THREE.BufferAttribute(forms[4].accent, 1));
    g.setAttribute('aEdge', new THREE.BufferAttribute(forms[2].edge, 1));
    const r = new Float32Array(count);
    for (let i = 0; i < count; i++) r[i] = rand();
    g.setAttribute('aRand', new THREE.BufferAttribute(r, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
    return g;
  }, [count]);

  // The monogram depends on the web font — resample it once fonts are ready
  useEffect(() => {
    document.fonts?.ready.then(() => {
      const fresh = monogram(count, seeded(11));
      const attr = geometry.getAttribute('aP4') as THREE.BufferAttribute;
      (attr.array as Float32Array).set(fresh.pos);
      attr.needsUpdate = true;
    });
  }, [count, geometry]);

  const uniforms = useMemo(
    () => ({
      uMorph: { value: 0 },
      uTime: { value: 0 },
      uSize: { value: 2.3 },
      uPixelRatio: { value: 1 },
      uReveal: { value: 0 },
      uMouse: { value: new THREE.Vector3(99, 99, 99) },
      uInk: { value: new THREE.Color('#e5d6b7') },
      uSignal: { value: new THREE.Color('#ff4f1f') },
      uCobalt: { value: new THREE.Color('#b4a0ff') },
    }),
    [],
  );

  useEffect(() => {
    uniforms.uInk.value.set(theme === 'dark' ? '#e5d6b7' : '#141210');
    uniforms.uCobalt.value.set(theme === 'dark' ? '#b4a0ff' : '#2b3bff');
  }, [theme, uniforms]);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.05);
    const s = state.current;
    if (!s.ready) { s.ready = true; onReady?.(); }
    // Hero already supplies the spring. A second damping pass makes shapes lag the captions.
    const p = progress.get();
    const morph = morphAt(p);
    s.intro = THREE.MathUtils.damp(s.intro, 1, 1.6, dt);
    const t = frame.clock.elapsedTime;

    const u = material.current!.uniforms;
    // Intro: particles condense from a wide cloud into the sphere
    u.uMorph.value = Math.min(morph, 3.999);
    u.uTime.value = reduced ? 0 : t;
    u.uPixelRatio.value = gl.getPixelRatio();
    u.uReveal.value = reduced ? 1 : s.intro;

    // Framing: fit into whichever DOM slot the current phase uses, blending between them.
    // The slots live in the page's own layout, so text and particles can never collide.
    const rect = gl.domElement.getBoundingClientRect();
    const wIntro = 1 - ss(0.18, 0.32, p);
    const wOutro = ss(0.8, 0.92, p);
    const wBeat = Math.max(0, 1 - wIntro - wOutro);
    const fit = (el: HTMLElement | null, [fw, fh]: readonly [number, number]) => {
      if (!el) return { x: 0, y: 0, s: 0.5 };
      const r = el.getBoundingClientRect();
      const k = viewport.width / rect.width;
      return {
        x: ((r.left + r.width / 2 - rect.left) / rect.width - 0.5) * viewport.width,
        y: -((r.top + r.height / 2 - rect.top) / rect.height - 0.5) * viewport.height,
        s: Math.max(0.05, Math.min((r.width * k) / fw, (r.height * k) / fh)),
      };
    };
    const A = fit(slots.intro.current, FIT.intro);
    const B = fit(slots.beat.current, FIT.beat);
    const C = fit(slots.outro.current, FIT.outro);
    const mix = (a: number, b: number, c: number) => a * wIntro + b * wBeat + c * wOutro;

    const g = group.current!;
    g.position.x = mix(A.x, B.x, C.x);
    g.position.y = mix(A.y, B.y, C.y);
    g.scale.setScalar(mix(A.s, B.s, C.s) * (0.6 + 0.4 * s.intro));
    const sway = reduced ? 0 : Math.sin(t * 0.25) * 0.22;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, sway + pointer.x * 0.35 - (1 - s.intro) * 1.5 + wBeat * -0.35, 3, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -pointer.y * 0.2 + wBeat * 0.12, 3, dt);
    if (!reduced) {
      const spin = 1 - ss(0.1, 0.8, morph);
      points.current!.rotation.y += dt * 0.08 * spin;
      points.current!.rotation.y = THREE.MathUtils.damp(points.current!.rotation.y, 0, (1 - spin) * 4, dt);
    }

    // Cursor → local space of the particle group
    tmp.ndc.set(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -((pointer.clientY - rect.top) / rect.height) * 2 + 1);
    tmp.ray.setFromCamera(tmp.ndc, camera);
    g.updateMatrixWorld();
    tmp.normal.set(0, 0, 1).transformDirection(g.matrixWorld);
    tmp.plane.setFromNormalAndCoplanarPoint(tmp.normal, g.getWorldPosition(new THREE.Vector3()));
    if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
      tmp.inv.copy(points.current!.matrixWorld).invert();
      u.uMouse.value.lerp(tmp.hit.applyMatrix4(tmp.inv), 1 - Math.exp(-dt * 12));
    }
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry}>
        <shaderMaterial
          ref={material}
          uniforms={uniforms}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          transparent
          depthWrite={false}
        />
      </points>
    </group>
  );
}

export default function MorphScene({
  progress,
  active,
  reduced,
  slots,
  onReady,
}: {
  progress: MotionValue<number>;
  active: boolean;
  reduced: boolean;
  slots: Slots;
  onReady?: () => void;
}) {
  useEffect(bindPointer, []);
  const { theme } = useTheme();
  const coarse = isCoarsePointer();
  return (
    <Canvas
      flat
      dpr={[1, coarse ? 1.5 : 2]}
      frameloop={active ? 'always' : 'never'}
      camera={{ position: [0, 0, 6], fov: 40 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <Particles progress={progress} count={coarse ? 9000 : 18000} reduced={reduced} slots={slots} onReady={onReady} theme={theme} />
    </Canvas>
  );
}
