'use client';

import { motion } from 'framer-motion';

interface TimelineEntry {
  number: string;
  period: string;
  org: string;
  role: string;
  description: string;
  tags: string[];
  side: 'left' | 'right';
}

const entries: TimelineEntry[] = [
  {
    number: '01',
    period: 'Dec 2021 — Jun 2025',
    org: 'Charusat University',
    role: 'B.Tech. Computer Science & Engineering',
    description:
      'Graduated with a 9.15/10 CGPA. Built strong foundations in systems programming, data structures, and computer architecture before pivoting deeply into AI and cybersecurity.',
    tags: ['C++', 'Java', 'Algorithms', 'OS'],
    side: 'right',
  },
  {
    number: '02',
    period: 'May 2024 — Jun 2024',
    org: 'CyberNGO',
    role: 'Cybersecurity Research Intern',
    description:
      'Developed a full-stack fraud detection platform. Architected scalable Python backends with MySQL and a React frontend, integrating an NLP classifier that achieved 90% accuracy.',
    tags: ['Python', 'MySQL', 'React', 'NLP'],
    side: 'left',
  },
  {
    number: '03',
    period: 'Dec 2024 — Apr 2025',
    org: 'Forenzy Networks',
    role: 'AI/ML Intern',
    description:
      'Engineered a real-time security log pipeline on Apache ModSecurity processing 10K+ req/min. Designed Flask APIs with ELK dashboards and implemented a BERT-based anomaly detection engine.',
    tags: ['BERT', 'ModSecurity', 'Docker', 'ELK Stack'],
    side: 'right',
  },
  {
    number: '04',
    period: 'Aug 2025 — May 2027',
    org: 'Rutgers University - New Brunswick',
    role: 'M.S. in Computer Science',
    description:
      'Currently undertaking rigorous graduate coursework focusing heavily on Machine Learning, Deep Learning, and Distributed Systems while maintaining a 3.66 GPA.',
    tags: ['AI', 'Data Structures', 'NLP', 'Database Systems', 'Theory of Computation'],
    side: 'left',
  },
  {
    number: '05',
    period: 'Feb 2026 — Present',
    org: 'Rutgers University',
    role: 'Part Time Lecturer',
    description:
      'Delivering lectures and developing interactive course materials for 100+ undergraduate students on PostgreSQL indexing, ACID transactions, and modern architectures like DynamoDB and Neo4j.',
    tags: ['PostgreSQL', 'DynamoDB', 'Neo4j', 'Teaching'],
    side: 'right',
  },
];

export default function Journey() {
  return (
    <section id="journey" className="py-32 px-6 sm:px-8 relative overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(0,255,136,0.02) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="mb-20 text-center"
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
            className="text-[#00ff88] tracking-widest uppercase"
          >
            // 002 — JOURNEY
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
            How I Got Here.
          </h2>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Center line — sits behind the dots */}
          <div
            className="absolute top-0 bottom-0 w-px hidden md:block"
            style={{
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.08), transparent)',
            }}
          />

          <div className="space-y-10">
            {entries.map((entry, i) => (
              <motion.div
                key={entry.number}
                initial={{ opacity: 0, x: entry.side === 'left' ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative flex items-center group cursor-default ${entry.side === 'left'
                    ? 'md:flex-row-reverse'
                    : 'md:flex-row'
                  } flex-col md:flex-row gap-4 md:gap-0`}
              >
                {/* Card */}
                <div
                  className={`w-full md:w-[45%] ${entry.side === 'left' ? 'md:ml-auto md:pr-10' : 'md:mr-auto md:pl-10'
                    }`}
                >
                  <div
                    style={{
                      background: 'rgba(10,10,10,0.5)',
                      backdropFilter: 'blur(12px)',
                      border: `1px solid rgba(255,255,255,0.04)`,
                      borderRadius: '16px',
                      padding: '32px',
                      position: 'relative',
                      overflow: 'hidden',
                    }}
                    className="transition-all duration-500 group-hover:border-[#00ff88]/30 group-hover:bg-[#00ff88]/[0.02] group-hover:-translate-y-1 group-hover:shadow-[0_10px_40px_rgba(0,255,136,0.05)]"
                  >
                    {/* Big number watermark */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '-10px',
                        right: '16px',
                        fontFamily: "'Space Grotesk', sans-serif",
                        fontWeight: 800,
                        fontSize: '5.5rem',
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(255,255,255,0.05)',
                        lineHeight: 1,
                        letterSpacing: '-0.05em',
                        userSelect: 'none',
                      }}
                      className="transition-all duration-500 group-hover:[-webkit-text-stroke:1px_rgba(0,255,136,0.1)]"
                    >
                      {entry.number}
                    </div>

                    <div className="space-y-3 relative z-10">
                      <span
                        style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
                        className="text-[#555] tracking-widest uppercase transition-colors group-hover:text-[#888]"
                      >
                        {entry.period}
                      </span>

                      <div>
                        <div
                          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem' }}
                          className="mb-1"
                        >
                          <span className="text-[#00ff88]/60 group-hover:text-[#00ff88] transition-colors duration-500">{entry.org}</span>
                        </div>
                        <h3
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 700,
                            fontSize: '1.15rem',
                            letterSpacing: '-0.01em',
                          }}
                          className="text-[#f5f5f5]"
                        >
                          {entry.role}
                        </h3>
                      </div>

                      <p
                        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem', lineHeight: 1.7 }}
                        className="text-[#777] group-hover:text-[#a0a0a0] transition-colors duration-500"
                      >
                        {entry.description}
                      </p>

                      <div className="flex flex-wrap gap-2 pt-3">
                        {entry.tags.map((tag) => (
                          <span
                            key={tag}
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: '0.65rem',
                              padding: '4px 12px',
                            }}
                            className="rounded-full border border-white/5 bg-white/[0.02] text-[#666] transition-all duration-300 group-hover:border-[#00ff88]/30 group-hover:text-[#00ff88]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Center dot — absolutely centered on the vertical line */}
                <div
                  className="hidden md:block flex-shrink-0 relative z-10"
                  style={{ width: '10%', display: 'flex', justifyContent: 'center' }}
                >
                  <div
                    className="w-3.5 h-3.5 rounded-full border border-[#444] bg-[#0a0a0a] transition-all duration-500 group-hover:border-[#00ff88] group-hover:bg-[#00ff88] group-hover:shadow-[0_0_15px_rgba(0,255,136,0.6)] group-hover:scale-125 z-10"
                  />
                  {/* Ping effect behind the dot */}
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-[#00ff88] opacity-0 group-hover:opacity-100 group-hover:animate-ping pointer-events-none" />
                </div>

                {/* Empty side for spacing */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            ))}

            {/* What's Next */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.6 }}
              className="relative flex justify-center pt-8"
            >
              <div
                style={{
                  background: 'rgba(0,255,136,0.04)',
                  border: '1px dashed rgba(0,255,136,0.2)',
                  borderRadius: '16px',
                  padding: '24px 40px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontWeight: 700,
                    fontSize: '1.1rem',
                  }}
                  className="text-[#00ff88] mb-1"
                >
                  What&apos;s Next?
                </div>
                <p
                  style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}
                  className="text-[#555]"
                >
                  Open to Summer 2026 internship opportunities in AI/ML & Security
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
