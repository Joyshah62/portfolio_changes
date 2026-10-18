'use client';

import { Component, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring } from 'framer-motion';
import { flowShock, useInViewport } from './three/shared';
import { flowWords, formAt } from '@/data/flowMotion';

const FlowScene = dynamic(() => import('./three/FlowScene'), { ssr: false });
const noopSubscribe = () => () => {};

// Purely decorative, so a device without float render targets just loses the scene
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

const captions = ['Every project starts as noise.', 'Then it gets structure.', 'Then it ships.'];

/** A pinned interlude: ~160k GPU-simulated particles drift on curl noise and condense into words as you scroll. */
export default function FlowField() {
  const ref = useRef<HTMLElement>(null);
  const visible = useInViewport(ref, '0px');
  const prefersReduced = useReducedMotion() ?? false;
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 160, damping: 30, mass: 0.8, restDelta: 0.0001 });
  const [word, setWord] = useState<number | null>(null);
  const wordRef = useRef<number | null>(null);
  useMotionValueEvent(p, 'change', (v) => {
    const { index, form } = formAt(v);
    const next = form > 0.5 ? index : null;
    if (next !== wordRef.current) { wordRef.current = next; setWord(next); }
  });

  // The whole section is motion; without it there's nothing to show
  if (hydrated && prefersReduced) return null;

  return (
    <section ref={ref} data-surface="fixed" aria-label="Interlude" className="relative h-[320svh] bg-ink text-paper">
      <div
        className="sticky top-0 h-[100svh] cursor-crosshair overflow-hidden"
        onPointerDown={(e) => Object.assign(flowShock, { x: e.clientX, y: e.clientY, t: 1 })}
      >
        <div aria-hidden="true" className="absolute inset-0">
          <SceneBoundary>
            <FlowScene progress={p} active={visible} />
          </SceneBoundary>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgb(20_18_16/0.85)_100%)]" />

        <div className="pointer-events-none relative mx-auto flex h-full max-w-[1400px] flex-col justify-between px-4 py-24 sm:px-8 md:py-28">
          <div className="flex items-center justify-between">
            <span className="eyebrow text-paper/60">(✳) Interlude</span>
            <span className="eyebrow text-paper/40">
              {flowWords.map((w, i) => (
                <span key={w} className={`transition-colors duration-500 ${word === i ? 'text-signal' : ''}`}>
                  {String(i + 1).padStart(2, '0')}{i < flowWords.length - 1 && <span className="mx-2 text-paper/25">—</span>}
                </span>
              ))}
            </span>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="grid">
              {captions.map((c, i) => (
                <motion.p
                  key={c}
                  initial={false}
                  animate={{ opacity: word === i ? 1 : 0, y: word === i ? 0 : 12 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="max-w-xs font-serif text-[clamp(1.3rem,2.2vw,1.9rem)] italic leading-tight text-paper/80 [grid-area:1/1]"
                >
                  {c}
                </motion.p>
              ))}
            </div>
            <span className="eyebrow hidden text-right text-paper/40 sm:block">
              Move to stir<br />Click to scatter
            </span>
          </div>
        </div>

        {/* Screen readers get the words the particles spell */}
        <p className="sr-only">{flowWords.join(' ')}</p>
      </div>
    </section>
  );
}
