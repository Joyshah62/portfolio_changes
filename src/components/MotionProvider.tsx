'use client';

import { MotionConfig } from 'framer-motion';

/** Honors prefers-reduced-motion: transforms are skipped, opacity fades are kept. */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
