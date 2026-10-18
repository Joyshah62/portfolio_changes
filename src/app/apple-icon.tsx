import { ImageResponse } from 'next/og';
import { brand, brandFonts, Monogram } from '@/lib/brandImage';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Home-screen icon: iOS rounds the corners itself, so the art fills the square. */
export default async function AppleIcon() {
  return new ImageResponse(<Monogram size={150} background={brand.ink} />, { ...size, fonts: await brandFonts() });
}
