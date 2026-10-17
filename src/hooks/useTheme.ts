'use client';

import { useSyncExternalStore } from 'react';
import { applyTheme, THEME_STORAGE_KEY, type Theme } from '@/utils/theme';

const snapshot = (): Theme => document.documentElement.dataset.theme === 'light' ? 'light' : 'dark';
const serverSnapshot = (): Theme => 'dark';
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY || event.key === null) applyTheme(event.newValue === 'light' ? 'light' : 'dark');
  };
  window.addEventListener('storage', onStorage);
  return () => { observer.disconnect(); window.removeEventListener('storage', onStorage); };
}

const FADE_MS = 450;

/** Soft colour crossfade — the fallback without View Transitions, and the reduced-motion path. */
function crossfade(commit: () => void) {
  const root = document.documentElement;
  root.classList.add('theme-fade');
  commit();
  window.setTimeout(() => root.classList.remove('theme-fade'), FADE_MS);
}

/**
 * Switches theme. With an origin (the toggle's centre), the new theme grows out of it as a
 * circle across the screen. The revealed layer is the live page, so canvases keep rendering.
 */
function transitionTo(next: Theme, origin?: { x: number; y: number }) {
  const commit = () => {
    applyTheme(next);
    try { localStorage.setItem(THEME_STORAGE_KEY, next); } catch { /* The toggle still works without storage. */ }
  };
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced || !('startViewTransition' in document)) return crossfade(commit);

  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? 0;
  // Far enough to cover the furthest corner from the origin
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
  const transition = document.startViewTransition(commit);
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    })
    .catch(() => { /* Skipped transitions still applied the theme. */ });
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  const toggleTheme = (origin?: { x: number; y: number }) => {
    transitionTo(snapshot() === 'dark' ? 'light' : 'dark', origin);
  };
  return { theme, toggleTheme };
}
