'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const FINE = '(pointer: fine)';
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(FINE);
  mq.addEventListener('change', cb);
  return () => mq.removeEventListener('change', cb);
};

export default function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, () => window.matchMedia(FINE).matches, () => false);
  const [hovering, setHovering] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 300, damping: 28, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 300, damping: 28, mass: 0.5 });

  useEffect(() => {
    if (!enabled) return;
    document.body.classList.add('has-custom-cursor');

    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      setHovering(!!t.closest('a, button'));
    };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerover', over);
    return () => {
      document.body.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerover', over);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[10000] mix-blend-difference" aria-hidden>
      <motion.div
        className="absolute left-0 top-0 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
        style={{ x, y }}
      />
      <motion.div
        className="absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white"
        style={{ x: rx, y: ry }}
        animate={{
          width: hovering ? 64 : 34,
          height: hovering ? 64 : 34,
          backgroundColor: hovering ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0)',
        }}
        transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
      />
    </div>
  );
}
