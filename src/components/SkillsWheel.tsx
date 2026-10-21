'use client';

import { useEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { animate, useMotionValue, useMotionValueEvent } from 'framer-motion';
import { skillCategories } from '@/data/site';
import styles from './Skills.module.css';

const C = 380;
const SEG = 360 / skillCategories.length;
const GAP = 1.4;
const HUB = 66;
const RING = [78, 190] as const;
const DOT = 204;
const LABEL = 214;
// Phones drop the rim labels and crop to the ring so the category names stay legible.
const COMPACT_R = 214;

const rad = (deg: number) => (deg * Math.PI) / 180;
/** Degrees run clockwise from 12 o'clock. */
const point = (r: number, deg: number) => [C + r * Math.sin(rad(deg)), C - r * Math.cos(rad(deg))] as const;

function sector(r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = point(r1, a0);
  const [x1, y1] = point(r1, a1);
  const [x2, y2] = point(r0, a1);
  const [x3, y3] = point(r0, a0);
  return `M${x0} ${y0}A${r1} ${r1} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r0} ${r0} 0 ${large} 0 ${x3} ${y3}Z`;
}

/** Break a label at the space nearest its middle so it sits on two balanced lines. */
function lines(label: string) {
  const spaces = [...label.matchAll(/ /g)].map(m => m.index!);
  if (!spaces.length) return [label];
  const cut = spaces.reduce((a, b) => (Math.abs(b - label.length / 2) < Math.abs(a - label.length / 2) ? b : a));
  return [label.slice(0, cut), label.slice(cut + 1)];
}

/** Dark text on bright category colours (signal, ochre), light text on the rest. */
export function textOn(hex: string) {
  const [r, g, b] = [1, 3, 5].map(i => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.2 ? '#141210' : '#fffaf3';
}

const compactQuery = '(max-width: 700px)';
function useCompact() {
  return useSyncExternalStore(
    notify => {
      const query = matchMedia(compactQuery);
      query.addEventListener('change', notify);
      return () => query.removeEventListener('change', notify);
    },
    () => matchMedia(compactQuery).matches,
    () => false,
  );
}

const segments = skillCategories.map((category, i) => {
  const a0 = i * SEG - SEG / 2;
  return {
    category,
    a0,
    mid: i * SEG,
    skills: category.skills.map((skill, k) => ({ skill, deg: a0 + (SEG * (k + 0.5)) / category.skills.length })),
  };
});

interface Props {
  active: number;
  onSelect: (index: number) => void;
  reducedMotion: boolean;
}

export default function SkillsWheel({ active, onSelect, reducedMotion }: Props) {
  const compact = useCompact();
  const [hovered, setHovered] = useState<number | null>(null);
  const buttons = useRef<(SVGGElement | null)[]>([]);
  const pointer = useRef<SVGGElement>(null);
  const rotation = useMotionValue(0);
  const target = useRef(0);

  // Turn the pointer the short way round, starting from wherever it is right now.
  useEffect(() => {
    const delta = ((active * SEG - target.current) % 360 + 540) % 360 - 180;
    target.current += delta;
    if (reducedMotion) {
      rotation.set(target.current);
      return;
    }
    const spin = animate(rotation, target.current, { type: 'spring', bounce: 0.15, visualDuration: 0.5 });
    return () => spin.stop();
  }, [active, reducedMotion, rotation]);

  useMotionValueEvent(rotation, 'change', deg => {
    pointer.current?.setAttribute('transform', `rotate(${deg} ${C} ${C})`);
  });

  const onKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      const next = (index + step + segments.length) % segments.length;
      onSelect(next);
      buttons.current[next]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(index);
    }
  };

  const color = skillCategories[active].color;
  const viewBox = compact ? `${C - COMPACT_R} ${C - COMPACT_R} ${COMPACT_R * 2} ${COMPACT_R * 2}` : `0 0 ${C * 2} ${C * 2}`;

  return (
    <svg className={styles.wheel} viewBox={viewBox} role="radiogroup" aria-label="Choose a skill discipline">
      <circle cx={C} cy={C} r={HUB} className={styles.hub} />
      <text x={C} y={C - 6} className={styles.hubIndex} aria-hidden="true">0{active + 1}</text>
      <text x={C} y={C + 20} className={styles.hubCount} aria-hidden="true">{skillCategories[active].skills.length} tools</text>

      {segments.map(({ category, a0, mid }, i) => {
        const selected = i === active;
        const [x, y] = point((RING[0] + RING[1]) / 2, mid);
        const label = lines(category.label);
        return (
          <g
            key={category.id}
            ref={el => { buttons.current[i] = el; }}
            className={styles.segment}
            role="radio"
            aria-checked={selected}
            aria-label={`${category.label}, ${category.skills.length} tools`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(i)}
            onKeyDown={event => onKeyDown(event, i)}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(null)}
          >
            <path d={sector(RING[0], RING[1], a0 + GAP / 2, a0 + SEG - GAP / 2)} style={selected ? { fill: category.color, stroke: category.color } : undefined} />
            <text x={x} y={y - (label.length - 1) * 11 - 14} className={styles.segmentIndex} style={selected ? { fill: textOn(category.color) } : undefined}>0{i + 1}</text>
            <text x={x} y={y - (label.length - 1) * 11 + 10} className={styles.segmentLabel} style={selected ? { fill: textOn(category.color) } : undefined}>
              {label.map((line, l) => <tspan key={line} x={x} dy={l ? 22 : 0}>{line}</tspan>)}
            </text>
          </g>
        );
      })}

      {/* The pointer and rim arc travel together, so the eye can follow the selection round the dial. */}
      <g ref={pointer} className={styles.pointer} style={{ color }} aria-hidden="true">
        <path d={sector(RING[1] + 4, RING[1] + 7, -SEG / 2 + GAP / 2, SEG / 2 - GAP / 2)} />
        <path d={`M${C - 7} ${C - HUB + 1}L${C} ${C - HUB - 9}L${C + 7} ${C - HUB + 1}Z`} />
      </g>

      {segments.map(({ category, skills }, i) => {
        const state = i === active ? styles.skillsActive : i === hovered ? styles.skillsHovered : '';
        return (
          <g key={category.id} className={`${styles.skills} ${state}`} onClick={() => onSelect(i)} aria-hidden="true">
            {skills.map(({ skill, deg }) => {
              const [dx, dy] = point(DOT, deg);
              const flip = deg > 180 || deg < 0;
              return (
                <g key={skill}>
                  <circle cx={dx} cy={dy} r={3} style={i === active ? { fill: category.color } : undefined} />
                  {!compact && (
                    <text
                      x={flip ? C - LABEL : C + LABEL}
                      y={C}
                      textAnchor={flip ? 'end' : 'start'}
                      transform={`rotate(${flip ? deg + 90 : deg - 90} ${C} ${C})`}
                    >
                      {skill}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}
