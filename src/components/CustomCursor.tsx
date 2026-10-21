'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';

import { ArrowUpRight, MoveHorizontal, Play } from 'lucide-react';

// Touch and forced-color users keep their platform cursor.
const POINTER = '(hover: hover) and (pointer: fine) and (forced-colors: none)';
const subscribe = (notify: () => void) => {
  const query = window.matchMedia(POINTER);
  query.addEventListener('change', notify);
  return () => query.removeEventListener('change', notify);
};
type Mode = 'default' | 'control' | 'link' | 'text' | 'draw' | 'drag' | 'view' | 'play' | 'disabled' | 'native';

function resolveCursor(target: Element): { mode: Mode; element: Element } {
  const disabled = target.closest(':disabled, [aria-disabled="true"], [inert]');
  if (disabled) return { mode: 'disabled', element: disabled };
  const custom = target.closest('[data-cursor]');
  const requested = custom?.getAttribute('data-cursor');
  if (custom && ['native', 'draw', 'drag', 'view', 'play'].includes(requested ?? '')) {
    return { mode: requested as Mode, element: custom };
  }
  const drag = target.closest('[draggable="true"], [role="slider"], input[type="range"], .cursor-grab, .cursor-grabbing');
  if (drag) return { mode: 'drag', element: drag };
  const control = target.closest('button, summary, select, input[type="checkbox"], input[type="radio"], input[type="submit"], [role="button"], [role="tab"], [role="radio"]');
  if (control) return { mode: 'control', element: control };
  const link = target.closest('a[href]');
  if (link) return { mode: 'link', element: link };
  const field = target.closest('input, textarea, [contenteditable="true"], [contenteditable=""]');
  if (field) return { mode: 'text', element: field };
  const draw = target.closest('canvas, .cursor-crosshair');
  if (draw) return { mode: 'draw', element: draw };
  const text = target.closest('p, h1, h2, h3, h4, h5, h6, label, blockquote, pre, code, dt, dd, li');
  if (text) return { mode: 'text', element: text };
  return { mode: 'default', element: target };
}

export default function CustomCursor() {
  const enabled = useSyncExternalStore(subscribe, () => window.matchMedia(POINTER).matches, () => false);
  const layerRef = useRef<HTMLDivElement>(null);
  const outlineRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled) return;
    const layer = layerRef.current;
    const outline = outlineRef.current;
    const tip = tipRef.current;
    if (!layer || !outline || !tip) return;
    let frame = 0;
    let px = -100;
    let py = -100;
    let pointerSeen = false;

    const update = () => {
      frame = 0;
      if (!pointerSeen) return;
      const target = document.elementFromPoint(px, py);
      if (!target) { hide(); return; }
      const next = resolveCursor(target);
      layer.dataset.mode = next.mode;
      let w = 32, h = 32, r = 50, cx = px, cy = py;
      if (next.mode === 'control' || next.mode === 'link') {
        const box = next.element.getBoundingClientRect();
        // Trace small controls; large cards get a compact action cursor.
        if (box.width <= 240 && box.height <= 80) {
          w = box.width + 8;
          h = box.height + 8;
          cx = box.left + box.width / 2;
          cy = box.top + box.height / 2;
          const cssRadius = parseFloat(getComputedStyle(next.element).borderTopLeftRadius) || 5;
          r = Math.min(cssRadius + 4, h / 2);
        } else {
          w = h = 52;
        }
      } else if (next.mode === 'text') {
        w = 2; h = 22; r = 1;
      } else if (next.mode === 'draw') {
        w = h = 18;
      } else if (next.mode === 'view') {
        w = 72; h = 34;
      } else if (next.mode === 'drag' || next.mode === 'play') {
        w = h = 48;
      } else if (next.mode === 'disabled') {
        w = h = 24;
      }
      outline.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      outline.style.width = `${w}px`;
      outline.style.height = `${h}px`;
      outline.style.borderRadius = `${r}px`;
      tip.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      // Only replace the platform cursor after positioning a rendered overlay.
      const active = next.mode !== 'native' && layer.isConnected;
      layer.style.opacity = active ? '1' : '0';
      document.body.classList.toggle('has-custom-cursor', active);
    };
    const schedule = () => {
      if (!frame && pointerSeen) frame = requestAnimationFrame(update);
    };
    const move = (event: PointerEvent) => {
      if (event.pointerType === 'touch') return;
      px = event.clientX; py = event.clientY;
      pointerSeen = true;
      tip.style.transform = `translate3d(${px}px, ${py}px, 0)`;
      schedule();
    };
    const hide = () => {
      pointerSeen = false;
      layer.style.opacity = '0';
      layer.dataset.pressed = 'false';
      document.body.classList.remove('has-custom-cursor');
    };
    const leave = (event: PointerEvent) => { if (!event.relatedTarget) hide(); };
    const down = () => { layer.dataset.pressed = 'true'; };
    const up = () => { layer.dataset.pressed = 'false'; schedule(); };
    const keyboard = (event: KeyboardEvent) => { if (event.key === 'Tab') hide(); };
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerout', leave);
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', hide);
    window.addEventListener('blur', hide);
    window.addEventListener('keydown', keyboard);
    // Re-evaluate the element beneath a stationary cursor when the page moves.
    window.addEventListener('scroll', schedule, { passive: true, capture: true });
    window.addEventListener('resize', schedule);
    return () => {
      document.body.classList.remove('has-custom-cursor');
      cancelAnimationFrame(frame);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerout', leave);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', hide);
      window.removeEventListener('blur', hide);
      window.removeEventListener('keydown', keyboard);
      window.removeEventListener('scroll', schedule, true);
      window.removeEventListener('resize', schedule);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div ref={layerRef} className="adaptive-cursor" data-mode="default" aria-hidden="true" style={{ opacity: 0 }}>
      <div ref={outlineRef} className="adaptive-cursor-outline" />
      <div ref={tipRef} className="adaptive-cursor-tip">
        <ArrowUpRight className="cursor-link-icon" size={16} />
        <MoveHorizontal className="cursor-drag-icon" size={19} />
        <Play className="cursor-play-icon" size={17} fill="currentColor" />
        <span className="adaptive-cursor-label">View</span>
        <span className="adaptive-cursor-crosshair" />
        <span className="adaptive-cursor-blocked" />
        <span className="adaptive-cursor-dot" />
      </div>
    </div>
  );
}
