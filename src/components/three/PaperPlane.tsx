'use client';

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { bindPointer, isCoarsePointer, pointer } from './shared';
import { useTheme } from '@/hooks/useTheme';

const SIGNAL = new THREE.Color('#ff4f1f');

/** Outline, folded-paper body and the background the trail fades into, per theme */
const PALETTES = {
  dark: { line: new THREE.Color('#ede8dd'), body: '#26231f', bg: new THREE.Color('#121311') },
  light: { line: new THREE.Color('#141210'), body: '#fbf8f1', bg: new THREE.Color('#ede8dd') },
};
const TRAIL = 90;

/** A folded paper plane, nose along +Z: two wings meeting at a centre crease, and a keel below it */
function planeGeometry() {
  const nose = [0, 0, 0.6], tail = [0, 0, -0.6], keel = [0, -0.2, -0.6];
  const left = [-0.52, 0.06, -0.6], right = [0.52, 0.06, -0.6];
  const tris = [nose, tail, left, nose, right, tail, nose, keel, tail];
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(tris.flat(), 3));
  g.computeVertexNormals();
  return g;
}

/** Where a screen point lands on the z = 0 flight plane */
function screenToPlane(clientX: number, clientY: number, rect: DOMRect, camera: THREE.Camera, ray: THREE.Raycaster, out: THREE.Vector3) {
  const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
  ndc.clamp(new THREE.Vector2(-0.95, -0.95), new THREE.Vector2(0.95, 0.95));
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), out);
}

function Flight({ reduced, theme }: { reduced: boolean; theme: keyof typeof PALETTES }) {
  const palette = PALETTES[theme];
  const { camera, gl, viewport } = useThree();
  const plane = useRef<THREE.Group>(null);
  const geometry = useMemo(planeGeometry, []);
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 1), [geometry]);
  const edgeMat = useMemo(() => new THREE.LineBasicMaterial({ color: '#ede8dd' }), []);

  // Dashed signal trail, brightest at the plane and fading into the background
  const trail = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(TRAIL * 3), 3));
    const line = new THREE.Line(g, new THREE.LineDashedMaterial({ vertexColors: true, dashSize: 0.14, gapSize: 0.1 }));
    line.frustumCulled = false;
    return line;
  }, []);

  const s = useMemo(() => ({
    pos: new THREE.Vector3(-4, -0.6, 0),
    vel: new THREE.Vector3(1.6, 0.2, 0),
    target: new THREE.Vector3(),
    tmp: new THREE.Vector3(),
    cta: new THREE.Vector3(),
    ray: new THREE.Raycaster(),
    bank: 0,
    seeded: false,
    ctaEl: null as HTMLElement | null,
  }), []);

  useEffect(() => () => { geometry.dispose(); edges.dispose(); edgeMat.dispose(); trail.geometry.dispose(); }, [geometry, edges, edgeMat, trail]);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const t = state.clock.elapsedTime;
    const rect = gl.domElement.getBoundingClientRect();
    s.ctaEl ??= document.querySelector<HTMLElement>('[data-plane-target]');

    // Where to fly: circle the CTA when hovered, chase the cursor inside the section, otherwise roam
    const cta = s.ctaEl?.getBoundingClientRect();
    const overCta = !!cta && pointer.clientX > cta.left - 24 && pointer.clientX < cta.right + 24 && pointer.clientY > cta.top - 24 && pointer.clientY < cta.bottom + 24;
    const inside = pointer.clientX >= rect.left && pointer.clientX <= rect.right && pointer.clientY >= rect.top && pointer.clientY <= rect.bottom;
    const w = viewport.width / 2, h = viewport.height / 2;

    let orbit = 0.9, spin = 1.3;
    if (overCta && cta && screenToPlane(cta.left + cta.width / 2, cta.top + cta.height / 2, rect, camera, s.ray, s.cta)) {
      s.target.copy(s.cta); orbit = 0.55; spin = 2.4;
    } else if (inside && !isCoarsePointer() && screenToPlane(pointer.clientX, pointer.clientY, rect, camera, s.ray, s.tmp)) {
      s.target.copy(s.tmp);
    } else {
      s.target.set(Math.sin(t * 0.21) * w * 0.75, Math.sin(t * 0.37 + 0.8) * h * 0.45 - h * 0.1, Math.sin(t * 0.29) * 1.2);
      orbit = 0;
    }
    // Orbiting the target keeps the plane moving forward instead of hovering in place
    s.target.x += Math.cos(t * spin) * orbit;
    s.target.y += Math.sin(t * spin) * orbit * 0.6;
    s.target.z += Math.sin(t * spin) * orbit * 0.8;
    // Keep the whole loop on screen, even around a CTA that sits at the edge
    s.target.x = THREE.MathUtils.clamp(s.target.x, -w + 1.2, w - 1.2);
    s.target.y = THREE.MathUtils.clamp(s.target.y, -h + 0.9, h - 0.9);

    if (reduced) {
      // A single still frame: parked near the CTA side with a curved trail behind it
      s.pos.set(w * 0.35, -h * 0.15, 0);
      s.vel.set(1, 0.35, 0);
    } else {
      // Damped steering (ratio ~0.75) so it settles into its loop instead of overshooting
      const accel = s.tmp.copy(s.target).sub(s.pos).multiplyScalar(2.6).addScaledVector(s.vel, -2.4);
      s.vel.addScaledVector(accel, dt);
      const speed = s.vel.length();
      if (speed < 1.1) s.vel.multiplyScalar(1.1 / Math.max(speed, 1e-3));
      if (speed > 3.4) s.vel.multiplyScalar(3.4 / speed);
      s.pos.addScaledVector(s.vel, dt);
    }

    const g = plane.current!;
    g.position.copy(s.pos);
    g.lookAt(s.tmp.copy(s.pos).add(s.vel));
    // Bank into turns: how hard the velocity is swinging sideways
    const side = new THREE.Vector3(1, 0, 0).applyQuaternion(g.quaternion);
    const turn = THREE.MathUtils.clamp(-s.target.clone().sub(s.pos).dot(side) * 0.35, -0.9, 0.9);
    s.bank += (turn - s.bank) * (1 - Math.exp(-dt * 4));
    g.rotateZ(s.bank);
    edgeMat.color.lerp(overCta ? SIGNAL : palette.line, 1 - Math.exp(-dt * 6));

    // Trail: shift every point back one slot and write the tail of the plane at the head
    const pos = trail.geometry.attributes.position as THREE.BufferAttribute;
    const col = trail.geometry.attributes.color as THREE.BufferAttribute;
    const tailPt = s.tmp.set(0, 0, -0.35).applyMatrix4(g.matrixWorld);
    if (!s.seeded || reduced) {
      for (let i = 0; i < TRAIL; i++) {
        const k = i * 0.05;
        pos.setXYZ(i, tailPt.x - k * 1.6, tailPt.y - Math.sin(k * 0.9) * 1.1 - k * 0.2, tailPt.z);
      }
      s.seeded = true;
    } else {
      (pos.array as Float32Array).copyWithin(3, 0, (TRAIL - 1) * 3);
      pos.setXYZ(0, tailPt.x, tailPt.y, tailPt.z);
    }
    const c = new THREE.Color();
    for (let i = 0; i < TRAIL; i++) {
      c.copy(SIGNAL).lerp(palette.bg, 0.15 + 0.85 * Math.pow(i / (TRAIL - 1), 0.7));
      col.setXYZ(i, c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    col.needsUpdate = true;
    trail.computeLineDistances();
  });

  return (
    <>
      <primitive object={trail} />
      <group ref={plane} scale={0.62}>
        <mesh geometry={geometry}>
          <meshLambertMaterial color={palette.body} side={THREE.DoubleSide} />
        </mesh>
        <lineSegments geometry={edges} material={edgeMat} />
      </group>
    </>
  );
}

/** Contact backdrop: a paper plane that roams, follows the cursor, and circles the "Get in touch" button. */
export default function PaperPlane({ active, reduced }: { active: boolean; reduced: boolean }) {
  useEffect(bindPointer, []);
  const coarse = isCoarsePointer();
  const { theme } = useTheme();

  return (
    <Canvas
      flat
      dpr={[1, coarse ? 1.25 : 1.75]}
      frameloop={!active ? 'never' : reduced ? 'demand' : 'always'}
      camera={{ position: [0, 0, 10], fov: 40 }}
      gl={{ antialias: true, alpha: true }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 5]} intensity={1.4} />
      <directionalLight position={[-5, -2, 3]} intensity={0.5} color="#ff4f1f" />
      <Flight reduced={reduced} theme={theme} />
    </Canvas>
  );
}
