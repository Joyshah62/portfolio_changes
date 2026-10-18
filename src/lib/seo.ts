import { contact, skillCategories } from '@/data/site';

/**
 * Canonical origin for metadata, the sitemap and structured data.
 * NEXT_PUBLIC_SITE_URL overrides it (e.g. for a preview deploy).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://joyshah.tech').replace(/\/$/, '');

export const site = {
  name: 'Joy Shah',
  title: 'Joy Shah | Software Engineer & Applied AI',
  shortTitle: 'Joy Shah',
  description:
    'Joy Shah is a software engineer and Rutgers M.S. CS student building applied AI: LLM agents, RAG, and ML security. Three internships, two hackathon wins, IEEE research.',
  tagline: 'Software engineer & applied AI',
  locale: 'en_US',
};

/** schema.org Person + WebSite, so search engines can show a proper profile result. */
export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: site.name,
        url: siteUrl,
        image: `${siteUrl}/profile.jpeg`,
        jobTitle: 'Software Engineer',
        description: site.description,
        email: `mailto:${contact.email}`,
        address: { '@type': 'PostalAddress', addressLocality: 'New Brunswick', addressRegion: 'NJ', addressCountry: 'US' },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Rutgers University' },
        knowsAbout: skillCategories.flatMap((c) => c.skills).slice(0, 24),
        sameAs: [contact.github, contact.linkedin],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: site.name,
        description: site.description,
        inLanguage: 'en-US',
        publisher: { '@id': `${siteUrl}/#person` },
      },
    ],
  };
}
