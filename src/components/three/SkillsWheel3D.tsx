'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Billboard, ContactShadows, Edges, RoundedBox, Text, useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { skillCategories } from '@/data/site';
import { useTheme } from '@/hooks/useTheme';
import { bindPointer, pointer } from './shared';

const SANS = '/fonts/Inter-Medium.woff';

const COUNT = skillCategories.length;
const TOOLS = skillCategories.reduce((sum, category) => sum + category.skills.length, 0);
const SEG = (Math.PI * 2) / COUNT;
const GAP = 0.048;
const INNER = 0.96;
const OUTER = 2.56;
const LABEL_R = 1.78; // Dead-center in the wide body of each 60° wedge
const DEPTH = 0.22;
const BEVEL = 0.024;
const TOP_Y = DEPTH + BEVEL + 0.008; // Exact top surface of each beveled slab
const RIM_R = 2.78;
const TOTAL_TICKS = 72;

// Segment i is centred on this angle in shape space; -90° is the edge nearest the camera (front).
const mids = skillCategories.map((_, i) => -Math.PI / 2 + i * SEG);

// High-angle telephoto view: the wheel is nearly circular, uniform across all 6 wedges, with crisp 3D depth.
const OVERVIEW = {
  position: new THREE.Vector3(0, 14.5, 3.6),
  target: new THREE.Vector3(0, 0, 0.04),
  width: 6.4,
};
const FOCUS = {
  position: new THREE.Vector3(0, 14.1, 3.8),
  target: new THREE.Vector3(0, 0, 0.08),
  width: 6.3,
};
const FOV = 18;

/** Break multi-word labels into two balanced lines so they sit comfortably inside a 60° wedge. */
function formatWheelLabel(label: string) {
  const spaces = [...label.matchAll(/ /g)].map(m => m.index!);
  if (!spaces.length) return label;
  const cut = spaces.reduce((a, b) =>
    Math.abs(b - label.length / 2) < Math.abs(a - label.length / 2) ? b : a,
  );
  return `${label.slice(0, cut)}\n${label.slice(cut + 1)}`;
}

interface Palette {
  slab: string;
  slabHover: string;
  hub: string;
  platter: string;
  ink: string;
  soft: string;
  muted: string;
  edge: string;
}

const palettes: Record<'dark' | 'light', Palette> = {
  dark: {
    slab: '#1e211b',
    slabHover: '#282c24',
    hub: '#151713',
    platter: '#121410',
    ink: '#f5f1e8',
    soft: '#c7c3b8',
    muted: '#6e7167',
    edge: '#3d4138',
  },
  light: {
    slab: '#e6e0d2',
    slabHover: '#dbd3c3',
    hub: '#f4f0e6',
    platter: '#ddd6c7',
    ink: '#141210',
    soft: '#4a453d',
    muted: '#7d766a',
    edge: '#c2baa9',
  },
};

function sectorGeometry(mid: number, inner = INNER, outer = OUTER, depth = DEPTH, bevel = BEVEL) {
  const a0 = mid - SEG / 2 + GAP / 2;
  const a1 = mid + SEG / 2 - GAP / 2;
  const shape = new THREE.Shape();
  shape.absarc(0, 0, outer, a0, a1, false);
  shape.absarc(0, 0, inner, a1, a0, true);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    curveSegments: 48,
    bevelEnabled: bevel > 0,
    bevelThickness: bevel,
    bevelSize: bevel,
    bevelSegments: 3,
  });
  // Lay the slab flat: shape y becomes -z, extrusion becomes height.
  geometry.rotateX(-Math.PI / 2);
  return geometry;
}

const damp = (from: number, to: number, lambda: number, delta: number) =>
  THREE.MathUtils.damp(from, to, lambda, delta);

function Slab({
  index,
  selected,
  dimmed,
  hovered,
  highlightedSkill,
  palette,
  dark,
  onSelect,
  onHover,
  onHoverSkill,
  reducedMotion,
}: {
  index: number;
  selected: boolean;
  dimmed: boolean;
  hovered: boolean;
  highlightedSkill: string | null;
  palette: Palette;
  dark: boolean;
  onSelect: (index: number) => void;
  onHover: (index: number | null) => void;
  onHoverSkill: (skill: string | null) => void;
  reducedMotion: boolean;
}) {
  const category = skillCategories[index];
  const group = useRef<THREE.Group>(null);
  const labelGroup = useRef<THREE.Group>(null);
  const indexText = useRef<THREE.Mesh & { fillOpacity: number }>(null);
  const nameText = useRef<THREE.Mesh & { fillOpacity: number }>(null);
  const fade = useRef(1);
  const material = useRef<THREE.MeshStandardMaterial>(null);

  const geometry = useMemo(() => sectorGeometry(mids[index]), [index]);
  const rimShoulder = useMemo(
    () => sectorGeometry(mids[index], OUTER - 0.07, OUTER - 0.01, 0.006, 0),
    [index],
  );
  const formattedLabel = useMemo(() => formatWheelLabel(category.label), [category.label]);

  useEffect(() => () => {
    geometry.dispose();
    rimShoulder.dispose();
  }, [geometry, rimShoulder]);

  // Symmetrical precision tool bars along the outer rim of each sector
  const toolNodes = useMemo(() => {
    const span = SEG - GAP * 2.3;
    const start = mids[index] - span / 2;
    const count = category.skills.length;
    return category.skills.map((skill, k) => {
      const a = start + ((k + 0.5) / count) * span;
      return {
        skill,
        angle: a,
        x: Math.cos(a) * RIM_R,
        z: -Math.sin(a) * RIM_R,
      };
    });
  }, [index, category.skills]);

  // Rich architectural surface tint instead of a heavy flat neon block
  const color = useMemo(() => {
    const base = new THREE.Color(hovered ? palette.slabHover : palette.slab);
    if (selected) {
      base.lerp(new THREE.Color(category.color), dark ? 0.36 : 0.26);
    }
    return base;
  }, [selected, hovered, category.color, palette, dark]);

  const glow = useMemo(
    () => new THREE.Color(selected ? category.color : '#000000'),
    [selected, category.color],
  );
  const fadeTo = dimmed && !hovered ? 0.85 : 1;

  const bisectorX = Math.cos(mids[index]);
  const bisectorZ = -Math.sin(mids[index]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    if (group.current) {
      const height = selected ? 0.09 : hovered ? 0.035 : 0;
      const radialOut = selected ? 0.07 : hovered ? 0.025 : 0;
      group.current.position.y = reducedMotion ? height : damp(group.current.position.y, height, 8, step);
      group.current.position.x = reducedMotion
        ? bisectorX * radialOut
        : damp(group.current.position.x, bisectorX * radialOut, 8, step);
      group.current.position.z = reducedMotion
        ? bisectorZ * radialOut
        : damp(group.current.position.z, bisectorZ * radialOut, 8, step);
    }
    // Keep surface-engraved labels upright relative to the viewer at all wheel rotation angles
    if (labelGroup.current && group.current?.parent) {
      labelGroup.current.rotation.y = -group.current.parent.rotation.y;
    }
    fade.current = reducedMotion ? fadeTo : damp(fade.current, fadeTo, 8, step);
    if (indexText.current) indexText.current.fillOpacity = fade.current;
    if (nameText.current) nameText.current.fillOpacity = fade.current;
    if (material.current) {
      material.current.color.lerp(color, reducedMotion ? 1 : 1 - Math.exp(-step * 8));
      material.current.emissive.lerp(glow, reducedMotion ? 1 : 1 - Math.exp(-step * 8));
    }
  });

  const click = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onSelect(index);
  };
  const [x, z] = [bisectorX * LABEL_R, bisectorZ * LABEL_R];

  return (
    <group ref={group}>
      <mesh
        geometry={geometry}
        onClick={click}
        onPointerOver={event => {
          event.stopPropagation();
          onHover(index);
        }}
        onPointerOut={() => onHover(null)}
      >
        <meshStandardMaterial
          ref={material}
          color={palette.slab}
          emissiveIntensity={0.16}
          roughness={0.46}
          metalness={0.14}
        />
        <Edges
          threshold={24}
          color={selected ? category.color : hovered ? palette.soft : palette.edge}
        />
      </mesh>

      {/* Luminous outer shoulder arc */}
      <mesh geometry={rimShoulder} position={[0, TOP_Y, 0]}>
        <meshBasicMaterial
          color={category.color}
          transparent
          opacity={selected ? 0.95 : hovered ? 0.8 : 0.55}
        />
      </mesh>

      {/* Surface-mounted flat typography: sits directly on the slab face (TOP_Y), so it never clips into the slab or drifts across dividers */}
      <group ref={labelGroup} position={[x, TOP_Y, z]}>
        <group rotation-x={-Math.PI / 2}>
          <Text
            ref={indexText}
            font={SANS}
            fontSize={0.09}
            letterSpacing={0.14}
            position={[0, 0.21, 0]}
            color={category.color}
            anchorX="center"
            anchorY="middle"
          >
            0{index + 1}
          </Text>
          <Text
            ref={nameText}
            font={SANS}
            fontSize={0.142}
            lineHeight={1.2}
            letterSpacing={-0.015}
            textAlign="center"
            color={palette.ink}
            anchorX="center"
            anchorY="middle"
            position={[0, -0.04, 0]}
          >
            {formattedLabel}
          </Text>
        </group>
      </group>

      {/* Symmetrical radial LED tool markers along the outer precision ring */}
      {toolNodes.map(node => {
        const isSkillFocused = highlightedSkill === node.skill;
        return (
          <group
            key={node.skill}
            position={[node.x, DEPTH * 0.5, node.z]}
            onClick={e => {
              e.stopPropagation();
              onSelect(index);
              onHoverSkill(node.skill);
            }}
            onPointerOver={e => {
              e.stopPropagation();
              onHoverSkill(node.skill);
            }}
            onPointerOut={() => onHoverSkill(null)}
          >
            {/* Radial capsule marker */}
            <mesh rotation={[-Math.PI / 2, 0, node.angle]}>
              <planeGeometry
                args={[
                  isSkillFocused ? 0.24 : selected ? 0.16 : 0.1,
                  isSkillFocused ? 0.065 : selected ? 0.042 : 0.024,
                ]}
              />
              <meshBasicMaterial
                color={selected || hovered || isSkillFocused ? category.color : palette.muted}
                transparent
                opacity={isSkillFocused ? 1 : selected ? 0.95 : hovered ? 0.7 : 0.42}
              />
            </mesh>

            {/* Glowing outer tip dot when sector is active */}
            {(selected || isSkillFocused) && (
              <mesh
                position={[
                  Math.cos(node.angle) * (isSkillFocused ? 0.16 : 0.11),
                  0.01,
                  -Math.sin(node.angle) * (isSkillFocused ? 0.16 : 0.11),
                ]}
                rotation-x={-Math.PI / 2}
              >
                <circleGeometry args={[isSkillFocused ? 0.042 : 0.024, 16]} />
                <meshBasicMaterial color={category.color} />
              </mesh>
            )}

            {/* Single crisp floating callout pill when a tool is hovered in the list or on the rim */}
            {isSkillFocused && (
              <Billboard position={[0, 0.28, 0]}>
                <RoundedBox
                  args={[Math.max(0.84, node.skill.length * 0.075), 0.22, 0.03]}
                  radius={0.05}
                  smoothness={3}
                >
                  <meshBasicMaterial color={palette.hub} />
                  <Edges color={category.color} />
                </RoundedBox>
                <Text
                  font={SANS}
                  fontSize={0.095}
                  color={palette.ink}
                  anchorX="center"
                  anchorY="middle"
                  position={[0, 0, 0.02]}
                >
                  {node.skill}
                </Text>
              </Billboard>
            )}
          </group>
        );
      })}
    </group>
  );
}

/**
 * Precision concentric degree dial that rotates WITH the wheel so major divider ticks
 * always align with the exact boundaries between the 6 sectors (-90° + SEG/2 + i*SEG).
 */
function DegreeRing({ palette }: { palette: Palette }) {
  const ticks = useMemo(
    () =>
      Array.from({ length: TOTAL_TICKS }, (_, i) => {
        // Offset by SEG / 2 so i = 0, 12, 24, 36, 48, 60 land on the 6 sector divider gaps!
        const angle = -Math.PI / 2 + SEG / 2 + (i / TOTAL_TICKS) * Math.PI * 2;
        const isDivider = i % (TOTAL_TICKS / COUNT) === 0;
        const r = OUTER + 0.11;
        return {
          i,
          x: Math.cos(angle) * r,
          z: -Math.sin(angle) * r,
          angle,
          len: isDivider ? 0.11 : 0.036,
          thick: isDivider ? 0.022 : 0.008,
          isDivider,
        };
      }),
    [],
  );

  return (
    <group position={[0, 0.02, 0]}>
      {/* Inner track just outside the sectors */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <ringGeometry args={[OUTER + 0.06, OUTER + 0.072, 160]} />
        <meshBasicMaterial color={palette.edge} transparent opacity={0.55} />
      </mesh>
      {/* Outer framing bezel around the radial LED tool markers */}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <ringGeometry args={[RIM_R + 0.15, RIM_R + 0.166, 160]} />
        <meshBasicMaterial color={palette.edge} transparent opacity={0.42} />
      </mesh>

      {ticks.map(t => (
        <mesh
          key={t.i}
          position={[t.x, 0, t.z]}
          rotation={[-Math.PI / 2, 0, t.angle]}
        >
          <planeGeometry args={[t.len, t.thick]} />
          <meshBasicMaterial
            color={t.isDivider ? palette.soft : palette.edge}
            transparent
            opacity={t.isDivider ? 0.75 : 0.35}
          />
        </mesh>
      ))}
    </group>
  );
}

function Scene({
  active,
  highlightedSkill,
  onSelect,
  onHoverSkill,
  palette,
  dark,
  reducedMotion,
}: {
  active: number | null;
  highlightedSkill: string | null;
  onSelect: (index: number | null) => void;
  onHoverSkill: (skill: string | null) => void;
  palette: Palette;
  dark: boolean;
  reducedMotion: boolean;
}) {
  const assembly = useRef<THREE.Group>(null);
  const wheel = useRef<THREE.Group>(null);
  const angle = useRef(0);
  const goal = useRef(0);
  const look = useRef(OVERVIEW.target.clone());
  const desired = useMemo(() => new THREE.Vector3(), []);
  const [hovered, setHovered] = useState<number | null>(null);
  const { camera, size } = useThree();
  useCursor(hovered !== null || highlightedSkill !== null);

  useEffect(() => {
    bindPointer();
  }, []);

  // Spin the short way round so the chosen slab locks to the front indicator (-90°).
  useEffect(() => {
    if (active === null) return;
    const delta =
      THREE.MathUtils.euclideanModulo(-active * SEG - angle.current + Math.PI, Math.PI * 2) -
      Math.PI;
    goal.current = angle.current + delta;
  }, [active]);

  useFrame((_, delta) => {
    const step = Math.min(delta, 0.05);
    if (active === null) {
      if (!reducedMotion && hovered === null && highlightedSkill === null) {
        angle.current += step * 0.075;
        goal.current = angle.current;
      }
    } else {
      angle.current = reducedMotion ? goal.current : damp(angle.current, goal.current, 6.5, step);
    }
    if (wheel.current) wheel.current.rotation.y = angle.current;

    // Subtle tactile tilt in response to cursor position
    if (assembly.current) {
      const tiltX = reducedMotion ? 0 : pointer.y * -0.025;
      const tiltZ = reducedMotion ? 0 : pointer.x * -0.025;
      assembly.current.rotation.x = damp(assembly.current.rotation.x, tiltX, 5, step);
      assembly.current.rotation.z = damp(assembly.current.rotation.z, tiltZ, 5, step);
    }

    const view = active === null ? OVERVIEW : FOCUS;
    desired.copy(view.position).sub(view.target);
    const aspect = size.width / Math.max(size.height, 1);
    const needed =
      view.width / (2 * Math.tan(THREE.MathUtils.degToRad(FOV / 2)) * Math.min(aspect, 1.08));
    desired.setLength(Math.max(desired.length(), needed)).add(view.target);
    const ease = reducedMotion ? 1 : 1 - Math.exp(-step * 5.5);
    camera.position.lerp(desired, ease);
    look.current.lerp(view.target, ease);
    camera.lookAt(look.current);
  });

  const activeCategory = active === null ? null : skillCategories[active];
  const accent = activeCategory ? activeCategory.color : palette.soft;
  const hubTopY = DEPTH + 0.088;

  return (
    <>
      <ambientLight intensity={dark ? 1.35 : 1.7} />
      <directionalLight position={[4, 10, 5]} intensity={dark ? 2.4 : 2.7} color="#fff4e2" />
      <directionalLight position={[-6, 5, -4]} intensity={1.15} color="#b9cde6" />

      <group ref={assembly}>
        <group ref={wheel}>
          {skillCategories.map((category, i) => (
            <Slab
              key={category.id}
              index={i}
              selected={i === active}
              dimmed={active !== null && i !== active}
              hovered={i === hovered}
              highlightedSkill={highlightedSkill}
              palette={palette}
              dark={dark}
              onSelect={onSelect}
              onHover={setHovered}
              onHoverSkill={onHoverSkill}
              reducedMotion={reducedMotion}
            />
          ))}
          <DegreeRing palette={palette} />
        </group>

        {/* Recessed base platter */}
        <mesh position={[0, -0.03, 0]}>
          <cylinderGeometry args={[OUTER + 0.04, OUTER + 0.08, 0.04, 96]} />
          <meshStandardMaterial color={palette.platter} roughness={0.8} metalness={0.08} />
        </mesh>

        {/* Central precision tachometer hub */}
        <mesh position={[0, (DEPTH + 0.08) / 2, 0]}>
          <cylinderGeometry args={[INNER - 0.08, INNER - 0.04, DEPTH + 0.08, 64]} />
          <meshStandardMaterial color={palette.hub} roughness={0.5} metalness={0.15} />
          <Edges threshold={25} color={palette.edge} />
        </mesh>

        {/* Hub inner accent ring */}
        <mesh position={[0, hubTopY, 0]} rotation-x={-Math.PI / 2}>
          <ringGeometry args={[INNER - 0.22, INNER - 0.185, 64]} />
          <meshBasicMaterial color={accent} transparent opacity={active === null ? 0.35 : 0.9} />
        </mesh>

        {/* Surface-mounted central hub readout */}
        <group position={[0, hubTopY + 0.006, 0]} rotation-x={-Math.PI / 2}>
          <Text
            font={SANS}
            fontSize={0.42}
            color={palette.ink}
            anchorX="center"
            anchorY="middle"
            position={[0, 0.08, 0]}
          >
            {active === null ? String(TOOLS) : `0${active + 1}`}
          </Text>
          <Text
            font={SANS}
            fontSize={0.08}
            letterSpacing={0.14}
            color={active === null ? palette.soft : accent}
            fillOpacity={0.92}
            anchorX="center"
            anchorY="middle"
            position={[0, -0.22, 0]}
          >
            {active === null
              ? 'TOTAL TOOLS'
              : `${activeCategory!.skills.length} TOOLS`}
          </Text>
        </group>

        {/* Front 6-o'clock indicator pointer locking onto the active slice */}
        <mesh
          position={[0, hubTopY + 0.01, INNER - 0.02]}
          rotation-x={Math.PI / 2}
          visible={active !== null}
        >
          <coneGeometry args={[0.075, 0.18, 3]} />
          <meshBasicMaterial color={accent} />
        </mesh>
      </group>

      <ContactShadows
        frames={1}
        position-y={-0.06}
        scale={8.2}
        blur={2.6}
        far={1.6}
        opacity={dark ? 0.68 : 0.3}
        resolution={256}
      />
    </>
  );
}

export default function SkillsWheel3D({
  active,
  highlightedSkill = null,
  onSelect,
  onHoverSkill = () => {},
  visible,
  reducedMotion,
}: {
  active: number | null;
  highlightedSkill?: string | null;
  onSelect: (index: number | null) => void;
  onHoverSkill?: (skill: string | null) => void;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const { theme } = useTheme();
  const dark = theme === 'dark';
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ position: OVERVIEW.position.toArray(), fov: FOV }}
      gl={{ antialias: true, alpha: true }}
      style={{ touchAction: 'pan-y' }}
      onPointerMissed={() => onSelect(null)}
    >
      <Scene
        active={active}
        highlightedSkill={highlightedSkill}
        onSelect={onSelect}
        onHoverSkill={onHoverSkill}
        palette={palettes[dark ? 'dark' : 'light']}
        dark={dark}
        reducedMotion={reducedMotion}
      />
    </Canvas>
  );
}
