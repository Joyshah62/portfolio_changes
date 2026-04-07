'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import { GithubIcon } from './SocialIcons';

interface Project {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tags: string[];
  github?: string;
  demo?: string;
  image?: string;
  featured?: boolean;
  span?: string;
}

const projects: Project[] = [
  {
    id: 'snapinterview',
    title: 'SnapInterview',
    subtitle: 'LLM-Powered Mock Interview Platform',
    description:
      'Engineered a RAG pipeline with semantic chunking to generate context-aware interview questions via LLaMA-3.2-3B. Designed an AI agent orchestrating Whisper transcription, retrieval-augmented generation, and a weighted rubric evaluation engine.',
    tags: ['LLaMA 3', 'RAG', 'Whisper', 'React', 'AWS S3', 'Python'],
    github: 'https://github.com/joyshah62/',
    featured: true,
    span: 'lg:col-span-2',
  },
  {
    id: 'bvs-platform',
    title: 'BVS Ayurvedic Platform',
    subtitle: 'Ecommerce & Management Full-Stack',
    description:
      'Developed a production e-commerce platform managing 200+ SKUs with real-time inventory tracking. Architected a Flask and ReactJS system with role-based access control, Razorpay, and Dockerized AWS deployment.',
    tags: ['ReactJS', 'Flask', 'MongoDB', 'AWS S3', 'Docker', 'Razorpay'],
    github: 'https://github.com/joyshah62',
    span: 'lg:col-span-1',
  },
  {
    id: 'fraud-detection',
    title: 'Fraud Detection Engine',
    subtitle: 'Real-Time NLP Classifier',
    description:
      'Built a full-stack fraud detection platform integrating an NLP classifier achieving 90% accuracy. Architected scalable Python backend services with MySQL and a responsive React frontend with JWT authentication.',
    tags: ['Python', 'NLP', 'MySQL', 'React', 'JWT'],
    github: 'https://github.com/joyshah62',
    span: 'lg:col-span-1',
  },
  {
    id: 'threat-pipeline',
    title: 'Threat Intel Pipeline',
    subtitle: 'Live Attack Analytics',
    description:
      'Engineered a real-time security log pipeline on Apache ModSecurity processing 10K+ req/min. Implemented a BERT-based HTTP anomaly detection engine achieving 95% accuracy using honeypot data.',
    tags: ['Python', 'BERT', 'ModSecurity', 'ELK Stack', 'Docker'],
    github: 'https://github.com/joyshah62/Web-Application-Firewall',
    span: 'lg:col-span-1',
  },
  {
    id: 'dist-db',
    title: 'Database Architecture Systems',
    subtitle: 'Advanced Database Operations',
    description:
      'Built robust systems demonstrating ACID transactions, concurrency control, and query optimization. Engineered integrations spanning relational PostgreSQL and NoSQL stores including DynamoDB and MongoDB.',
    tags: ['PostgreSQL', 'DynamoDB', 'MongoDB', 'Neo4j', 'SQL'],
    github: 'https://github.com/joyshah62',
    span: 'lg:col-span-1',
  },
  {
    id: 'ieee-yolo',
    title: 'Strengthening Facial Biometrics',
    subtitle: 'IEEE Publication • Liveness Detection for Anti-Spoofing',
    description:
      'Proposed an end-to-end face recognition and liveness detection system combining Dlib and YOLOv8, trained on NUAA, MSU-MFSD, and a custom spoofing dataset, achieving 98.5% accuracy against diverse spoofing attacks.',
    tags: ['YOLOv8', 'Computer Vision', 'PyTorch', 'Dlib', 'Biometrics'],
    demo: 'https://ieeexplore.ieee.org/document/10899685',
    span: 'lg:col-span-3',
  },
];

function ProjectCard({ project, featured, fullWidth }: { project: Project; featured?: boolean; fullWidth?: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'translateY(-5px)';
    el.style.borderColor = `rgba(0, 255, 136, 0.3)`;
    el.style.boxShadow = `0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(0,255,136,0.1), 0 0 40px rgba(0,255,136,0.06)`;
    el.style.background = `rgba(0, 255, 136, 0.02)`;
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'translateY(0)';
    el.style.borderColor = 'rgba(255,255,255,0.06)';
    el.style.boxShadow = 'none';
    el.style.background = 'rgba(12, 12, 12, 0.6)';
  };

  const isFull = fullWidth ?? false;
  const isFeatured = featured ?? false;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(12, 12, 12, 0.6)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '24px',
        overflow: 'hidden',
        position: 'relative',
        transition: 'transform 0.4s cubic-bezier(0.23,1,0.32,1), box-shadow 0.4s ease, border-color 0.4s ease, background 0.4s ease',
        willChange: 'transform',
      }}
      className="group cursor-pointer h-full border border-white/5"
    >
      {/* Subtle Glow Strip at Top */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.8), transparent)`,
        }}
      />

      {/* Hover Spotlight Base Glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-[24px]"
        style={{
          boxShadow: `inset 0 0 60px rgba(0,255,136,0.03)`,
        }}
      />

      {/* Dynamic Mouse Spotlight */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[24px]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.04), transparent 40%)`,
        }}
      />

      <div className={`p-6 relative z-10 ${isFull ? 'md:flex md:items-center md:gap-12' : ''} ${isFeatured ? 'p-8' : ''}`}>
        {project.image && (
          <div
            className={`rounded-xl overflow-hidden relative transition-colors duration-500 border border-white/[0.03] bg-black ${isFull ? 'md:w-1/2 mb-8 md:mb-0' : 'mb-6'} shrink-0 group-hover:border-[#00ff88]/20`}
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-[140px] md:h-[180px] object-cover object-[center_top] group-hover:scale-[1.03] transition-transform duration-700 opacity-80 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent pointer-events-none" />
          </div>
        )}
        <div className={isFull ? 'flex-1' : ''}>
          <div
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
            className="text-[#666] uppercase tracking-widest mb-2"
          >
            {project.subtitle}
          </div>

          <h3
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: isFeatured ? '1.6rem' : isFull ? '1.4rem' : '1.1rem',
              letterSpacing: '-0.02em',
            }}
            className="text-[#f5f5f5] mb-3"
          >
            {project.title}
          </h3>

          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.7 }}
            className="text-[#999] mb-5"
          >
            {project.description}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {project.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.68rem',
                  padding: '4px 12px',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '100px',
                  color: '#a0a0a0',
                }}
                className="group-hover:border-[#00ff88]/30 group-hover:text-[#e0e0e0] transition-colors duration-300"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={`flex items-center gap-4 ${isFull ? 'md:flex-col md:gap-4' : ''}`}>
          {project.github && (
            <a
              href={project.github}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#777] hover:text-[#00ff88] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem' }}
            >
              <GithubIcon size={16} />
              <span>Source</span>
            </a>
          )}
          {project.demo && (
            <a
              href={project.demo}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-[#777] hover:text-[#00ff88] transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem' }}
            >
              <ExternalLink size={16} />
              <span>Live Demo</span>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" className="py-32 px-6 sm:px-8 relative">
      <div className="max-w-6xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
            className="text-[#00ff88] tracking-widest uppercase"
          >
            // 003 — PROJECTS
          </span>
          <h2
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              letterSpacing: '-0.03em',
            }}
            className="text-[#f5f5f5] mt-4"
          >
            Things I&apos;ve Built.
          </h2>
        </motion.div>

        {/* Bento Grid — static col-span wrappers so Tailwind detects the classes */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Row 1: featured (2/3) + small (1/3) */}
          <div className="lg:col-span-2"><ProjectCard project={projects[0]} featured /></div>
          <div className="lg:col-span-1"><ProjectCard project={projects[1]} /></div>
          {/* Row 2: three equal cards */}
          <div className="lg:col-span-1"><ProjectCard project={projects[2]} /></div>
          <div className="lg:col-span-1"><ProjectCard project={projects[3]} /></div>
          <div className="lg:col-span-1"><ProjectCard project={projects[4]} /></div>
          {/* Row 3: full-width */}
          <div className="lg:col-span-3"><ProjectCard project={projects[5]} fullWidth /></div>
        </div>

        {/* Footer link */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 text-center"
        >
          <a
            href="https://github.com/joyshah62"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.9rem' }}
            className="inline-flex items-center gap-2 text-[#555] hover:text-[#00ff88] transition-colors border-b border-[#333] hover:border-[#00ff88] pb-0.5"
          >
            <GithubIcon size={14} />
            View all projects on GitHub →
          </a>
        </motion.div>
      </div>
    </section>
  );
}
