'use client';

import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { contact, recognition, stats } from '@/data/site';
import SectionHeader from './SectionHeader';
import { useInViewport } from './three/shared';

const PortraitScene = dynamic(() => import('./three/PortraitScene'), { ssr: false });

function CountUp({ value, suffix, isFloat }: { value: number; suffix: string; isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  // Inset only the bottom edge: an all-sides inset hides narrow numbers (like "2") that sit
  // near the left edge of a phone screen, so they would never start counting.
  const inView = useInView(ref, { once: true, margin: '0px 0px -50px 0px' });

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const duration = 1600;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      setCount(value * (1 - Math.pow(1 - p, 4)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {isFloat ? count.toFixed(2) : Math.round(count)}
      {suffix}
    </span>
  );
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date());
    const first = requestAnimationFrame(tick);
    const id = setInterval(tick, 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(id);
    };
  }, []);

  const label = time
    ? time.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: 'numeric', minute: '2-digit', hour12: true })
    : 'Loading';

  return <span className="tabular-nums">{label}</span>;
}

/* ---------------------------------------------------------------
   Scroll-lit statement: each word brightens as it passes through
   the reading line, the way Apple's product pages read.
---------------------------------------------------------------- */
const statement: Array<{ text: string; tone?: 'signal' | 'cobalt' | 'italic' }> = [
  ..."I work across".split(' ').map(text => ({ text })),
  { text: 'software', tone: 'signal' }, { text: 'engineering', tone: 'signal' },
  { text: 'and' }, { text: 'machine', tone: 'cobalt' }, { text: 'learning.', tone: 'cobalt' },
  ..."I like taking an idea, working through the details, and turning it into something people can use.".split(' ').map(text => ({ text })),
];

const toneClass = { signal: 'italic text-signal', cobalt: 'italic text-cobalt', italic: 'italic' } as const;

function Word({ progress, range, text, tone }: { progress: MotionValue<number>; range: [number, number]; text: string; tone?: keyof typeof toneClass }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  return (
    <motion.span style={{ opacity }} className={tone ? toneClass[tone] : undefined}>
      {text}{' '}
    </motion.span>
  );
}

function ScrollStatement() {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.5'] });
  const scrollYProgress = useSpring(raw, { stiffness: 170, damping: 30, restDelta: 0.0005 });
  const n = statement.length;
  return (
    <p
      ref={ref}
      aria-label={statement.map((w) => w.text).join(' ')}
      className="max-w-6xl font-serif text-[clamp(2rem,4.6vw,4.4rem)] leading-[1.08] tracking-[-0.02em] text-ink"
    >
      <span aria-hidden>
        {statement.map((w, i) => (
          <Word key={i} progress={scrollYProgress} range={[i / n, (i + 1) / n]} text={w.text} tone={w.tone} />
        ))}
      </span>
    </p>
  );
}

const spec = [
  { k: 'name', v: 'Joy Shah' },
  { k: 'current role', v: 'Software Engineer Intern, CodeBench' },
  { k: 'education', v: 'M.S. Computer Science, Rutgers' },
  { k: 'focus', v: 'Applied AI, backend and web development' },
  { k: 'location', v: 'New Brunswick, NJ' },
  { k: 'graduating', v: 'May 2027' },
];

function Stamp() {
  return (
    <div className="relative h-32 w-32 shrink-0">
      <svg viewBox="0 0 100 100" className="spin-slow absolute inset-0 h-full w-full text-ink">
        <defs>
          <path id="stamp-circle" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="font-mono" fontSize="8.4" letterSpacing="2.6" fill="currentColor">
          <textPath href="#stamp-circle">OPEN TO RELOCATION · OPEN TO RELOCATION ·</textPath>
        </text>
      </svg>
      <div className="absolute inset-[30%] grid place-items-center rounded-full bg-signal">
        <span className="font-serif text-2xl italic leading-none text-on-signal">✺</span>
      </div>
    </div>
  );
}

class PortraitBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function Portrait() {
  const ref = useRef<HTMLDivElement>(null);
  const visible = useInViewport(ref, '0px');
  const reduced = useReducedMotion() ?? false;
  const [mode, setMode] = useState<'photo' | 'particles'>('photo');
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  return (
    <div ref={ref} className="portrait-frame">
      <Image src="/profile.jpeg" alt="Joy Shah" fill sizes="(max-width: 767px) calc(100vw - 32px), (max-width: 1463px) 42vw, 565px" className="portrait-image" />
      {mode === 'particles' && (
        <PortraitBoundary>
          <div className="portrait-canvas" data-ready={ready} aria-hidden="true">
            <PortraitScene visible={visible} reduced={reduced} onReady={onReady} />
          </div>
        </PortraitBoundary>
      )}
      <div className="portrait-caption">
        <span>Joy Shah</span>
        {mode === 'particles' && <span className="hidden xl:inline">Move to explore</span>}
      </div>
      <div className="portrait-modes" role="group" aria-label="Portrait style">
        {(['photo', 'particles'] as const).map((value) => (
          <button key={value} type="button" aria-pressed={mode === value} onClick={() => { if (mode !== value) { setReady(false); setMode(value); } }}>
            {value === 'photo' ? 'Photo' : 'Particles'}
          </button>
        ))}
      </div>
    </div>
  );
}

const reveal = {
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  whileInView: { opacity: 1, y: 0, filter: 'blur(0px)' },
  viewport: { once: true, margin: '-80px' },
};
const spring = (delay = 0) => ({ type: 'spring' as const, bounce: 0, duration: 0.9, delay });

export default function About() {
  return (
    <section id="about" className="relative px-4 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeader index="01" label="About" title={<>A little <em>about me.</em></>} aside="Rutgers · NJ" />

        <ScrollStatement />

        <div className="mt-16 grid grid-cols-1 gap-10 md:mt-24 md:grid-cols-12 md:gap-8">
          <motion.div {...reveal} transition={spring()} className="md:col-span-5">
            <Portrait />
          </motion.div>

          <div className="flex flex-col gap-10 md:col-span-7">
            <motion.div {...reveal} transition={spring(0.05)} className="space-y-5">
              <p className="text-[1.05rem] leading-[1.8] text-ink-soft">
                I&apos;m a software engineer and Computer Science master&apos;s student at Rutgers,
                graduating in May 2027. At CodeBench, I work on a learning platform inside JupyterLab,
                building React interfaces, Python services, and an AI tutor that guides students
                through programming problems.
              </p>
              <p className="text-[1.05rem] leading-[1.8] text-ink-soft">
                Previously, I worked on machine learning for security at Forenzy Networks,
                where I helped reduce false positives in web attack detection from 23% to 4%.
                I&apos;ve also published research on facial liveness detection at IEEE CICT and won
                two hackathons. I like working across the stack: understanding the data, building
                the backend, and making the result usable in an interface.
              </p>
            </motion.div>

            {/* Spec sheet */}
            <motion.dl {...reveal} transition={spring(0.15)}>
              {spec.map(({ k, v }) => (
                <div key={k} className="group flex items-baseline justify-between gap-6 border-b border-line py-3.5">
                  <dt className="eyebrow text-muted transition-colors group-hover:text-signal">{k}</dt>
                  <dd className="text-right text-[0.98rem] text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex items-baseline justify-between gap-6 border-b border-ink py-3.5">
                <dt className="eyebrow text-muted">status</dt>
                <dd className="inline-flex items-center gap-2 text-right text-[0.98rem] font-medium text-ink">
                  <span className="h-2 w-2 rounded-full bg-signal" />
                  Open to software &amp; AI engineering roles
                </dd>
              </div>
            </motion.dl>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 border-t border-ink md:mt-28 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              {...reveal}
              transition={spring(i * 0.07)}
              className={`group border-line py-8 pr-4 ${i % 2 ? 'border-l pl-4 sm:pl-6' : ''} ${
                i > 0 ? 'lg:border-l lg:pl-6' : ''
              } ${i < 2 ? 'border-b lg:border-b-0' : ''}`}
            >
              <div className="display text-[clamp(3.4rem,7vw,6.5rem)] text-ink transition-colors duration-300 group-hover:text-signal">
                {s.textValue ?? <CountUp value={s.value ?? 0} suffix={s.suffix} isFloat={s.isFloat} />}
              </div>
              <div className="eyebrow mt-3 text-ink-soft">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Recognition */}
        <div className="mt-20 grid grid-cols-1 gap-6 md:mt-28 md:grid-cols-12">
          <motion.h3 {...reveal} transition={spring()} className="display text-[clamp(2.2rem,4vw,3.6rem)] md:col-span-4">
            <em>Awards &amp; research</em>
          </motion.h3>
          <ul className="border-t border-ink md:col-span-8">
            {recognition.map((r, i) => (
              <motion.li key={r.title} {...reveal} transition={spring(i * 0.07)} className="border-b border-line">
                <a
                  href={r.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 py-5"
                >
                  <span className="eyebrow text-muted">{r.year}</span>
                  <span>
                    <span className="block font-serif text-[1.7rem] leading-tight tracking-tight text-ink transition-colors group-hover:text-signal">
                      {r.title}
                    </span>
                    <span className="mt-1 block text-[0.95rem] text-ink-soft">{r.detail}</span>
                  </span>
                  <ArrowUpRight size={18} className="text-ink transition-transform duration-300 group-hover:rotate-45" />
                </a>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Location strip */}
        <motion.div
          {...reveal}
          transition={spring()}
          className="mt-20 flex flex-col gap-8 rounded-[28px] bg-card p-6 sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div className="flex items-center gap-6 sm:gap-8">
            <Stamp />
            <div>
              <div className="eyebrow mb-2 text-muted">Local time · New Brunswick</div>
              <div className="display text-[clamp(2.8rem,6vw,5rem)] text-ink">
                <LiveClock />
              </div>
            </div>
          </div>
          <div className="eyebrow leading-relaxed text-ink-soft sm:text-right">
            {contact.coords}
            <br />
            Eastern Time (ET)
          </div>
        </motion.div>
      </div>
    </section>
  );
}
