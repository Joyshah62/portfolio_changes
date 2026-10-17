'use client';

import { useEffect, useMemo, useRef, type ComponentRef, type RefObject } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { skillCategories } from '@/data/site';
import { isCoarsePointer } from './shared';
import { useTheme } from '@/hooks/useTheme';
import type { Theme } from '@/utils/theme';

const RADIUS = 2.15;
const CAP = THREE.MathUtils.degToRad(40);
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

interface Node {
  label: string;
  category: string;
  color: string;
  dir: THREE.Vector3;
}

/** One category per octahedron face-direction; skills spiral out across a spherical cap. */
function buildNodes() {
  const centers = [
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1),
  ];
  const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.55, 0.4, 0.3));
  const nodes: Node[] = [];
  const centroids: Record<string, THREE.Vector3> = {};

  skillCategories.forEach((cat, ci) => {
    const center = centers[ci % centers.length].clone().applyQuaternion(tilt);
    centroids[cat.id] = center.clone();
    const up = Math.abs(center.y) < 0.95 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0);
    const tangent = new THREE.Vector3().crossVectors(center, up).normalize();
    const n = cat.skills.length;
    cat.skills.forEach((label, k) => {
      const polar = CAP * Math.sqrt((k + 0.5) / n);
      const azimuth = k * GOLDEN;
      const dir = center.clone()
        .applyAxisAngle(tangent, polar)
        .applyAxisAngle(center, azimuth)
        .normalize();
      nodes.push({ label, category: cat.id, color: cat.color, dir });
    });
  });
  return { nodes, centroids };
}

type Built = ReturnType<typeof buildNodes>;

function Globe({
  active,
  nodes,
  centroids,
  labels,
  theme,
}: Built & { active: string | null; labels: RefObject<(HTMLDivElement | null)[]>; theme: Theme }) {
  const dots = useRef<(THREE.Mesh | null)[]>([]);
  const controls = useRef<ComponentRef<typeof OrbitControls>>(null);
  const shell = useRef<THREE.Group>(null);
  const focus = useRef<THREE.Vector3 | null>(null);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const proj = useMemo(() => new THREE.Vector3(), []);
  const { camera, size } = useThree();

  useEffect(() => {
    focus.current = active ? centroids[active].clone() : null;
  }, [active, centroids]);

  // Spokes from the core to every node of the active category
  const spokes = useMemo(() => {
    const pts: number[] = [];
    nodes.forEach((n) => {
      if (n.category !== active) return;
      pts.push(0, 0, 0, n.dir.x * RADIUS, n.dir.y * RADIUS, n.dir.z * RADIUS);
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    return geo;
  }, [nodes, active]);

  const ink = theme === 'dark' ? '#ede8dd' : '#141210';
  const activeColor = active ? skillCategories.find((c) => c.id === active)!.color : ink;

  useFrame((_, delta) => {
    // Swing the camera round to face the selected category
    if (focus.current) {
      const dist = camera.position.length();
      const target = focus.current.clone().multiplyScalar(dist);
      camera.position.lerp(target, 1 - Math.exp(-delta * 3));
      camera.position.setLength(dist);
      controls.current?.update();
      // Hand control back to the visitor once we're facing it
      if (camera.position.angleTo(target) < 0.03) focus.current = null;
    }

    camDir.copy(camera.position).normalize();
    nodes.forEach((n, i) => {
      const facing = n.dir.dot(camDir);
      const vis = THREE.MathUtils.smoothstep(facing, -0.35, 0.55);
      const isActive = active === n.category;
      const dim = active && !isActive;
      const el = labels.current[i];
      if (el) {
        // Project the node to screen space and place its DOM label just below it
        proj.copy(n.dir).multiplyScalar(RADIUS).project(camera);
        const x = (proj.x * 0.5 + 0.5) * size.width;
        const y = (-proj.y * 0.5 + 0.5) * size.height + 9;
        const scale = 0.7 + vis * 0.35 + (isActive ? 0.1 : 0);
        el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, 0) scale(${scale})`;
        el.style.opacity = String(dim ? vis * 0.32 : vis);
        el.style.zIndex = String(Math.round(facing * 100) + 100);
      }
      const dot = dots.current[i];
      if (dot) dot.scale.setScalar(THREE.MathUtils.damp(dot.scale.x, isActive ? 1.8 : dim ? 0.6 : 1, 6, delta));
    });

    if (shell.current) shell.current.rotation.y += delta * 0.05;
  });

  return (
    <>
      <OrbitControls
        ref={controls}
        enableZoom={false}
        enablePan={false}
        enableRotate={!isCoarsePointer()}
        autoRotate={!active}
        autoRotateSpeed={0.7}
        rotateSpeed={0.6}
        enableDamping
        // Grabbing the globe mid-swing hands control straight back to the visitor
        onStart={() => {
          focus.current = null;
        }}
      />

      <group ref={shell}>
        <mesh>
          <icosahedronGeometry args={[RADIUS * 0.92, 2]} />
          <meshBasicMaterial color={ink} wireframe transparent opacity={0.1} />
        </mesh>
        {[0, Math.PI / 3, -Math.PI / 3].map((r, i) => (
          <mesh key={i} rotation={[Math.PI / 2, r, 0]}>
            <torusGeometry args={[RADIUS, 0.003, 6, 180]} />
            <meshBasicMaterial color={ink} transparent opacity={0.18} />
          </mesh>
        ))}
      </group>

      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshBasicMaterial color={activeColor} />
      </mesh>

      <lineSegments geometry={spokes}>
        <lineBasicMaterial color={activeColor} transparent opacity={0.55} />
      </lineSegments>

      {nodes.map((n, i) => {
        return (
          <group key={`${n.category}-${n.label}`} position={n.dir.clone().multiplyScalar(RADIUS)}>
            <mesh ref={(el) => { dots.current[i] = el; }}>
              <sphereGeometry args={[0.035, 12, 12]} />
              <meshBasicMaterial color={n.color} />
            </mesh>
          </group>
        );
      })}
    </>
  );
}

/** Dark text on bright category colours (signal, ochre), light text on the rest. */
function textOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? '#141210' : '#fffaf3';
}

export default function SkillsGlobe({ active, visible }: { active: string | null; visible: boolean }) {
  const { theme } = useTheme();
  const built = useMemo(() => buildNodes(), []);
  const labels = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <>
      <Canvas
        flat
        dpr={[1, 2]}
        frameloop={visible ? 'always' : 'never'}
        camera={{ position: [0, 0.6, 6.6], fov: 42 }}
        gl={{ antialias: true, alpha: true }}
        style={{ position: 'absolute', inset: 0, touchAction: 'pan-y' }}
      >
        <Globe active={active} labels={labels} theme={theme} {...built} />
      </Canvas>

      {/* Labels live in the page's own React tree; the scene only moves them */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {built.nodes.map((n, i) => {
          const isActive = active === n.category;
          return (
            <div
              key={`${n.category}-${n.label}`}
              ref={(el) => { labels.current[i] = el; }}
              className="absolute left-0 top-0 origin-top select-none whitespace-nowrap rounded-full px-2 py-0.5 font-mono text-[11px] leading-tight opacity-0 transition-colors duration-300 will-change-transform"
              style={{
                color: isActive ? textOn(n.color) : 'var(--color-ink)',
                background: isActive ? n.color : 'color-mix(in srgb, var(--color-card) 90%, transparent)',
                border: `1px solid ${isActive ? n.color : 'var(--color-line)'}`,
              }}
            >
              {n.label}
            </div>
          );
        })}
      </div>
    </>
  );
}
