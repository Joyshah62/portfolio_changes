import { ImageResponse } from 'next/og';
import { brandFonts, Monogram } from '@/lib/brandImage';

// Google Search only shows favicons that are a multiple of 48px square
export const size = { width: 96, height: 96 };
export const contentType = 'image/png';

/** Browser-tab icon: the navbar's "js" monogram. */
export default async function Icon() {
  return new ImageResponse(<Monogram size={96} />, { ...size, fonts: await brandFonts() });
}
