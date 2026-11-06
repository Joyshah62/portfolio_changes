'use client';

import { useEffect } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { beforeSend, eventForLink, syncIgnoreFlagFromUrl, track } from '@/lib/analytics';

/**
 * Vercel Web Analytics plus one delegated click listener, so links across the
 * site are tracked without wiring an onClick into every component.
 */
export default function SiteAnalytics() {
  useEffect(() => {
    syncIgnoreFlagFromUrl();
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a[href]');
      if (!(link instanceof HTMLAnchorElement)) return;
      const tracked = eventForLink(link);
      if (tracked) track(tracked.name, tracked.props);
    };
    // Capture phase: still fires when a component stops propagation or navigates away.
    document.addEventListener('click', onClick, { capture: true });
    return () => document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return <Analytics beforeSend={beforeSend} />;
}
