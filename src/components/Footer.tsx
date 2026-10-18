'use client';

import { useRef, useSyncExternalStore } from 'react';
import { ArrowUp } from 'lucide-react';
import { intro, navLinks } from '@/data/site';
import { scrollToSection } from '@/utils/scroll';

const ZONE = 'America/New_York';
const clockFormat = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
const hourFormat = new Intl.DateTimeFormat('en-US', { timeZone: ZONE, hour: 'numeric', hourCycle: 'h23' });

// Ticks every 15 s; strings compare by value, so React only re-renders when the minute changes
const subscribeClock = (onChange: () => void) => {
  const id = window.setInterval(onChange, 15_000);
  return () => window.clearInterval(id);
};
const clockSnapshot = () => {
  const now = new Date();
  return `${clockFormat.format(now)}|${hourFormat.format(now)}`;
};

export default function Footer() {
  const mark = useRef<HTMLDivElement>(null);
  const clock = useSyncExternalStore(subscribeClock, clockSnapshot, () => '');
  const [time, hour] = clock.split('|');
  const now = hour ? [...intro.rightNow].reverse().find((r) => Number(hour) >= r.from)?.text : null;

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToSection(href);
  };

  // The wordmark lights up in signal orange under the cursor
  const track = (e: React.PointerEvent) => {
    const el = mark.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--x', `${e.clientX - r.left}px`);
    el.style.setProperty('--y', `${e.clientY - r.top}px`);
    el.style.setProperty('--r', '22vw');
  };
  const leave = () => mark.current?.style.setProperty('--r', '0px');

  return (
    <footer data-surface="fixed" className="relative overflow-hidden bg-ink px-4 pb-8 pt-20 text-paper sm:px-8 md:pt-28">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-12">
          <div className="col-span-2 md:col-span-5">
            <p className="max-w-sm font-serif text-[clamp(1.6rem,2.6vw,2.2rem)] leading-tight text-paper/85">
              Software engineer building <em className="text-signal">applied AI</em> that ships.
            </p>
            <p className="mt-6 inline-flex items-center gap-2.5 rounded-full border border-paper/15 px-4 py-2 text-sm text-paper/70">
              <span className="hero-status-dot animate-pulse" /> Open to roles from May 2027
            </p>
          </div>

          <nav aria-label="Footer" className="md:col-span-3">
            <p className="eyebrow mb-5 text-paper/40">Index</p>
            <ul className="space-y-2.5">
              {navLinks.map((l, i) => (
                <li key={l.href}>
                  <a href={l.href} onClick={(e) => go(e, l.href)} className="group inline-flex items-baseline gap-3 text-paper/70 transition-colors hover:text-paper">
                    <span className="font-mono text-[0.65rem] text-paper/30 transition-colors group-hover:text-signal">{String(i + 1).padStart(2, '0')}</span>
                    <span className="transition-transform duration-300 group-hover:translate-x-1">{l.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="md:col-span-4">
            <p className="eyebrow mb-5 text-paper/40">Right now in New Brunswick</p>
            <p className="font-serif text-[clamp(2rem,3.4vw,2.8rem)] leading-none tabular-nums">{time || '—'}</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-paper/55">{now ? now[0].toUpperCase() + now.slice(1) :' '}</p>
          </div>
        </div>

        {/* Oversized wordmark — dim at rest, lit under the cursor */}
        <div
          ref={mark}
          aria-hidden="true"
          onPointerMove={track}
          onPointerLeave={leave}
          className="footer-mark relative mt-20 select-none md:mt-28"
        >
          <span className="footer-mark-text text-paper/[0.08]">Joy Shah<span className="text-signal/40">.</span></span>
          <span className="footer-mark-text footer-mark-glow absolute inset-0">Joy Shah.</span>
        </div>

        <div className="mt-8 flex flex-col gap-6 border-t border-paper/10 pt-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="eyebrow text-paper/45">© 2026 Joy Shah · Built with Next.js & three.js</p>
          </div>
          <button
            onClick={(e) => go(e, '#home')}
            className="group inline-flex w-fit items-center gap-3 text-sm text-paper/70 transition-colors hover:text-paper"
          >
            Back to top
            <span className="grid h-11 w-11 place-items-center rounded-full border border-paper/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-signal group-hover:bg-signal group-hover:text-ink">
              <ArrowUp size={15} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
}
