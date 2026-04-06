'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Shield, Code2, Database, Cloud, BookOpen } from 'lucide-react';

interface SkillCategory {
  id: string;
  label: string;
  icon: React.ElementType;
  count: number;
  accent: string;
  skills: string[];
}

const categories: SkillCategory[] = [
  {
    id: 'ai-ml',
    label: 'AI / ML',
    icon: Brain,
    count: 12,
    accent: '#00ff88',
    skills: [
      'PyTorch', 'TensorFlow', 'Scikit-learn', 'HuggingFace',
      'LLaMA 3', 'BERT', 'Whisper', 'LangChain',
      'RAG', 'SHAP', 'LIME', 'Fine-tuning',
    ],
  },
  {
    id: 'security',
    label: 'Cybersecurity',
    icon: Shield,
    count: 10,
    accent: '#ff6b6b',
    skills: [
      'CTF Competitions', 'Reverse Engineering', 'Binary Exploitation',
      'Cryptography', 'Ghidra', 'pwntools', 'Burp Suite',
      'Wireshark', 'OSINT', 'Web Security',
    ],
  },
  {
    id: 'fullstack',
    label: 'Full-Stack',
    icon: Code2,
    count: 11,
    accent: '#38bdf8',
    skills: [
      'React', 'Next.js', 'TypeScript', 'FastAPI',
      'Flask', 'Node.js', 'WebSockets', 'REST APIs',
      'GraphQL', 'Tailwind CSS', 'Framer Motion',
    ],
  },
  {
    id: 'databases',
    label: 'Databases',
    icon: Database,
    count: 8,
    accent: '#c084fc',
    skills: [
      'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
      'SQLite', 'Query Optimization', 'Indexing', 'Transactions',
    ],
  },
  {
    id: 'cloud',
    label: 'Cloud & DevOps',
    icon: Cloud,
    count: 9,
    accent: '#fbbf24',
    skills: [
      'AWS (EC2, Lambda, S3)', 'Docker', 'Kubernetes',
      'GitHub Actions', 'Terraform', 'Prometheus', 'Grafana',
      'Nginx', 'Linux',
    ],
  },
  {
    id: 'languages',
    label: 'Languages',
    icon: BookOpen,
    count: 7,
    accent: '#a78bfa',
    skills: [
      'Python', 'TypeScript / JavaScript', 'Go',
      'Java', 'C / C++', 'SQL', 'Bash',
    ],
  },
];

function CategoryCard({ cat, index }: { cat: SkillCategory; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Icon = cat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#111',
        // Avoid mixing border shorthand with borderLeft longhand (React warning).
        // Use individual longhand properties for all four sides.
        borderTopWidth:    '1px',
        borderRightWidth:  '1px',
        borderBottomWidth: '1px',
        borderLeftWidth:   '3px',
        borderTopStyle:    'solid',
        borderRightStyle:  'solid',
        borderBottomStyle: 'solid',
        borderLeftStyle:   'solid',
        borderTopColor:    hovered ? `${cat.accent}40` : 'rgba(255,255,255,0.06)',
        borderRightColor:  hovered ? `${cat.accent}40` : 'rgba(255,255,255,0.06)',
        borderBottomColor: hovered ? `${cat.accent}40` : 'rgba(255,255,255,0.06)',
        borderLeftColor:   cat.accent,
        borderRadius: '16px',
        padding: '24px',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: hovered ? `0 0 30px ${cat.accent}10` : 'none',
        cursor: 'default',
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: `${cat.accent}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `1px solid ${cat.accent}25`,
            }}
          >
            <Icon size={16} style={{ color: cat.accent }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 700,
                fontSize: '1rem',
              }}
              className="text-[#f5f5f5]"
            >
              {cat.label}
            </div>
          </div>
        </div>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '0.65rem',
            color: cat.accent,
            padding: '2px 8px',
            background: `${cat.accent}10`,
            borderRadius: '20px',
            border: `1px solid ${cat.accent}20`,
          }}
        >
          {cat.count}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cat.skills.map((skill, i) => (
          <motion.span
            key={skill}
            animate={hovered ? { color: i % 3 === 0 ? cat.accent : '#888' } : { color: '#444' }}
            transition={{ duration: 0.2, delay: i * 0.02 }}
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              padding: '3px 8px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '4px',
            }}
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section id="skills" className="py-32 px-6 sm:px-8">
      <div className="max-w-6xl mx-auto">
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
            // 004 — SKILLS
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
            My Toolkit.
          </h2>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1rem' }}
            className="text-[#555] mt-3 max-w-xl"
          >
            Tools, languages, and frameworks I use to build intelligent systems and break security challenges.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <CategoryCard key={cat.id} cat={cat} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
