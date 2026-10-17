/** Smooth-scrolls to a section — or jumps, when the visitor prefers reduced motion. */
export function scrollToSection(hrefOrId: string) {
  const el = document.getElementById(hrefOrId.replace(/^#/, ''));
  if (!el) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
}
