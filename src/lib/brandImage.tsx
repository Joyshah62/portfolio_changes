import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

/** Colours from the site palette (globals.css). */
export const brand = {
  ink: '#141210',
  paper: '#ede8dd',
  signal: '#ff4f1f',
  muted: '#8b8478',
};

/** The site's own fonts, so generated images match the page (OFL, see assets/fonts). */
export async function brandFonts() {
  const read = (file: string) => readFile(join(process.cwd(), 'assets/fonts', file));
  const [serif, sans, mono] = await Promise.all([
    read('InstrumentSerif-Italic.woff'),
    read('InterTight-SemiBold.woff'),
    read('IBMPlexMono-Medium.woff'),
  ]);
  return [
    { name: 'Instrument Serif', data: serif, style: 'italic' as const, weight: 400 as const },
    { name: 'Inter Tight', data: sans, style: 'normal' as const, weight: 600 as const },
    { name: 'IBM Plex Mono', data: mono, style: 'normal' as const, weight: 500 as const },
  ];
}

/** The "js" monogram from the navbar: italic serif letters on a paper disc. */
export function Monogram({ size, disc = brand.paper, letters = brand.ink, background = 'transparent' }: { size: number; disc?: string; letters?: string; background?: string }) {
  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background }}>
      <div
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          background: disc,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: letters,
          fontFamily: 'Instrument Serif',
          fontStyle: 'italic',
          fontSize: size * 0.68,
          letterSpacing: -size * 0.02,
          // Optical centring: the italic glyphs sit high and lean right
          paddingBottom: size * 0.08,
          paddingRight: size * 0.03,
        }}
      >
        js
      </div>
    </div>
  );
}
