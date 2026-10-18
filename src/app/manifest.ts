import type { MetadataRoute } from 'next';
import { site } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: site.title,
    short_name: site.shortTitle,
    description: site.description,
    start_url: '/',
    display: 'browser',
    background_color: '#121311',
    theme_color: '#121311',
    icons: [
      { src: '/icon', sizes: '64x64', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
