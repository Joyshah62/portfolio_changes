'use client';

import { ArrowUp } from 'lucide-react';
import { navLinks } from '@/data/site';
import { scrollToSection } from '@/utils/scroll';

export default function Footer() {
  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToSection(href);
  };

  return (
    <footer data-surface="fixed" className="relative overflow-hidden bg-ink px-4 pb-8 text-paper sm:px-8">
      <div className="mx-auto max-w-[1400px] border-t border-paper/15 pt-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={(e) => go(e, l.href)}
                className="text-sm text-paper/50 transition-colors hover:text-paper"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <button
            onClick={(e) => go(e, '#home')}
            className="group inline-flex w-fit items-center gap-2 text-sm text-paper/70 hover:text-paper"
          >
            Back to top
            <span className="grid h-9 w-9 place-items-center rounded-full border border-paper/20 transition-colors group-hover:bg-signal group-hover:text-ink">
              <ArrowUp size={14} />
            </span>
          </button>
        </div>

        {/* Oversized wordmark */}
        <div aria-hidden className="display mt-10 select-none whitespace-nowrap text-center text-[23vw] leading-[0.8] text-paper/[0.07]">
          Joy <em>Shah</em>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-paper/10 pt-6 md:flex-row md:justify-between">
          <span className="eyebrow text-paper/40">© 2026 Joy Shah · Software Engineer</span>
          <span className="eyebrow text-paper/40">Applied AI · Backend · Web Development</span>
        </div>
      </div>
    </footer>
  );
}
