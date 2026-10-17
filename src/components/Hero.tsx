'use client';

import { Component, useCallback, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import {
  motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { contact, heroBeats } from '@/data/site';
import { heroMotion } from '@/data/heroMotion';
import { useInViewport } from './three/shared';

const noopSubscribe = () => () => {};
import { scrollToSection } from '@/utils/scroll';
import LoadingIntro from './LoadingIntro';

const MorphScene = dynamic(() => import('./three/MorphScene'), { ssr: false });
const entrance = { type: 'spring' as const, stiffness: 100, damping: 25, mass: 1 };

// Keep the landing page usable if a device cannot create a WebGL context.
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function ProjectLinks({ focusable = true }: { focusable?: boolean }) {
  return (
    <div className="hero-links">
      <a
        href="#projects"
        tabIndex={focusable ? 0 : -1}
        onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}
        className="hero-project-link group"
      >
        Selected work <ArrowUpRight size={18} className="transition-transform group-hover:rotate-45" />
      </a>
      <a href={contact.resume} tabIndex={focusable ? 0 : -1} target="_blank" rel="noopener noreferrer" className="hero-resume-link">
        Résumé <ArrowUpRight size={14} />
      </a>
    </div>
  );
}

function Intro({ reduced, focusable, ready }: { reduced: boolean; focusable: boolean; ready: boolean }) {
  return (
    <div className="hero-intro-copy">
      <motion.p
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: ready ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        className="hero-kicker"
      >
        <span className="hero-status-dot" /> Software engineer & applied AI
      </motion.p>
      <h1 className="hero-name" aria-label="Joy Shah">
        {['JOY', 'SHAH'].map((word, i) => (
          <span key={word} className="hero-name-line" aria-hidden="true">
            <motion.span
              initial={reduced ? false : { y: '110%', rotate: 5 }}
              animate={{ y: ready ? '0%' : '110%', rotate: ready ? 0 : 5 }}
              transition={{ ...entrance, delay: i * 0.09 }}
            >{word}<span className="hero-name-period">{i === 1 ? '.' : ''}</span></motion.span>
          </span>
        ))}
      </h1>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 16 }}
        transition={{ ...entrance, delay: 0.2 }}
      >
        <p className="hero-tagline">A little logic. <em>A lot of possibility.</em></p>
        <ProjectLinks focusable={focusable} />
      </motion.div>
    </div>
  );
}

function Beat({ p, index, active }: { p: MotionValue<number>; index: number; active: boolean }) {
  const beat = heroBeats[index];
  const center = heroMotion.beats[index];
  const range = [center - 0.075, center - 0.05, center + 0.05, center + 0.075];
  const opacity = useTransform(p, range, [0, 1, 1, 0]);
  const y = useTransform(p, range, [24, 0, 0, -24]);
  const titles = [<>Built for <em>people.</em></>, <>Powered by <em>curiosity.</em></>, <>Made to <em>protect.</em></>];
  const details = ['Composur / Voice interview practice', 'CodeBench / AI teaching agents', 'Forenzy / Intelligent threat detection'];

  return (
    <motion.div aria-hidden={!active} style={{ opacity, y }} className="[grid-area:1/1]">
      <p className="hero-kicker mb-6"><span className="text-signal">{beat.index}</span> / {beat.layer}</p>
      <h2 className="hero-beat-title">{titles[index]}</h2>
      <p className="hero-beat-detail">{details[index]}</p>
    </motion.div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const introSlot = useRef<HTMLDivElement>(null);
  const beatSlot = useRef<HTMLDivElement>(null);
  const outroSlot = useRef<HTMLDivElement>(null);
  const visible = useInViewport(ref, '0px');
  // The server can't know the motion preference, so hydrate as 'full motion' and switch right after
  const prefersReduced = useReducedMotion() ?? false;
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const reduced = hydrated && prefersReduced;
  const [sceneReady, setSceneReady] = useState(false);
  const [entered, setEntered] = useState(false);
  const onSceneReady = useCallback(() => setSceneReady(true), []);
  const onEntered = useCallback(() => setEntered(true), []);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const p = useSpring(scrollYProgress, { stiffness: 180, damping: 30, mass: 0.8, restDelta: 0.0001 });
  const [phase, setPhase] = useState('intro');
  const [activeBeat, setActiveBeat] = useState(0);
  const activeBeatRef = useRef(0);
  const phaseRef = useRef('intro');
  useMotionValueEvent(p, 'change', (value) => {
    const next = value < 0.18 ? 'intro' : value < 0.9 ? 'beats' : 'outro';
    if (next !== phaseRef.current) { phaseRef.current = next; setPhase(next); }
    const beat = value < 0.48 ? 0 : value < 0.64 ? 1 : 2;
    if (beat !== activeBeatRef.current) { activeBeatRef.current = beat; setActiveBeat(beat); }
  });

  const introOpacity = useTransform(p, [0, 0.12, 0.24], [1, 1, 0]);
  const introY = useTransform(p, [0.08, 0.24], [0, -36]);
  const introEvents = useTransform(introOpacity, (v) => v > 0.5 ? 'auto' : 'none');
  const beatsOpacity = useTransform(p, [0.28, 0.325, 0.795, 0.84], [0, 1, 1, 0]);
  const outroOpacity = useTransform(p, [0.85, 0.93], [0, 1]);
  const outroY = useTransform(p, [0.85, 0.93], [24, 0]);
  const outroEvents = useTransform(outroOpacity, (v) => v > 0.5 ? 'auto' : 'none');
  const hintOpacity = useTransform(p, [0, 0.06], [1, 0]);
  const introReady = entered || reduced;

  if (reduced) {
    return (
      <section id="home" ref={ref} className="hero-shell hero-static">
        <div className="hero-static-art" aria-hidden="true"><span className="hero-orbit-mark" /></div>
        <Intro reduced focusable ready />
        <div className="hero-footer"><span>Based in New Jersey</span><a href="#projects" onClick={(e) => { e.preventDefault(); scrollToSection('projects'); }}>Explore the work <ArrowDown size={14} /></a></div>
      </section>
    );
  }

  return (
    <section id="home" ref={ref} className="hero-shell h-[320svh]">
      <noscript><style>{`.loading-intro{display:none!important}.hero-intro-copy>*{opacity:1!important;transform:none!important}.hero-name-line>span{transform:none!important}`}</style></noscript>
      <LoadingIntro ready={sceneReady} onReveal={onEntered} />
      <div className="hero-stage sticky top-0 h-[100svh] overflow-hidden">
        <div className="hero-ambient" aria-hidden="true" />
        <div className="hero-grid" aria-hidden="true" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <SceneBoundary>
            <MorphScene progress={p} active={visible} reduced={false} slots={{ intro: introSlot, beat: beatSlot, outro: outroSlot }} onReady={onSceneReady} />
          </SceneBoundary>
        </div>

        <motion.div
          aria-hidden={phase !== 'intro'}
          style={{ opacity: introOpacity, y: introY, pointerEvents: introEvents }}
          className="hero-intro"
        >
          <Intro reduced={false} focusable={phase === 'intro'} ready={introReady} />
          <div className="hero-art">
            <div ref={introSlot} className="hero-art-slot" />
            {!sceneReady && <div className="hero-fallback" aria-hidden="true"><span className="hero-orbit-mark" /></div>}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: introReady ? 1 : 0 }} transition={{ delay: 0.4, duration: 0.7 }} className="hero-art-caption" aria-hidden="true">
              <span className="hero-crosshair">+</span><span>Ideas, taking shape.</span><span className="hero-art-number">001 — ∞</span>
            </motion.div>
          </div>
        </motion.div>

        <motion.div aria-hidden={phase !== 'intro'} style={{ opacity: hintOpacity }} className="hero-footer">
          <span>Based in New Jersey<span className="hidden sm:inline"> · Building everywhere</span></span>
          <a href="#about" tabIndex={phase === 'intro' ? 0 : -1} onClick={(e) => { e.preventDefault(); scrollToSection('about'); }} className="group">
            Scroll to discover <ArrowDown size={14} className="transition-transform group-hover:translate-y-1" />
          </a>
          <span className="hidden wide:inline">Portfolio / 2026</span>
        </motion.div>

        <motion.div
          aria-hidden={phase !== 'beats'}
          style={{ opacity: beatsOpacity }}
          className="hero-beats pointer-events-none"
        >
          <div ref={beatSlot} className="hero-beat-slot" />
          <div className="hero-beat-copy">
            <div className="grid">{heroBeats.map((beat, i) => <Beat key={beat.index} p={p} index={i} active={activeBeat === i} />)}</div>
            <div className="hero-progress" aria-hidden="true"><motion.div style={{ scaleX: p }} /></div>
          </div>
        </motion.div>

        <motion.div
          aria-hidden={phase !== 'outro'}
          style={{ opacity: outroOpacity, y: outroY, pointerEvents: outroEvents }}
          className="hero-outro"
        >
          <div ref={outroSlot} className="hero-outro-slot" />
          <h2 className="hero-outro-title">Less talk. <em>More making.</em></h2>
          <ProjectLinks focusable={phase === 'outro'} />
        </motion.div>
        <div className="hero-edge-label" aria-hidden="true">Engineering × imagination</div>
      </div>
    </section>
  );
}
