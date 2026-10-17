'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { bindPointer, isCoarsePointer, pointer } from './shared';

const SPACING = 0.34;
const BASE = new THREE.Color('#37322c');
const CREST = new THREE.Color('#ff4f1f');
const COOL = new THREE.Color('#2b3bff');

function Voxels({ cols, rows }: { cols: number; rows: number }) {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const count = cols * rows;
  const { camera, gl } = useThree();

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = useMemo(() => new THREE.Color(), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const hit = useMemo(() => new THREE.Vector3(999, 0, 999), []);
  const smoothHit = useMemo(() => new THREE.Vector3(999, 0, 999), []);
  const ndc = useMemo(() => new THREE.Vector2(), []);

  const grid = useMemo(() => {
    const pts = new Float32Array(count * 2);
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const k = i * rows + j;
        pts[k * 2] = (i - (cols - 1) / 2) * SPACING;
        pts[k * 2 + 1] = (j - (rows - 1) / 2) * SPACING;
      }
    }
    return pts;
  }, [cols, rows, count]);

  useEffect(() => {
    // Seed instance colors so instanceColor exists before the first frame
    for (let k = 0; k < count; k++) mesh.current!.setColorAt(k, BASE);
  }, [count]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    // Project the window pointer onto the ground plane
    const rect = gl.domElement.getBoundingClientRect();
    const inside =
      pointer.clientX >= rect.left && pointer.clientX <= rect.right &&
      pointer.clientY >= rect.top && pointer.clientY <= rect.bottom;
    if (inside) {
      ndc.set(((pointer.clientX - rect.left) / rect.width) * 2 - 1, -((pointer.clientY - rect.top) / rect.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      ray.ray.intersectPlane(plane, hit);
    } else {
      // No cursor: a ghost ripple wanders the field on its own
      hit.set(Math.sin(t * 0.37) * 5.5, 0, Math.sin(t * 0.23 + 1.3) * 2.6);
    }
    if (smoothHit.x > 500) smoothHit.copy(hit);
    else smoothHit.lerp(hit, 1 - Math.exp(-delta * (inside ? 8 : 1.5)));

    const m = mesh.current!;
    for (let k = 0; k < count; k++) {
      const x = grid[k * 2];
      const z = grid[k * 2 + 1];
      const d = Math.hypot(x, z * 1.4);
      const swell = Math.sin(d * 0.9 - t * 1.1) * 0.5 + 0.5;
      const chop = Math.sin(x * 0.7 + t * 0.6) * Math.cos(z * 0.9 - t * 0.4) * 0.5 + 0.5;
      const dm = Math.hypot(x - smoothHit.x, z - smoothHit.z);
      const ripple = Math.exp(-dm * dm * 0.35) * (1.4 + Math.sin(dm * 3 - t * 6) * 0.25);
      const h = 0.08 + swell * 0.45 + chop * 0.25 + ripple;

      dummy.position.set(x, h / 2, z);
      dummy.scale.set(1, h, 1);
      dummy.updateMatrix();
      m.setMatrixAt(k, dummy.matrix);

      color.copy(BASE).lerp(COOL, THREE.MathUtils.smoothstep(chop, 0.75, 1) * 0.35);
      color.lerp(CREST, THREE.MathUtils.smoothstep(h, 0.7, 1.45));
      m.setColorAt(k, color);
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
      <boxGeometry args={[SPACING * 0.62, 1, SPACING * 0.62]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

export default function WaveField({ active, reduced }: { active: boolean; reduced: boolean }) {
  useEffect(bindPointer, []);
  const coarse = isCoarsePointer();

  return (
    <Canvas
      flat
      dpr={[1, coarse ? 1.25 : 1.75]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [0, 6.2, 7.5], fov: 45 }}
      onCreated={({ camera }) => camera.lookAt(0, -0.6, 0)}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <fog attach="fog" args={['#141210', 7, 16]} />
      <ambientLight intensity={0.55} />
      <directionalLight position={[4, 8, 3]} intensity={1.6} />
      <directionalLight position={[-6, 3, -4]} intensity={0.4} color="#ff4f1f" />
      <Voxels cols={coarse ? 30 : 52} rows={coarse ? 22 : 30} />
    </Canvas>
  );
}
