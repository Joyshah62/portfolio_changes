'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { skillCategories } from '@/data/site';
import { useInViewport } from './three/shared';
import SectionHeader from './SectionHeader';

const SkillsGlobe = dynamic(() => import('./three/SkillsGlobe'), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 grid place-items-center">
      <div className="h-2/3 w-2/3 animate-pulse rounded-full border border-line" />
    </div>
  ),
});

export default function Skills() {
  const [active, setActive] = useState<string | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const visible = useInViewport(stage);

  return (
    <section id="skills" className="relative overflow-hidden px-4 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeader index="04" label="Skills" title={<>What I work <em>with.</em></>} aside={`${skillCategories.length} areas`} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          {/* Categories */}
          <div className="lg:col-span-5">
            <p className="mb-8 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              Python for models and services. TypeScript for the interface. Databases and infrastructure
              to connect the pieces. Select a category to explore the tools I use.
            </p>

            <ul className="border-t border-ink">
              {skillCategories.map((cat, i) => {
                const isActive = active === cat.id;
                return (
                  <li key={cat.id} className="border-b border-line">
                    <button
                      onClick={() => setActive(isActive ? null : cat.id)}
                      aria-expanded={isActive}
                      className="group flex w-full items-center gap-4 py-4 text-left"
                    >
                      <span className="eyebrow w-6 text-muted">0{i + 1}</span>
                      <span
                        className="h-3 w-3 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-125"
                        style={{ background: cat.color }}
                      />
                      <span
                        className={`flex-1 font-serif text-[1.9rem] leading-none tracking-tight transition-colors duration-300 ${
                          isActive ? 'italic' : ''
                        }`}
                        style={{ color: isActive ? cat.color : undefined }}
                      >
                        {cat.label}
                      </span>
                      <span className="font-mono text-xs text-muted">{cat.skills.length}</span>
                      <Plus
                        size={18}
                        className={`text-ink transition-transform duration-300 ${isActive ? 'rotate-45' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="flex flex-wrap gap-2 pb-5 pl-10">
                            {cat.skills.map((s) => (
                              <span
                                key={s}
                                className="rounded-full border px-3 py-1 font-mono text-[0.7rem]"
                                style={{ borderColor: `${cat.color}55`, color: cat.color }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Globe */}
          <div className="lg:col-span-7">
            <div
              ref={stage}
              className="relative aspect-square w-full overflow-hidden rounded-[32px] border border-line bg-card"
              aria-hidden
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    'radial-gradient(50% 50% at 50% 50%, rgba(255,79,31,0.08), transparent 70%), radial-gradient(color-mix(in srgb, var(--color-ink) 8%, transparent) 1px, transparent 1px)',
                  backgroundSize: '100% 100%, 22px 22px',
                }}
              />
              <SkillsGlobe active={active} visible={visible} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between p-5">
                <span className="eyebrow text-muted">
                  <span className="hidden md:inline">Drag to spin</span>
                  <span className="md:hidden">Rotating view</span>
                </span>
                <span className="eyebrow text-muted">
                  {active ? skillCategories.find((c) => c.id === active)!.label : 'All skills'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
