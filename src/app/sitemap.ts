import type { MetadataRoute } from 'next';
import { siteUpdated, siteUrl } from '@/lib/seo';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: siteUrl, lastModified: siteUpdated, changeFrequency: 'monthly', priority: 1 },
    { url: `${siteUrl}/resume.pdf`, lastModified: siteUpdated, changeFrequency: 'monthly', priority: 0.6 },
  ];
}
