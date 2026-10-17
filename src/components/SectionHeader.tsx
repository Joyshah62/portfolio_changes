'use client';

import { motion, type Variants } from 'framer-motion';

interface Props {
  index: string;
  label: string;
  title: React.ReactNode;
  aside?: React.ReactNode;
  dark?: boolean;
}

const ease = [0.16, 1, 0.3, 1] as const;

const rule: Variants = {
  hidden: { clipPath: 'inset(0 100% 0 0)' },
  show: { clipPath: 'inset(0 0% 0 0)', transition: { duration: 1.2, ease } },
};

const heading: Variants = {
  hidden: { y: '100%' },
  show: { y: '0%', transition: { duration: 1, ease, delay: 0.1 } },
};

export default function SectionHeader({ index, label, title, aside, dark }: Props) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-80px' }}
      className="mb-14 md:mb-20"
    >
      <motion.div variants={rule} className={`h-px ${dark ? 'bg-paper/20' : 'bg-ink'}`} />
      <div className="mt-4 flex items-center justify-between">
        <span className={`eyebrow ${dark ? 'text-paper/60' : 'text-ink-soft'}`}>
          ({index}) {label}
        </span>
        {aside && <span className={`eyebrow ${dark ? 'text-paper/40' : 'text-muted'}`}>{aside}</span>}
      </div>
      <div className="overflow-hidden">
        <motion.h2
          variants={heading}
          className={`mt-6 pb-[0.1em] text-[clamp(2.6rem,6.6vw,6.25rem)] font-semibold leading-[0.98] tracking-[-0.05em] [&_em]:text-accent ${dark ? 'text-paper' : 'text-ink'}`}
        >
          {title}
        </motion.h2>
      </div>
    </motion.div>
  );
}
