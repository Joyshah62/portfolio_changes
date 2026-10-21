'use client';

import { useRef, useState } from 'react';
import { motion, useInView, useMotionValueEvent, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { contact, journey, type TimelineEntry } from '@/data/site';
import SectionHeader from './SectionHeader';
import IsoFigure, { type IsoTone } from './iso/IsoFigure';

// Each card gets its own material from the palette
const palettes: Array<{ bg: string; fg: string; sub: string; tag: string; num: string; tone: IsoTone }> = [
  { bg: 'bg-ink', fg: 'text-paper', sub: 'text-paper/65', tag: 'border-paper/20 text-paper/80', num: 'text-signal', tone: 'dark' },
  { bg: 'bg-card', fg: 'text-ink', sub: 'text-ink-soft', tag: 'border-line text-ink-soft', num: 'text-signal', tone: 'surface' },
  { bg: 'bg-cobalt', fg: 'text-paper', sub: 'text-paper/75', tag: 'border-paper/25 text-paper/85', num: 'text-paper', tone: 'cobalt' },
  { bg: 'bg-paper-2', fg: 'text-ink', sub: 'text-ink-soft', tag: 'border-ink/15 text-ink-soft', num: 'text-signal', tone: 'surface' },
  { bg: 'bg-signal', fg: 'text-ink', sub: 'text-ink/75', tag: 'border-ink/20 text-ink/80', num: 'text-ink', tone: 'signal' },
];

function Card({ entry, index, total, progress }: { entry: TimelineEntry; index: number; total: number; progress: MotionValue<number> }) {
  const c = palettes[index % palettes.length];
  // As later cards arrive, earlier ones recede: shrink a little and dim
  const start = index / total;
  const scale = useTransform(progress, [start, 1], [1, 1 - (total - 1 - index) * 0.045]);
  const shade = useTransform(progress, [(index + 1) / total, 1], [0, index === total - 1 ? 0 : 0.35]);

  // The card on top of the stack lights its figure; loops stop once the section leaves the screen
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-10% 0px' });
  const [active, setActive] = useState(index === 0);
  useMotionValueEvent(progress, 'change', (v) => {
    const on = (v >= start || index === 0) && (v < (index + 1) / total || index === total - 1);
    requestAnimationFrame(() => setActive(on));
  });

  return (
    <div ref={ref} className="sticky h-[78svh]" style={{ top: `calc(96px + ${index * 26}px)` }}>
      <motion.article
        data-surface={[0, 2, 4].includes(index % palettes.length) ? 'fixed' : undefined}
        style={{ scale }}
        className={`relative origin-top overflow-hidden rounded-[32px] ${c.bg} ${c.fg} shadow-[0_-20px_60px_-30px_var(--card-lift)]`}
      >
        <motion.div style={{ opacity: shade }} className="pointer-events-none absolute inset-0 bg-[#141210]" />
        <div className="relative grid min-h-[min(50svh,440px)] grid-cols-1 gap-8 p-6 sm:p-10 md:grid-cols-12 md:gap-6 md:p-12">
          <div className="flex items-start justify-between md:col-span-3 md:flex-col md:justify-between">
            <span className={`display text-7xl italic md:text-[7rem] ${c.num}`}>{entry.number}</span>
            <span className={`eyebrow ${c.sub}`}>{entry.period}</span>
          </div>
          <div className="flex flex-col md:col-span-4">
            <h3 className="display text-[clamp(2.2rem,3.6vw,3.6rem)]">{entry.role}</h3>
            <div className={`mt-3 text-sm font-medium ${c.sub}`}>{entry.org}</div>
            {/* Phones already fill the card with text, so the figure is a desktop-only accent */}
            <IsoFigure
              figure={entry.number}
              tone={c.tone}
              live={active && inView}
              className="mt-auto hidden aspect-[1.3] w-full max-w-[340px] pt-6 md:block"
            />
          </div>
          <div className="flex flex-col md:col-span-5">
            <p className={`text-[1rem] leading-relaxed ${c.sub}`}>{entry.description}</p>
            <div className="mt-auto flex flex-wrap gap-2 pt-6">
              {entry.tags.map((tag) => (
                <span key={tag} className={`rounded-full border px-3 py-1 font-mono text-[0.68rem] ${c.tag}`}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export default function Journey() {
  const stack = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: stack, offset: ['start start', 'end end'] });
  // Spring-smoothed (and kept off framer's native ScrollTimeline path)
  const progress = useSpring(scrollYProgress, { stiffness: 170, damping: 30, restDelta: 0.0005 });

  return (
    <section id="journey" className="relative px-4 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeader index="02" label="Experience & education" title={<>Where I&apos;ve worked <em>and studied.</em></>} aside="Since 2021" />

        <div ref={stack} className="relative">
          {journey.map((entry, i) => (
            <Card key={entry.number} entry={entry} index={i} total={journey.length} progress={progress} />
          ))}
        </div>

        {/* What's next */}
        <motion.a
          href={`mailto:${contact.email}`}
          initial={{ opacity: 0, y: 24, filter: 'blur(6px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ type: 'spring', bounce: 0, duration: 0.9 }}
          className="group mt-10 flex flex-col gap-4 rounded-[28px] border border-ink p-6 text-ink transition-colors hover:bg-ink hover:text-paper sm:flex-row sm:items-center sm:justify-between sm:p-10"
        >
          <div>
            <div className="eyebrow mb-2 opacity-70">Next chapter</div>
            <div className="display text-[clamp(2.2rem,4.5vw,4rem)]">
              What I&apos;m <em>looking for.</em>
            </div>
            <p className="mt-2 opacity-75">Software and AI engineering roles. Graduating from Rutgers in May 2027.</p>
          </div>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-signal text-on-signal transition-transform duration-500 group-hover:rotate-45">
            <ArrowUpRight size={26} />
          </span>
        </motion.a>
      </div>
    </section>
  );
}
