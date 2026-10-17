import { useEffect, useRef } from 'react';

/**
 * Critically damped spring (damping ratio 1.0). `response` is roughly how long,
 * in seconds, it takes to reach the target — not a fixed duration. Because it
 * integrates from the live value and keeps its velocity, retargeting mid-flight
 * is always continuous.
 */
class Spring {
  value: number;
  velocity = 0;
  target: number;
  constructor(initial: number, private response: number, private damping = 1) {
    this.value = initial;
    this.target = initial;
  }
  step(dt: number) {
    const omega = (2 * Math.PI) / this.response;
    const accel = -omega * omega * (this.value - this.target) - 2 * this.damping * omega * this.velocity;
    this.velocity += accel * dt;
    this.value += this.velocity * dt;
  }
  get settled() {
    return Math.abs(this.value - this.target) < 0.01 && Math.abs(this.velocity) < 0.01;
  }
}

/**
 * Pulls an element toward the pointer, with independent X/Y springs and press
 * feedback on pointer-down. Disabled for touch and reduced motion.
 */
export function useMagnetic<T extends HTMLElement = HTMLAnchorElement>(intensity: number = 0.2) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const x = new Spring(0, 0.4);
    const y = new Spring(0, 0.4);
    const scale = new Spring(1, 0.2);
    let raf = 0;
    let last = 0;

    const render = () => {
      el.style.transform = `translate3d(${x.value}px, ${y.value}px, 0) scale(${scale.value})`;
    };

    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;
      x.step(dt);
      y.step(dt);
      scale.step(dt);
      render();
      raf = x.settled && y.settled && scale.settled ? 0 : requestAnimationFrame(tick);
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      // Measure the untransformed box: subtract the offset we've applied ourselves
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - x.value;
      const cy = r.top + r.height / 2 - y.value;
      x.target = (e.clientX - cx) * intensity;
      y.target = (e.clientY - cy) * intensity;
      wake();
    };
    const onLeave = () => {
      x.target = 0;
      y.target = 0;
      scale.target = 1;
      wake();
    };
    const onDown = () => {
      scale.target = 0.95;
      wake();
    };
    const onUp = () => {
      scale.target = 1;
      wake();
    };

    el.style.willChange = 'transform';
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointercancel', onUp);

    return () => {
      cancelAnimationFrame(raf);
      el.style.transform = '';
      el.style.willChange = '';
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.removeEventListener('pointercancel', onUp);
    };
  }, [intensity]);

  return ref;
}
