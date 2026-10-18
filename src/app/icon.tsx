import { ImageResponse } from 'next/og';
import { brandFonts, Monogram } from '@/lib/brandImage';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Browser-tab icon: the navbar's "js" monogram. */
export default async function Icon() {
  return new ImageResponse(<Monogram size={64} />, { ...size, fonts: await brandFonts() });
}
