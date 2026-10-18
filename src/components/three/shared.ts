'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Window-level pointer, shared by every scene. Canvases sit behind page
 * content, so they can't rely on their own pointer events.
 */
export const pointer = { x: 0, y: 0, clientX: -9999, clientY: -9999 };

let bound = false;
export function bindPointer() {
  if (bound || typeof window === 'undefined') return;
  bound = true;
  window.addEventListener(
    'pointermove',
    (e) => {
      pointer.clientX = e.clientX;
      pointer.clientY = e.clientY;
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true },
  );
}

/** True while the element is near the viewport — used to pause offscreen canvases. */
export function useInViewport(ref: RefObject<HTMLElement | null>, rootMargin = '100px') {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin });
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, rootMargin]);
  return visible;
}

export function isCoarsePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
}

/** Last click inside the flow field, consumed by its scene on the next frame (t = 1 while pending). */
export const flowShock = { x: 0, y: 0, t: 0 };
