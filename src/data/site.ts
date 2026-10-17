export const contact = {
  email: 'joypshah2003@gmail.com',
  github: 'https://github.com/joyshah62',
  linkedin: 'https://linkedin.com/in/joy-shah62',
  resume: '/resume.pdf',
  location: 'New Brunswick, NJ',
  coords: '40.4862° N · 74.4518° W',
};

export const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#journey', label: 'Experience' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

export const roles = ['3 internships', '2 hackathon wins', 'IEEE publication', 'Rutgers M.S. CS'];

/** Hero intro — written to be read out loud. Edit freely. */
export type Build = string | { typo: string; fix: string };

export const intro = {
  // Typed after "I build …". A { typo, fix } pair gets typed, "noticed", erased and corrected.
  builds: [
    { typo: 'Skynet.', fix: 'AI tutors that ask before they tell.' },
    'interviewers that talk back. Politely.',
    { typo: 'bugs.', fix: 'features. Mostly.' },
    'models that catch web attacks before my coffee kicks in.',
    "trip planners for friends who can't pick a restaurant.",
    'things that win hackathons at 4 AM.',
  ] as Build[],
  // What I'm probably doing right now, by hour in New Brunswick (24h, start inclusive)
  rightNow: [
    { from: 0, text: 'probably "just fixing one small thing." It is never one thing.' },
    { from: 6, text: 'probably negotiating with my alarm.' },
    { from: 9, text: 'probably teaching an AI tutor some patience.' },
    { from: 13, text: 'probably arguing with a Docker container.' },
    { from: 18, text: 'probably hacking on a side project instead of cooking.' },
  ],
  // What the 👋 says if you keep hovering it
  waveReplies: ['hey!', 'hi again 👀', 'okay, you can scroll now', "I'll wave all day. try me.", 'fine. you win. 🏳️'],
};

/** The three layers of the hero chip, revealed one at a time on scroll. */
export const heroBeats = [
  {
    index: '01',
    layer: 'Products',
    title: 'Interview practice, out loud.',
    body: 'Composur asks questions based on your résumé, follows up on your answers, and runs coding rounds in isolated Docker environments.',
  },
  {
    index: '02',
    layer: 'Applied AI',
    title: 'A tutor inside the notebook.',
    body: 'At CodeBench, I develop an AI teaching agent that reads student code, tests notebook cells, and guides students with questions.',
  },
  {
    index: '03',
    layer: 'Security',
    title: 'Fewer false alarms.',
    body: 'At Forenzy, I reduced false positives from 23% to 4% in a detection pipeline processing over 2 GB of web traffic data each day.',
  },
];

export const stats: Array<{ value?: number; textValue?: string; suffix: string; label: string; isFloat?: boolean }> = [
  { value: 3.75, suffix: '', label: "Master's GPA", isFloat: true },
  { value: 3, suffix: '', label: 'Engineering internships' },
  { value: 2, suffix: '', label: 'Hackathon wins' },
  { textValue: 'IEEE', suffix: '', label: 'Published researcher' },
];

export const recognition = [
  {
    year: '2026',
    title: 'Winner, Rutgers Health Hack',
    detail: 'Sevaro track winner for Cerevia, a staffing and scheduling tool for teleneurology teams.',
    href: 'https://github.com/RishiiShah/Health-Hack',
  },
  {
    year: '2026',
    title: 'Winner, DivHacks @ Columbia',
    detail: 'MLH Best Use of Backboard for PlaNYt, a shared NYC trip planner that adapts as plans change.',
    href: 'https://devpost.com/software/planyt',
  },
  {
    year: '2024',
    title: 'Published, IEEE CICT',
    detail: 'Computer vision research on detecting photo and video attacks against facial authentication.',
    href: 'https://ieeexplore.ieee.org/document/10899685',
  },
];

export interface TimelineEntry {
  number: string;
  period: string;
  org: string;
  role: string;
  description: string;
  tags: string[];
}

export const journey: TimelineEntry[] = [
  {
    number: '01',
    period: 'Jun 2026 to present',
    org: 'CodeBench · Rutgers University',
    role: 'Software Engineer Intern',
    description:
      'Developing CodeBench, a learning platform inside JupyterLab, across React interfaces, Python extensions, FastAPI services and database migrations. The AI tutor reads notebook context, edits and tests cells, and uses guided questions to help students reason through problems. Stored conversations and tool calls support replay, grading and instructor analytics.',
    tags: ['React', 'TypeScript', 'FastAPI', 'LLM Agents', 'Tool Calling', 'Alembic'],
  },
  {
    number: '02',
    period: 'Aug 2025 to May 2027',
    org: 'Rutgers University, New Brunswick',
    role: 'M.S. in Computer Science',
    description: 'Studying machine learning, artificial intelligence and systems while applying that work at CodeBench. Current GPA: 3.75 / 4. Expected graduation: May 2027.',
    tags: ['GPA 3.75', 'Machine Learning', 'AI', 'Systems'],
  },
  {
    number: '03',
    period: 'Jan 2025 to Apr 2025',
    org: 'Forenzy Networks',
    role: 'Software Engineer Intern, AI/ML Security',
    description:
      'Reduced false positives from 23% to 4% by normalizing logs in a web attack detection pipeline. Combined five BERT classifiers to reach a 97.2% F1 score while processing over 2 GB of HTTP telemetry daily. Built a monitoring dashboard that reduced security triage time by 65%.',
    tags: ['BERT', 'ModSecurity', 'Nginx', 'Flask', 'Docker Compose'],
  },
  {
    number: '04',
    period: 'May 2024 to Jun 2024',
    org: 'CyberNGO (Forenzy Networks)',
    role: 'Machine Learning Research Intern',
    description:
      'Curated over 100,000 fraud records from SMS, email and WhatsApp. Developed the text preprocessing pipeline and integrated a TF IDF classifier into an analyst portal to reduce manual review.',
    tags: ['Python', 'NLP', 'Scikit Learn', 'Data Curation'],
  },
  {
    number: '05',
    period: 'Dec 2021 to Jun 2025',
    org: 'Charusat University',
    role: 'B.Tech. in Computer Science & Engineering',
    description: 'Graduated with a 9.15 / 10 CGPA. Published research on facial liveness detection at IEEE CICT 2024.',
    tags: ['CGPA 9.15', 'Algorithms', 'Systems'],
  },
];

export interface ProjectLink {
  label: string;
  href: string;
}

export interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  links: ProjectLink[];
  /** Short word set large on the generated cover */
  cover: string;
  award?: string;
}

export const projects: Project[] = [
  {
    id: 'composur',
    title: 'Composur',
    cover: 'Composur.',
    subtitle: 'Interview practice that follows your answers',
    description:
      'Practice interviews aloud with an AI interviewer that uses your résumé and previous answers to shape each follow up. Hybrid retrieval selects relevant questions, Gemini drives the conversation, and ElevenLabs handles speech. Coding submissions run in isolated Docker environments, with feedback guided by a weighted scoring rubric.',
    tags: ['Gemini', 'ElevenLabs', 'pgvector', 'Hybrid Search', 'Docker'],
    links: [{ label: 'Live site', href: 'https://composur.tech' }],
  },
  {
    id: 'cerevia',
    title: 'Cerevia',
    cover: 'Cerevia.',
    subtitle: 'Staffing decisions for teleneurology teams',
    award: 'Winner · Rutgers Health Hack 2026',
    description:
      'Helps teleneurology teams spot staffing gaps and plan physician shifts around credential requirements. Each recommendation follows explicit rules that teams can inspect and audit. Winner of the Sevaro track at Rutgers Health Hack 2026.',
    tags: ['Forecasting', 'Scheduling', 'Explainable rules', 'Healthcare'],
    links: [
      { label: 'Demo', href: 'https://youtu.be/FweJcTVSq0c?si=dDUbH3iDAg5ZgDrJ' },
      { label: 'Source', href: 'https://github.com/RishiiShah/Health-Hack' },
    ],
  },
  {
    id: 'planyt',
    title: 'PlaNYt',
    cover: 'PlaNYt.',
    subtitle: 'One NYC itinerary for the whole group',
    award: 'Winner · DivHacks 2026',
    description:
      'Keeps a shared NYC itinerary up to date as a group changes its plans. AI agents revise the schedule while everyone stays in sync. Won MLH Best Use of Backboard at DivHacks 2026 at Columbia University.',
    tags: ['LLM Agents', 'Backboard', 'Live Planning', 'Group Sync'],
    links: [
      { label: 'Live site', href: 'https://planyt.tech/' },
      { label: 'Devpost', href: 'https://devpost.com/software/planyt' },
    ],
  },
  {
    id: 'liveness',
    title: 'Facial Liveness Detection',
    cover: 'Liveness.',
    subtitle: 'Distinguishing faces from spoofing attempts',
    award: 'Published · IEEE CICT 2024',
    description:
      'Detects photo and video replay attacks against facial authentication using YOLOv8, Dlib landmarks and a KNN classifier. Achieved 98.5% accuracy on a combined dataset of custom samples, NUAA and MSU MFSD. Published at IEEE CICT 2024.',
    tags: ['YOLOv8', 'Dlib', 'OpenCV', 'Computer Vision'],
    links: [{ label: 'Paper', href: 'https://ieeexplore.ieee.org/document/10899685' }],
  },
  {
    id: 'waf',
    title: 'Web Attack Detection',
    cover: 'Sentinel.',
    subtitle: 'Web attack detection with fewer false alarms',
    description:
      'Combines five BERT classifiers to detect attacks in HTTP traffic with a 97.2% F1 score. Processes over 2 GB of telemetry daily through Nginx and ModSecurity. A live dashboard shows attack patterns, confidence scores and explanations for each model.',
    tags: ['BERT', 'ModSecurity', 'Flask', 'Chart.js', 'Docker'],
    links: [{ label: 'Source', href: 'https://github.com/joyshah62/Web-Application-Firewall' }],
  },
  {
    id: 'codebench',
    title: 'CodeBench Teaching Agent',
    cover: 'Socratic.',
    subtitle: 'Guided coding help inside JupyterLab',
    description:
      'Helps students work through coding problems with questions grounded in their course and notebook. The agent can inspect, edit and test cells, then retrieve context from earlier conversations. Instructors can replay interactions and review how tools were used.',
    tags: ['LLM Agents', 'Tool Calling', 'JupyterLab', 'FastAPI', 'React'],
    links: [],
  },
];

export interface SkillCategory {
  id: string;
  label: string;
  color: string;
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    id: 'ai',
    label: 'AI & LLM Systems',
    color: '#ff4f1f',
    skills: ['LLM Agents', 'Tool Calling', 'RAG', 'Hybrid Search', 'Reranking', 'Prompt Engineering', 'Gemini', 'ElevenLabs'],
  },
  {
    id: 'ml',
    label: 'Machine Learning',
    color: '#d6246e',
    skills: ['PyTorch', 'Scikit Learn', 'BERT', 'YOLO', 'OpenCV', 'Pandas', 'NumPy'],
  },
  {
    id: 'web',
    label: 'Web & Backend',
    color: '#2b3bff',
    skills: ['FastAPI', 'Flask', 'React', 'REST APIs', 'SQLAlchemy', 'Alembic', 'JWT', 'JupyterLab Extensions'],
  },
  {
    id: 'databases',
    label: 'Databases',
    color: '#0e8a6a',
    skills: ['PostgreSQL', 'pgvector', 'MySQL', 'MongoDB'],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    color: '#d99a00',
    skills: ['AWS (S3)', 'Docker', 'Linux', 'Nginx', 'Git', 'Bash'],
  },
  {
    id: 'languages',
    label: 'Languages',
    color: '#7a3cff',
    skills: ['Python', 'TypeScript', 'JavaScript', 'SQL'],
  },
];

export const marqueeWords = [
  'LLM Agents', 'Tool Calling', 'Hybrid Search', 'Voice AI',
  'Computer Vision', 'Security ML', 'Web Development', 'Reranking',
];

export const marqueeTech = [
  'Python', 'TypeScript', 'PyTorch', 'BERT', 'YOLO', 'Gemini', 'ElevenLabs', 'FastAPI', 'React',
  'PostgreSQL', 'pgvector', 'Docker', 'Nginx', 'AWS', 'JupyterLab',
];
