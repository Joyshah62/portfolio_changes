import { contact, projects, recognition, skillCategories } from '@/data/site';

/**
 * Canonical origin for metadata, the sitemap and structured data.
 * NEXT_PUBLIC_SITE_URL overrides it (e.g. for a preview deploy).
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://joyshah.tech').replace(/\/$/, '');

export const site = {
  name: 'Joy Shah',
  title: 'Joy Shah | Software Engineer & Applied AI',
  shortTitle: 'Joy Shah',
  // Kept under ~155 characters so Google shows it without truncating.
  description:
    'I’m Joy Shah, a software engineer and Rutgers CS master’s student building AI applications, backend systems, and machine learning for security.',
  tagline: 'Software engineer & applied AI',
  locale: 'en_US',
};

/**
 * When the site's content last meaningfully changed (YYYY-MM-DD). Bump it when you
 * update projects, experience or the résumé; it feeds the sitemap and ProfilePage.
 * A fixed date is a trustworthy signal, unlike `new Date()` on every request.
 */
export const siteUpdated = '2026-11-06';

/**
 * Other profiles that are you (Devpost, Google Scholar, ORCID, X…). They help
 * search engines tell this Joy Shah apart from others with the same name.
 */
const otherProfiles: string[] = [
  'https://devpost.com/Joyshah62',
  'https://scholar.google.com/citations?user=5ClZxaAAAAAJ',
];

const rutgers = { '@type': 'CollegeOrUniversity', name: 'Rutgers University–New Brunswick', sameAs: 'https://www.rutgers.edu' };
const charusat = {
  '@type': 'CollegeOrUniversity',
  name: 'Charotar University of Science and Technology',
  alternateName: 'CHARUSAT',
};

/** Published research, linked from the project list and the Person node. */
const paperId = `${siteUrl}/#liveness-paper`;
const paper = {
  '@type': 'ScholarlyArticle',
  '@id': paperId,
  headline: 'Strengthening Facial Biometrics: An Innovative Approach to Liveness Detection for Anti-Spoofing',
  name: 'Strengthening Facial Biometrics: An Innovative Approach to Liveness Detection for Anti-Spoofing',
  url: 'https://ieeexplore.ieee.org/document/10899685',
  author: { '@id': `${siteUrl}/#person` },
  publisher: { '@type': 'Organization', name: 'IEEE' },
  isPartOf: { '@type': 'PublicationEvent', name: 'IEEE CICT 2024' },
  about: ['Facial liveness detection', 'Anti-spoofing', 'Biometric authentication', 'Computer vision'],
  keywords: 'YOLOv8, Dlib, KNN, OpenCV, face anti-spoofing, presentation attack detection',
};

/** schema.org ProfilePage + Person + WebSite + projects, so search engines can show a proper profile result. */
export function structuredData() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ProfilePage',
        '@id': `${siteUrl}/#profile`,
        url: siteUrl,
        name: site.title,
        description: site.description,
        dateModified: siteUpdated,
        inLanguage: 'en-US',
        isPartOf: { '@id': `${siteUrl}/#website` },
        mainEntity: { '@id': `${siteUrl}/#person` },
        hasPart: { '@id': `${siteUrl}/#projects` },
      },
      {
        '@type': 'Person',
        '@id': `${siteUrl}/#person`,
        name: site.name,
        givenName: 'Joy',
        familyName: 'Shah',
        url: siteUrl,
        image: `${siteUrl}/profile.jpeg`,
        jobTitle: 'Software Engineer',
        worksFor: { '@type': 'Organization', name: 'CodeBench', parentOrganization: rutgers },
        description: site.description,
        email: `mailto:${contact.email}`,
        address: { '@type': 'PostalAddress', addressLocality: 'New Brunswick', addressRegion: 'NJ', addressCountry: 'US' },
        alumniOf: [rutgers, charusat],
        hasCredential: {
          '@type': 'EducationalOccupationalCredential',
          name: 'B.Tech. in Computer Science & Engineering',
          credentialCategory: 'degree',
          recognizedBy: charusat,
        },
        award: recognition.map((r) => r.title),
        knowsAbout: skillCategories.flatMap((c) => c.skills).slice(0, 24),
        sameAs: [contact.github, contact.linkedin, ...otherProfiles],
      },
      paper,
      {
        '@type': 'ItemList',
        '@id': `${siteUrl}/#projects`,
        name: `Projects by ${site.name}`,
        itemListElement: projects.map((project, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          // The research project is the published paper itself.
          item: project.id === 'liveness' ? { '@id': paperId } : {
            '@type': 'CreativeWork',
            name: project.title,
            headline: project.subtitle,
            description: project.description,
            keywords: project.tags.join(', '),
            ...(project.links[0] && { url: project.links[0].href }),
            ...(project.award && { award: project.award }),
            author: { '@id': `${siteUrl}/#person` },
          },
        })),
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
