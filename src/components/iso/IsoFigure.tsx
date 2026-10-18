import type { CSSProperties } from 'react';
import { isoFigure } from './figures';

/** Which card surface the figure sits on; sets its line, body and accent colours (globals.css `.iso-tone-*`) */
export type IsoTone = 'dark' | 'surface' | 'cobalt' | 'signal';

/** Decorative iso-glow figure; `live` switches its accent lighting and motion on. */
export default function IsoFigure({ figure, tone, live, className = '' }: { figure: string; tone: IsoTone; live: boolean; className?: string }) {
  const fig = isoFigure(figure);
  if (!fig) return null;
  // Filter ids inside each figure are prefixed with its id
  const filters = { '--iso-glow': `url(#${fig.id}-glow)` } as CSSProperties;
  return (
    <svg
      className={`iso iso-tone-${tone} ${className}`}
      data-live={live}
      viewBox={fig.viewBox}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      style={filters}
      dangerouslySetInnerHTML={{ __html: fig.svg }}
    />
  );
}
