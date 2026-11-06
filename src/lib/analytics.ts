import { track as vercelTrack } from '@vercel/analytics';
import type { BeforeSendEvent } from '@vercel/analytics/next';
import { contact } from '@/data/site';

/**
 * Custom events. Vercel Pro allows two properties per event, so each event
 * carries at most two short string values.
 */
export type TrackEvent =
  | { name: 'contact_click'; props: { location: string; method: 'email' | 'copy' } }
  | { name: 'resume_open'; props: { location: string } }
  | { name: 'social_click'; props: { location: string; network: 'github' | 'linkedin' } }
  | { name: 'project_open'; props: { project: string; link: string } }
  | { name: 'outbound_click'; props: { location: string; host: string } }
  | { name: 'skills_discipline'; props: { discipline: string; via: string } };

export function track<E extends TrackEvent>(name: E['name'], props: E['props']) {
  if (isIgnored()) return;
  vercelTrack(name, props);
}

/* ------------------------------------------------------------------ */
/* Opting your own browser out                                         */
/* ------------------------------------------------------------------ */

const IGNORE_KEY = 'va-ignore';

/** Visit any page with ?notrack=1 to stop counting this browser, ?notrack=0 to resume. */
export function syncIgnoreFlagFromUrl() {
  try {
    const flag = new URLSearchParams(window.location.search).get('notrack');
    if (flag === '1') localStorage.setItem(IGNORE_KEY, '1');
    if (flag === '0') localStorage.removeItem(IGNORE_KEY);
  } catch {
    /* storage blocked: nothing to persist */
  }
}

function isIgnored() {
  try {
    return localStorage.getItem(IGNORE_KEY) === '1';
  } catch {
    return false;
  }
}

/** Drops events from opted-out browsers and strips query strings from recorded URLs. */
export function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (isIgnored()) return null;
  const url = new URL(event.url);
  url.search = '';
  return { ...event, url: url.toString() };
}

/* ------------------------------------------------------------------ */
/* Link classification for the delegated click listener                */
/* ------------------------------------------------------------------ */

/** Where on the page a click happened: navbar, footer, or the enclosing section id. */
function locationOf(el: Element) {
  if (el.closest('footer')) return 'footer';
  if (el.closest('header, nav')) return 'navbar';
  return el.closest('section[id]')?.id ?? 'page';
}

/** Maps a clicked link to an analytics event, or null for in-page navigation. */
export function eventForLink(link: HTMLAnchorElement): TrackEvent | null {
  const href = link.getAttribute('href') ?? '';
  if (!href || href.startsWith('#')) return null;
  const location = locationOf(link);

  if (href.startsWith('mailto:')) return { name: 'contact_click', props: { location, method: 'email' } };

  // Project card links (cover, arrow, Source/Demo) carry the project title on the card.
  const project = link.closest<HTMLElement>('[data-track-project]')?.dataset.trackProject;
  if (project) {
    const link_ = link.getAttribute('aria-label')?.startsWith('View') ? 'cover' : link.textContent?.trim() || 'arrow';
    return { name: 'project_open', props: { project, link: link_ } };
  }

  if (href === contact.resume || href.endsWith('.pdf')) return { name: 'resume_open', props: { location } };
  const profile = href.replace(/\/$/, '');
  if (profile === contact.github) return { name: 'social_click', props: { location, network: 'github' } };
  if (profile === contact.linkedin) return { name: 'social_click', props: { location, network: 'linkedin' } };

  try {
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin) {
      return { name: 'outbound_click', props: { location, host: url.hostname.replace(/^www\./, '') } };
    }
  } catch {
    /* unparseable href: ignore */
  }
  return null;
}
