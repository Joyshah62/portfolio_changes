'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { GithubIcon } from './SocialIcons';
import { contact, projects, type Project } from '@/data/site';
import SectionHeader from './SectionHeader';

// Generative cover art — one per card, all CSS
const covers: Array<{ bg: string; fg: string; pattern: string; size?: string }> = [
  {
    bg: '#ff4f1f',
    fg: '#141210',
    pattern: 'repeating-radial-gradient(circle at 70% 120%, transparent 0 22px, rgba(20,18,16,0.22) 22px 23px)',
  },
  {
    bg: '#2b3bff',
    fg: '#f5f1e8',
    pattern:
      'linear-gradient(rgba(245,241,232,0.16) 1px, transparent 1px), linear-gradient(90deg, rgba(245,241,232,0.16) 1px, transparent 1px)',
    size: '28px 28px',
  },
  {
    bg: '#141210',
    fg: '#f5f1e8',
    pattern: 'repeating-linear-gradient(-45deg, transparent 0 14px, rgba(255,79,31,0.55) 14px 15px)',
  },
  {
    bg: '#e4ddcf',
    fg: '#141210',
    pattern: 'radial-gradient(rgba(20,18,16,0.35) 1.2px, transparent 1.4px)',
    size: '16px 16px',
  },
  {
    bg: '#d6246e',
    fg: '#f5f1e8',
    pattern: 'repeating-conic-gradient(from 0deg at 85% 15%, transparent 0 8deg, rgba(245,241,232,0.18) 8deg 9deg)',
  },
  {
    bg: '#d99a00',
    fg: '#141210',
    pattern: 'repeating-linear-gradient(0deg, transparent 0 18px, rgba(20,18,16,0.2) 18px 19px)',
  },
];

function ProjectCard({ project, index, wide, focus }: { project: Project; index: number; wide?: boolean; focus?: MotionValue<number> }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [6, -6]), { stiffness: 200, damping: 30 });
  const ry = useSpring(useTransform(mx, [0, 1], [-8, 8]), { stiffness: 200, damping: 30 });
  const glareX = useTransform(mx, [0, 1], ['0%', '100%']);
  const glareY = useTransform(my, [0, 1], ['0%', '100%']);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]) => `radial-gradient(400px circle at ${x} ${y}, rgba(255,255,255,0.28), transparent 50%)`,
  );
  // Sheen sweeps across the cover as the card passes the centre of the screen
  const sheenX = useTransform(focus ?? mx, focus ? [-1, 1] : [0, 1], ['130%', '-30%']);
  const sheen = useTransform(sheenX, (x) => `linear-gradient(105deg, transparent 35%, rgba(255,255,255,0.22) 50%, transparent 65%) ${x} 0 / 250% 100% no-repeat`);
  const cover = covers[index % covers.length];
  const primary = project.links[0];

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const r = ref.current!.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  };
  const reset = () => {
    mx.set(0.5);
    my.set(0.5);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 48, scale: 0.97, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ type: 'spring', bounce: 0, duration: 1, delay: (index % 2) * 0.08 }}
      style={{ perspective: 1200 }}
      className="h-full"
    >
      <motion.div
        ref={ref}
        onPointerMove={onMove}
        onPointerLeave={reset}
        style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-line bg-card"
      >
        {/* Cover */}
        <div
          className={`relative overflow-hidden ${wide ? 'aspect-[2/1]' : 'aspect-[16/10]'}`}
          style={{ background: cover.bg, color: cover.fg }}
        >
          <div
            className="absolute inset-0 transition-transform duration-700 ease-out-expo group-hover:scale-110"
            style={{ backgroundImage: cover.pattern, backgroundSize: cover.size }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ background: glare }}
          />
          {focus && <motion.div className="pointer-events-none absolute inset-0" style={{ background: sheen }} />}
          <div className="absolute inset-0 flex flex-col justify-between p-5 sm:p-7" style={{ transform: 'translateZ(40px)' }}>
            <div className="flex items-start justify-between">
              <span className="eyebrow opacity-80">No. {String(index + 1).padStart(2, '0')}</span>
              <span className="eyebrow max-w-[60%] text-right opacity-80">{project.subtitle}</span>
            </div>
            <div className="display italic text-[clamp(2.4rem,5vw,4.4rem)]">
              {project.cover}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h3 className="font-serif text-[clamp(1.7rem,2.4vw,2.3rem)] leading-[1.05] tracking-tight text-ink">
              {project.title}
            </h3>
            {primary && (
              <a
                href={primary.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open ${project.title}`}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-ink text-ink transition-all duration-500 group-hover:rotate-45 group-hover:bg-ink group-hover:text-paper"
              >
                <ArrowUpRight size={20} />
              </a>
            )}
          </div>
          {project.award && (
            <span className="mt-3 inline-flex w-fit items-center gap-2 rounded-full bg-ink px-3 py-1 font-mono text-[0.68rem] uppercase tracking-wider text-paper">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {project.award}
            </span>
          )}
          <p className="mt-4 text-[0.95rem] leading-relaxed text-ink-soft max-lg:line-clamp-5 [@media(max-height:720px)]:line-clamp-3">
            {project.description}
          </p>
          <div className="mt-auto flex flex-wrap items-center gap-2 pt-5 sm:pt-6">
            {project.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-paper-2 px-3 py-1 font-mono text-[0.68rem] text-ink-soft">
                {tag}
              </span>
            ))}
            <span className="ml-auto flex items-center gap-4 pl-2">
              {project.links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-ink underline-offset-4 hover:underline"
                >
                  {l.label === 'Source' && <GithubIcon size={14} />}
                  {l.label}
                  {l.label !== 'Source' && <ArrowUpRight size={14} />}
                </a>
              ))}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.article>
  );
}

const PHONE = '(max-width: 639px)';
const subscribePhone = (onChange: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
};
/** Phone-width check that renders like the server first (not a phone), so hydration matches, then updates */
const useIsPhone = () => useSyncExternalStore(subscribePhone, () => window.matchMedia(PHONE).matches, () => false);

/** One card in the gallery: angle, scale and sheen follow its distance from the screen centre. */
function GalleryItem({ project, index, x, center }: { project: Project; index: number; x: MotionValue<number>; center: number }) {
  // -1 = a full screen-width left of centre, 0 = centred, 1 = right
  const focus = useTransform(x, (v) => {
    const vw = typeof window === 'undefined' ? 1 : window.innerWidth;
    return Math.max(-1, Math.min(1, (center + v - vw / 2) / vw));
  });
  // Phones keep cards close together, so they turn a little less
  const maxTurn = useIsPhone() ? 20 : 28;
  const rotateY = useTransform(focus, [-1, 0, 1], [maxTurn, 0, -maxTurn]);
  const scale = useTransform(focus, [-1, 0, 1], [0.86, 1, 0.86]);
  const opacity = useTransform(focus, [-1, -0.6, 0, 0.6, 1], [0.35, 0.8, 1, 0.8, 0.35]);
  // The most centred card always draws on top of its turning neighbours
  const zIndex = useTransform(focus, (f) => Math.round((1 - Math.abs(f)) * 100));
  return (
    <motion.div
      style={{ rotateY, scale, opacity, zIndex, transformPerspective: 1100 }}
      className="w-[84vw] max-w-[520px] shrink-0 sm:w-[min(520px,62vw)] lg:w-[min(520px,38vw)]"
    >
      <ProjectCard project={project} index={index} wide focus={focus} />
    </motion.div>
  );
}

/** Pins the section and turns vertical scroll into a horizontal pan across the cards. */
function Gallery() {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const [centers, setCenters] = useState<number[]>([]);

  useEffect(() => {
    const el = track.current!;
    const measure = () => {
      setDistance(Math.max(0, el.scrollWidth - window.innerWidth));
      setCenters(Array.from(el.children).map((c) => (c as HTMLElement).offsetLeft + (c as HTMLElement).offsetWidth / 2));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener('resize', measure);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 30, restDelta: 0.0005 });
  const x = useTransform(progress, (v) => -v * distance);
  const counter = useTransform(progress, (v) => String(Math.min(projects.length, Math.floor(v * projects.length) + 1)).padStart(2, '0'));

  return (
    <div ref={section} className="relative" style={{ height: `calc(100svh + ${distance}px)` }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center gap-6 overflow-hidden pt-16 sm:gap-8">
        <motion.div
          ref={track}
          style={{ x }}
          className="flex w-max items-center gap-4 pl-[8vw] pr-[8vw] sm:gap-6 lg:pl-[max(2rem,calc((100vw-1400px)/2+2rem))] lg:pr-[max(2rem,calc((100vw-1400px)/2+2rem))]"
        >
          {projects.map((p, i) => (
            <GalleryItem key={p.id} project={p} index={i} x={x} center={centers[i] ?? 0} />
          ))}
        </motion.div>

        <div className="mx-auto flex w-full max-w-[1400px] items-center gap-4 px-[8vw] sm:gap-6 lg:px-8">
          <span className="eyebrow tabular-nums text-ink">
            <motion.span>{counter}</motion.span>
            <span className="text-muted"> / {String(projects.length).padStart(2, '0')}</span>
          </span>
          <div className="h-px flex-1 bg-line">
            <motion.div style={{ scaleX: progress }} className="h-px origin-left bg-ink" />
          </div>
          <span className="eyebrow text-muted">Keep scrolling</span>
        </div>
      </div>
    </div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="relative py-28 md:py-40">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
        <SectionHeader
          index="03"
          label="Selected work"
          title={<>A closer look <em>at the work.</em></>}
          aside={`${projects.length} projects`}
        />
      </div>

      <Gallery />

      <div className="mt-14 flex justify-center px-4">
        <a
          href={contact.github}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-3 rounded-full border border-ink px-7 py-4 font-medium text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          <GithubIcon size={16} />
          Explore more on GitHub
          <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:rotate-45" />
        </a>
      </div>
    </section>
  );
}
