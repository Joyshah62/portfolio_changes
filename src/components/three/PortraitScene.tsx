'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { bindPointer, isCoarsePointer, pointer } from './shared';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/utils/theme';

/**
 * A fine, full-color point portrait. Color carries facial detail while a
 * subtle depth map and cursor ripple retain the interactive treatment.
 */

interface Sample {
  pos: Float32Array; // target xyz
  scatter: Float32Array; // starting xyz
  size: Float32Array;
  tone: Float32Array; // 0 dark → 1 light
  color: Float32Array;
  cols: number;
  height: number;
}

// Crop to head and shoulders; the dots fill the whole rectangle with a thin soft edge
const CROP = { x: 0.06, y: 0.06, w: 0.88, h: 0.72 };

function samplePhoto(img: HTMLImageElement, cols: number): Sample {
  const rows = Math.round(cols * ((CROP.h * img.height) / (CROP.w * img.width)));
  const c = document.createElement('canvas');
  c.width = cols;
  c.height = rows;
  const g = c.getContext('2d', { willReadFrequently: true })!;
  g.drawImage(img, CROP.x * img.width, CROP.y * img.height, CROP.w * img.width, CROP.h * img.height, 0, 0, cols, rows);
  const data = g.getImageData(0, 0, cols, rows).data;

  const pos: number[] = [], scatter: number[] = [], size: number[] = [], tone: number[] = [], color: number[] = [];
  const pixel = new THREE.Color();
  let seed = 99;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const W = 3, H = (W * rows) / cols;

  // Luminance grid, then an unsharp mask so eyes, brows and smile survive the halftone
  const L = new Float32Array(cols * rows);
  for (let k = 0; k < cols * rows; k++) {
    L[k] = (0.299 * data[k * 4] + 0.587 * data[k * 4 + 1] + 0.114 * data[k * 4 + 2]) / 255;
  }
  const blur = new Float32Array(cols * rows);
  const R = 2;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      let sum = 0, n = 0;
      for (let oy = -R; oy <= R; oy++) {
        for (let ox = -R; ox <= R; ox++) {
          const xx = x + ox, yy = y + oy;
          if (xx < 0 || yy < 0 || xx >= cols || yy >= rows) continue;
          sum += L[yy * cols + xx];
          n++;
        }
      }
      blur[y * cols + x] = sum / n;
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const k = y * cols + x;
      const lum = Math.min(1, Math.max(0, L[k] + 1.6 * (L[k] - blur[k])));
      const u = x / cols, v = y / rows;
      // Rectangular frame: full strength inside, fading over the last few percent at each edge
      const edge = Math.min(u, 1 - u, v, 1 - v);
      const mask = THREE.MathUtils.smoothstep(edge, 0, 0.05);
      if (mask < 0.025) continue;
      const px = (u - 0.5) * W, py = (0.5 - v) * H, pz = (lum - 0.5) * 0.2;
      pos.push(px, py, pz);
      const a = rand() * Math.PI * 2, r = 2 + rand() * 3;
      scatter.push(px + Math.cos(a) * r, py + Math.sin(a) * r, pz + (rand() - 0.5) * 4);
      // Color carries the facial detail; smaller dots no longer merge into black patches.
      size.push((0.62 + (1 - lum) * 0.22) * Math.sqrt(mask));
      tone.push(lum);
      pixel.setRGB(data[k * 4] / 255, data[k * 4 + 1] / 255, data[k * 4 + 2] / 255, THREE.SRGBColorSpace);
      color.push(pixel.r, pixel.g, pixel.b);
    }
  }
  return { pos: new Float32Array(pos), scatter: new Float32Array(scatter), size: new Float32Array(size), tone: new Float32Array(tone), color: new Float32Array(color), cols, height: H };
}

const vertexShader = /* glsl */ `
uniform float uAssemble;
uniform float uTime;
uniform float uDot;
uniform float uPixelRatio;
uniform vec2 uMouse;
uniform float uRipple;
attribute vec3 aScatter;
attribute float aSize;
attribute float aTone;
attribute vec3 aColor;
varying float vTone;
varying float vLift;
varying vec3 vColor;

void main() {
  // Points nearer the centre arrive first
  float delay = clamp(length(position.xy) * 0.18, 0.0, 0.5);
  float k = clamp((uAssemble - delay) / (1.0 - delay), 0.0, 1.0);
  k = 1.0 - pow(1.0 - k, 3.0);
  vec3 p = mix(aScatter, position, k);

  // Cursor ripple travelling outward from the pointer
  float d = distance(p.xy, uMouse);
  float wave = sin(d * 9.0 - uTime * 7.0) * exp(-d * 2.2) * uRipple;
  float lift = smoothstep(0.6, 0.0, d) * uRipple;
  p.z += wave * 0.12 + lift * 0.35;
  vLift = lift;
  vTone = aTone;
  vColor = aColor;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uDot * aSize * (1.0 + lift * 0.6) * uPixelRatio * (5.0 / -mv.z);
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 uInk;
uniform vec3 uSignal;
varying float vTone;
varying float vLift;
varying vec3 vColor;

void main() {
  float r = length(gl_PointCoord - 0.5);
  if (r > 0.5) discard;
  vec3 col = mix(vColor, uInk, 0.12);
  col = mix(col, uSignal, vLift * 0.25);
  gl_FragColor = vec4(col, smoothstep(0.5, 0.38, r));
  #include <colorspace_fragment>
}
`;

function Dots({ sample, visible, reduced, theme, onReady }: { sample: Sample; visible: boolean; reduced: boolean; theme: Theme; onReady?: () => void }) {
  const { viewport, camera, gl, size } = useThree();
  const points = useRef<THREE.Points>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const ready = useRef(false);
  const tmp = useMemo(() => ({ ray: new THREE.Raycaster(), ndc: new THREE.Vector2(), plane: new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), hit: new THREE.Vector3(), mouse: new THREE.Vector2() }), []);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(sample.pos, 3));
    g.setAttribute('aScatter', new THREE.BufferAttribute(sample.scatter, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(sample.size, 1));
    g.setAttribute('aTone', new THREE.BufferAttribute(sample.tone, 1));
    g.setAttribute('aColor', new THREE.BufferAttribute(sample.color, 3));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 10);
    return g;
  }, [sample]);

  const uniforms = useMemo(
    () => ({
      uAssemble: { value: reduced ? 1 : 0 },
      uTime: { value: 0 },
      uDot: { value: 7 },
      uPixelRatio: { value: 1 },
      uMouse: { value: new THREE.Vector2(99, 99) },
      uRipple: { value: 0 },
      uInk: { value: new THREE.Color('#141210') },
      uSignal: { value: new THREE.Color('#ff4f1f') },
    }),
    [reduced],
  );

  useEffect(() => {
    uniforms.uInk.value.set(theme === 'dark' ? '#c6c0b2' : '#141210');
  }, [theme, uniforms]);

  useFrame((frame, delta) => {
    const dt = Math.min(delta, 0.05);
    const u = material.current!.uniforms;
    if (!ready.current) { ready.current = true; onReady?.(); }
    u.uTime.value = frame.clock.elapsedTime;
    u.uPixelRatio.value = gl.getPixelRatio();
    // Leave breathing room around the photo and the controls.
    const fit = Math.min(viewport.width / 3.25, viewport.height / (sample.height + 0.35));
    const spacingPx = ((3 * fit) / viewport.width) * size.width / sample.cols;
    u.uDot.value = spacingPx * 0.94;
    if (visible) u.uAssemble.value = THREE.MathUtils.damp(u.uAssemble.value, 1, 1.1, dt);

    points.current!.scale.setScalar(fit);

    const rect = gl.domElement.getBoundingClientRect();
    const inside = pointer.clientX >= rect.left && pointer.clientX <= rect.right && pointer.clientY >= rect.top && pointer.clientY <= rect.bottom;
    u.uRipple.value = THREE.MathUtils.damp(u.uRipple.value, inside && !reduced ? 1 : 0, 4, dt);
    if (inside) {
      tmp.ndc.set(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -((pointer.clientY - rect.top) / rect.height) * 2 + 1);
      tmp.ray.setFromCamera(tmp.ndc, camera);
      if (tmp.ray.ray.intersectPlane(tmp.plane, tmp.hit)) {
        u.uMouse.value.lerp(tmp.mouse.set(tmp.hit.x / fit, tmp.hit.y / fit), 1 - Math.exp(-dt * 10));
      }
    }
    // Gentle parallax so the depth reads
    const p = points.current!;
    p.rotation.y = THREE.MathUtils.damp(p.rotation.y, inside && !reduced ? ((pointer.clientX - rect.left) / rect.width - 0.5) * 0.22 : 0, 3, dt);
    p.rotation.x = THREE.MathUtils.damp(p.rotation.x, inside && !reduced ? ((pointer.clientY - rect.top) / rect.height - 0.5) * 0.16 : 0, 3, dt);
  });

  return (
    <points ref={points} geometry={geometry}>
      <shaderMaterial ref={material} uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} />
    </points>
  );
}

export default function PortraitScene({ visible, reduced, onReady }: { visible: boolean; reduced: boolean; onReady?: () => void }) {
  const [sample, setSample] = useState<Sample | null>(null);
  const { theme } = useTheme();
  useEffect(bindPointer, []);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setSample(samplePhoto(img, isCoarsePointer() ? 150 : 220));
    img.src = '/profile.jpeg';
    return () => { img.onload = null; };
  }, []);

  return (
    <Canvas
      flat
      dpr={[1, 2]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: [0, 0, 5], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      {sample && <Dots sample={sample} visible={visible} reduced={reduced} theme={theme} onReady={onReady} />}
    </Canvas>
  );
}
