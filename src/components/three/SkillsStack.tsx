'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Edges, OrbitControls, RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { skillCategories } from '@/data/site';
import { useTheme } from '@/hooks/useTheme';
import { isCoarsePointer } from './shared';

const SIGNAL = '#ff683b';
const PINS = Array.from({ length: 8 }, (_, i) => {
  const angle = (i / 8) * Math.PI * 2 + Math.PI / 8;
  return [Math.cos(angle) * 0.94, Math.sin(angle) * 0.78] as const;
});

interface Props {
  active: number;
  onSelect: (index: number) => void;
  visible: boolean;
  paused: boolean;
  reducedMotion: boolean;
  view: number;
}

function Core({ index, selected, dark }: { index: number; selected: boolean; dark: boolean }) {
  const color = selected ? SIGNAL : dark ? '#8d9996' : '#59615b';
  const material = <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} emissive={selected ? '#ff400a' : '#000000'} emissiveIntensity={0.18} />;
  if (index === 0) return (
    <group position={[0, 0.31, 0]}>
      <mesh><icosahedronGeometry args={[0.29, 1]} />{material}<Edges color={selected ? '#ffbf8f' : '#a4b5ae'} /></mesh>
      <mesh rotation={[Math.PI / 2, 0.3, 0]}><torusGeometry args={[0.42, 0.009, 6, 48]} /><meshBasicMaterial color={color} /></mesh>
    </group>
  );
  if (index === 1) return (
    <group>{Array.from({ length: 9 }, (_, i) => <mesh key={i} position={[(i % 3 - 1) * 0.23, 0.18 + (i % 3) * 0.045, (Math.floor(i / 3) - 1) * 0.23]}><boxGeometry args={[0.15, 0.16 + (i % 3) * 0.09, 0.15]} />{material}</mesh>)}</group>
  );
  if (index === 2) return (
    <group position={[0, 0.27, 0]} rotation={[0, 0, 0.15]}>{[-0.12, 0.12].map((z, i) => <mesh key={i} position={[i * 0.13 - 0.06, 0, z]}><boxGeometry args={[0.6, 0.4, 0.04]} />{material}<Edges color={selected ? '#ffd3ad' : '#adc0b5'} /></mesh>)}</group>
  );
  if (index === 3) return (
    <group>{[0.13, 0.26, 0.39].map(y => <mesh key={y} position={[0, y, 0]}><cylinderGeometry args={[0.31, 0.31, 0.09, 32]} />{material}</mesh>)}</group>
  );
  if (index === 4) return (
    <group position={[0, 0.3, 0]} rotation={[0, Math.PI / 4, 0]}>{[-0.22, 0.22].map((x, i) => <mesh key={x} position={[x, i * 0.12, 0]}><boxGeometry args={[0.3, 0.3, 0.3]} />{material}<Edges color={selected ? '#ffcb9f' : '#adc0b5'} /></mesh>)}</group>
  );
  return (
    <mesh position={[0, 0.22, 0]} rotation={[0, Math.PI / 4, 0]}><octahedronGeometry args={[0.36]} />{material}<Edges color={selected ? '#ffd0a3' : '#adc0b5'} /></mesh>
  );
}

function LayerNumber({ index, selected, dark }: { index: number; selected: boolean; dark: boolean }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const context = canvas.getContext('2d')!;
    context.fillStyle = selected ? '#ff683b' : dark ? '#202722' : '#e9e5d9';
    context.fillRect(0, 0, 128, 64);
    context.fillStyle = selected ? '#171510' : dark ? '#b8c1b7' : '#545a50';
    context.font = '30px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(`0${index + 1}`, 64, 33);
    const map = new THREE.CanvasTexture(canvas);
    map.colorSpace = THREE.SRGBColorSpace;
    return map;
  }, [index, selected, dark]);
  useEffect(() => () => texture.dispose(), [texture]);
  return <sprite position={[-1.34, 0, 1.1]} scale={[0.34, 0.17, 1]}><spriteMaterial map={texture} depthTest={false} /></sprite>;
}

function Layer({ index, selected, onSelect, dark, reducedMotion }: {
  index: number; selected: boolean; onSelect: Props['onSelect']; dark: boolean; reducedMotion: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  const y = (2.5 - index) * 0.69;
  const circuit = useMemo(() => {
    const positions: number[] = [];
    PINS.forEach(([x, z]) => {
      positions.push(x, 0.076, z, x * 0.55, 0.076, z, x * 0.55, 0.076, z, x * 0.55, 0.076, z * 0.4, x * 0.55, 0.076, z * 0.4, 0, 0.076, z * 0.4);
    });
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    return geometry;
  }, []);
  useEffect(() => () => circuit.dispose(), [circuit]);
  const { invalidate } = useThree();

  useFrame((_, delta) => {
    if (!group.current) return;
    const targetX = selected ? -0.65 : 0;
    const targetZ = selected ? 0.85 : hovered ? 0.12 : 0;
    const position = group.current.position;
    const step = Math.min(delta, 0.05);
    position.x = reducedMotion ? targetX : THREE.MathUtils.damp(position.x, targetX, 7, step);
    position.z = reducedMotion ? targetZ : THREE.MathUtils.damp(position.z, targetZ, 7, step);
    if (Math.abs(position.x - targetX) + Math.abs(position.z - targetZ) > 0.001) invalidate();
  });

  const activate = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    // Orbit drags should never accidentally select the layer under their release point.
    if (event.delta < 6) onSelect(index);
  };
  const edge = selected ? SIGNAL : hovered ? '#d6b99d' : dark ? '#58605b' : '#a4a59a';

  return (
    <group ref={group} position={[0, y, 0]} onClick={activate}
      onPointerOver={event => { event.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}>
      <RoundedBox args={[2.5, 0.12, 2.12]} radius={0.065} smoothness={3}>
        <meshStandardMaterial color={selected ? dark ? '#50362b' : '#d7a98e' : dark ? '#28312e' : '#c9c9b9'} metalness={0.55} roughness={0.42} />
        <Edges color={edge} threshold={25} />
      </RoundedBox>
      <lineSegments geometry={circuit}><lineBasicMaterial color={selected ? SIGNAL : dark ? '#5f746a' : '#7b8e7d'} transparent opacity={selected ? 0.95 : 0.65} /></lineSegments>
      <Core index={index} selected={selected} dark={dark} />
      {PINS.slice(0, skillCategories[index].skills.length).map(([x, z], pin) => (
        <group key={pin} position={[x, 0.12, z]}>
          <mesh><boxGeometry args={[0.16, 0.09, 0.12]} /><meshStandardMaterial color={dark ? '#111b17' : '#8d978a'} metalness={0.55} roughness={0.4} /></mesh>
          <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.09, 0.055]} /><meshBasicMaterial color={selected ? SIGNAL : '#91a391'} /></mesh>
        </group>
      ))}
      {/* A lit front edge makes the selected layer legible from a distance. */}
      <mesh position={[0, -0.01, 1.064]}><boxGeometry args={[selected ? 1.8 : 0.5, 0.018, 0.008]} /><meshBasicMaterial color={selected ? SIGNAL : edge} /></mesh>
      <LayerNumber index={index} selected={selected} dark={dark} />
    </group>
  );
}

function Assembly({ active, onSelect, paused, reducedMotion, dark }: Omit<Props, 'visible' | 'view'> & { dark: boolean }) {
  const halo = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (halo.current && !paused) halo.current.rotation.y += Math.min(delta, 0.05) * 0.13;
  });
  return (
    <group position={[-0.2, 0.15, 0]}>
      {/* Four slim guide rails hold the exploded layers in one coherent assembly. */}
      {[-1, 1].flatMap(x => [-0.85, 0.85].map(z => <mesh key={`${x}-${z}`} position={[x, -0.1, z]}><cylinderGeometry args={[0.008, 0.008, 4.7, 6]} /><meshBasicMaterial color={dark ? '#617166' : '#a0a797'} transparent opacity={0.35} /></mesh>))}
      {skillCategories.map((category, index) => <Layer key={category.id} index={index} selected={index === active} onSelect={onSelect} dark={dark} reducedMotion={reducedMotion} />)}
      <group position={[0, -2.43, 0]}>
        <mesh><cylinderGeometry args={[1.85, 1.9, 0.09, 80]} /><meshStandardMaterial color={dark ? '#202822' : '#d9d5c6'} metalness={0.55} roughness={0.65} /></mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}><ringGeometry args={[1.66, 1.675, 80]} /><meshBasicMaterial color={dark ? '#677267' : '#a5ac9a'} /></mesh>
        <group ref={halo}>
          {Array.from({ length: 32 }, (_, i) => {
            const angle = i / 32 * Math.PI * 2;
            return <mesh key={i} position={[Math.cos(angle) * 1.77, 0.055, Math.sin(angle) * 1.77]} rotation={[-Math.PI / 2, 0, angle]}><planeGeometry args={[i % 8 === 0 ? 0.12 : 0.04, 0.012]} /><meshBasicMaterial color={i % 8 === 0 ? SIGNAL : dark ? '#718171' : '#8d9784'} /></mesh>;
          })}
        </group>
      </group>
    </group>
  );
}

function ViewReset({ view }: { view: number }) {
  const { camera, controls, invalidate } = useThree();
  useEffect(() => {
    const orbit = controls as unknown as { enableDamping: boolean; update: () => void } | null;
    const damping = orbit?.enableDamping ?? false;
    // Consume any remaining drag momentum before restoring the original viewpoint.
    if (orbit) {
      orbit.enableDamping = false;
      orbit.update();
    }
    camera.position.set(6.5, 4.2, 8.2);
    camera.lookAt(0, 0, 0);
    if (orbit) {
      orbit.update();
      orbit.enableDamping = damping;
    }
    invalidate();
  }, [view, camera, controls, invalidate]);
  return null;
}

export default function SkillsStack({ active, onSelect, visible, paused, reducedMotion, view }: Props) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  const coarse = isCoarsePointer();
  return (
    <Canvas dpr={[1, 1.5]} frameloop={visible ? paused ? 'demand' : 'always' : 'never'}
      camera={{ position: [6.5, 4.2, 8.2], fov: 38 }} gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      fallback={<div style={{ padding: '3rem', color: 'var(--color-ink-soft)' }}>Choose a discipline below to explore the tools.</div>}>
      <ambientLight intensity={dark ? 1.3 : 1.8} />
      <directionalLight position={[3, 7, 5]} intensity={3} color="#fff0d6" />
      <directionalLight position={[-5, 2, -3]} intensity={2.5} color="#afc8e0" />
      <pointLight position={[3, 0, 3]} intensity={7} color="#ff652b" />
      <Assembly active={active} onSelect={onSelect} paused={paused} reducedMotion={reducedMotion} dark={dark} />
      <ViewReset view={view} />
      <OrbitControls makeDefault enableZoom={false} enablePan={false} enableRotate={!coarse} enableDamping={!reducedMotion}
        minPolarAngle={Math.PI / 3.7} maxPolarAngle={Math.PI / 2.2} minAzimuthAngle={-Math.PI / 3} maxAzimuthAngle={Math.PI / 2.5} rotateSpeed={0.65} target={[0, 0, 0]} />
    </Canvas>
  );
}
