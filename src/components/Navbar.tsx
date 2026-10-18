'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { contact, navLinks } from '@/data/site';
import { useMagnetic } from '@/hooks/useMagnetic';
import { scrollToSection } from '@/utils/scroll';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
  const [active, setActive] = useState('home');
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [overFooter, setOverFooter] = useState(false);
  const ctaRef = useMagnetic(0.3);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const observers = navLinks.map(({ href }) => {
      const id = href.slice(1);
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(([e]) => e.isIntersecting && setActive(id), {
        rootMargin: '-45% 0px -50% 0px',
      });
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, []);

  // The footer is the one band that stays dark in both themes; switch the bar to its dark styling over it
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (!footer) return;
    const obs = new IntersectionObserver(([e]) => setOverFooter(e.isIntersecting), { rootMargin: '0px 0px -92% 0px' });
    obs.observe(footer);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
  }, [open]);

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToSection(href);
  };

  const onDark = overFooter;

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        className="fixed inset-x-0 top-0 z-[1000] px-4 sm:px-6 pt-4"
      >
        <nav data-surface={onDark || open ? 'fixed' : undefined} className="mx-auto flex max-w-[1400px] items-center justify-between gap-4">
          {/* Mark */}
          <a href="#home" onClick={(e) => go(e, '#home')} className="group flex items-center gap-3" aria-label="Joy Shah home">
            <span
              className="grid h-10 w-10 place-items-center rounded-full border border-paper/25 bg-ink text-paper"
            >
              <span className="font-serif text-lg italic leading-none">js</span>
            </span>
            <span
              className={`hidden sm:block font-serif text-xl tracking-tight transition-colors duration-500 ${
                onDark ? 'text-paper' : 'text-ink'
              }`}
            >
              Joy Shah
            </span>
          </a>

          {/* Pill */}
          <div
            className={`glass ${onDark ? 'dark-glass' : ''} hidden lg:flex items-center gap-1 rounded-full border p-1 backdrop-blur-xl backdrop-saturate-150 transition-all duration-500 ${
              onDark
                ? 'border-paper/15 bg-ink/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                : scrolled
                  ? 'border-line bg-card/70 shadow-[inset_0_1px_0_var(--glass-highlight),0_12px_32px_-12px_var(--glass-shadow)]'
                  : 'border-line bg-card/50 shadow-[inset_0_1px_0_var(--glass-highlight)]'
            }`}
          >
            {navLinks.filter((link) => ['#about', '#projects', '#contact'].includes(link.href)).map((link) => {
              const isActive = active === link.href.slice(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => go(e, link.href)}
                  className={`relative rounded-full px-4 py-2 text-[0.82rem] font-medium transition-colors duration-300 ${
                    isActive ? (onDark ? 'text-ink' : 'text-paper') : onDark ? 'text-paper/60 hover:text-paper' : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className={`absolute inset-0 rounded-full ${onDark ? 'bg-paper' : 'bg-ink'}`}
                      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                    />
                  )}
                  <span className="relative">{link.href === '#projects' ? 'Work' : link.label}</span>
                </a>
              );
            })}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          <a
            ref={ctaRef}
            href={`mailto:${contact.email}`}
            className="hidden lg:inline-flex items-center gap-2 rounded-full bg-signal px-5 py-2.5 text-[0.82rem] font-semibold text-on-signal transition-shadow duration-300 hover:shadow-[0_10px_30px_-8px_rgba(255,79,31,0.7)]"
          >
            Let&apos;s talk <ArrowUpRight size={15} strokeWidth={2.4} />
          </a>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className={`lg:hidden relative z-[1001] grid h-11 w-11 place-items-center rounded-full border transition-colors ${
              open || onDark ? 'border-paper/30 bg-paper text-ink' : 'border-ink bg-ink text-paper'
            }`}
          >
            <span className="relative block h-3 w-5">
              <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 rotate-45' : 'top-0'}`} />
              <span className={`absolute left-0 h-[1.5px] w-5 bg-current transition-all duration-300 ${open ? 'top-1.5 -rotate-45' : 'top-3'}`} />
            </span>
          </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            data-surface="fixed"
            initial={{ clipPath: 'circle(0% at calc(100% - 40px) 38px)' }}
            animate={{ clipPath: 'circle(150% at calc(100% - 40px) 38px)' }}
            exit={{ clipPath: 'circle(0% at calc(100% - 40px) 38px)' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[999] flex flex-col justify-between bg-ink px-6 pb-10 pt-28 text-paper"
          >
            <ul className="space-y-1">
              {navLinks.map((link, i) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a
                    href={link.href}
                    onClick={(e) => go(e, link.href)}
                    className="flex items-baseline gap-4 py-1"
                  >
                    <span className="eyebrow text-paper/40">0{i + 1}</span>
                    <span className={`display text-[13vw] sm:text-7xl ${active === link.href.slice(1) ? 'italic text-signal' : ''}`}>
                      {link.label}
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <motion.a
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              href={`mailto:${contact.email}`}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-signal px-6 py-3 font-semibold text-ink"
            >
              Let&apos;s talk <ArrowUpRight size={16} />
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
