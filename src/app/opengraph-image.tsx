import { ImageResponse } from 'next/og';
import { brand, brandFonts, Monogram } from '@/lib/brandImage';
import { site } from '@/lib/seo';

export const alt = 'Joy Shah — software engineer & applied AI';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** The link preview card for LinkedIn, iMessage, Slack, X and search. */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: brand.ink,
          color: brand.paper,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 64, height: 64, display: 'flex' }}><Monogram size={64} /></div>
            <span style={{ fontFamily: 'IBM Plex Mono', fontSize: 22, letterSpacing: 3, color: brand.muted }}>PORTFOLIO / 2026</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontFamily: 'IBM Plex Mono', fontSize: 22, letterSpacing: 2, color: brand.paper }}>
            <div style={{ width: 12, height: 12, borderRadius: 6, background: brand.signal }} />
            OPEN TO ROLES · MAY 2027
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontFamily: 'Inter Tight', fontSize: 176, lineHeight: 0.9, letterSpacing: -10 }}>
            Joy Shah<span style={{ color: brand.signal }}>.</span>
          </div>
          <div style={{ display: 'flex', marginTop: 28, fontFamily: 'Instrument Serif', fontStyle: 'italic', fontSize: 58, color: 'rgba(237,232,221,0.82)' }}>
            {site.tagline}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '2px solid rgba(237,232,221,0.15)', paddingTop: 26, fontFamily: 'IBM Plex Mono', fontSize: 22, letterSpacing: 2, color: brand.muted }}>
          <span>LLM AGENTS · RAG · ML SECURITY</span>
          <span>RUTGERS M.S. CS · NEW BRUNSWICK, NJ</span>
        </div>
      </div>
    ),
    { ...size, fonts: await brandFonts() },
  );
}
