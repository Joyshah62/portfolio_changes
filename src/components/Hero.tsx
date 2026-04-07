'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Mail, ArrowDown, FileText } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import CyberBackground from './CyberBackground';

const roles = ['AI/ML Engineer', 'Security Researcher', 'CS336 Lecturer', 'CTF Competitor', 'Full-Stack Builder'];

const wordVariants: Variants = {
  hidden: { opacity: 0, y: 80 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: 'easeOut' },
  }),
};

export default function Hero() {
  const [roleIndex, setRoleIndex] = useState(0);
  const magneticRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setRoleIndex((i) => (i + 1) % roles.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.35;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.35;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handleLeave = () => {
      el.style.transform = 'translate(0,0)';
      el.style.transition = 'transform 0.5s ease';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  const headingWords = ['I Build', 'Intelligent', 'Systems.'];

  return (
    <section
      id="home"
      className="relative min-h-[100svh] flex items-center"
      style={{
        background:
          'radial-gradient(ellipse 80% 60% at 10% 50%, rgba(0,255,136,0.04) 0%, transparent 60%), #080808',
      }}
    >
      {/* Dot grid background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* 3D Cyber Particle Network */}
      <CyberBackground />

      <div className="relative z-10 max-w-6xl mx-auto px-6 sm:px-8 w-full pt-32 pb-24 md:pt-24 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

          {/* LEFT — Content */}
          <div className="space-y-8">
            {/* Status pill */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
                className="inline-flex items-center gap-2 text-[#00ff88] tracking-widest uppercase"
              >
                <span className="relative flex items-center justify-center w-2 h-2">
                  <span className="absolute w-2 h-2 rounded-full bg-[#00ff88] animate-ping opacity-60" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88]" />
                </span>
                // Available for work · 2026
              </span>
            </motion.div>

            {/* Heading */}
            <div className="overflow-hidden">
              {headingWords.map((word, i) => (
                <div key={i} className="overflow-hidden">
                  <motion.h1
                    custom={i}
                    initial="hidden"
                    animate="visible"
                    variants={wordVariants}
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      fontSize: 'clamp(3.2rem, 7vw, 6.5rem)',
                      lineHeight: 1.0,
                      letterSpacing: '-0.03em',
                    }}
                    className={`block ${i === 2 ? 'text-[#00ff88]' : 'text-[#f5f5f5]'}`}
                  >
                    {word}
                  </motion.h1>
                </div>
              ))}
            </div>

            {/* Role pill */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="flex items-center gap-3"
            >
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                className="text-[#555]"
              >
                Currently:
              </span>
              <motion.span
                key={roleIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
                className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] rounded-full"
              >
                [ {roles[roleIndex]} ]
              </motion.span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.6 }}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', lineHeight: 1.7 }}
              className="text-[#999] max-w-lg"
            >
              MS CS candidate at Rutgers. I build AI systems that actually work —
              from RAG pipelines and LLM agents to scalable full-stack applications.
              Seeking Summer 2026 SWE/ML internships.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75, duration: 0.6 }}
              className="flex items-center gap-4 flex-wrap"
            >
              <a
                href="/resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                className="flex items-center gap-2.5 px-6 py-3 border border-[#00ff88]/30 bg-[#00ff88]/5 text-[#00ff88] rounded-xl hover:border-[#00ff88] hover:bg-[#00ff88]/10 hover:shadow-[0_0_20px_rgba(0,255,136,0.15)] transition-all duration-300"
              >
                <FileText size={18} />
                <span>Resume</span>
              </a>
              <a
                href="#projects"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 500 }}
                className="px-6 py-3 border border-white/10 text-[#f5f5f5] rounded-xl hover:border-white/30 transition-all duration-200 hover:bg-white/5"
              >
                View Projects
              </a>
              <a
                ref={magneticRef}
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
                data-magnetic
                style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: 600,
                  transition: 'transform 0.2s ease',
                }}
                className="px-6 py-3 bg-[#00ff88] text-black rounded-xl hover:bg-[#00ff88]/90 transition-colors"
              >
                Say Hello ✦
              </a>
            </motion.div>

            {/* Social icons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center gap-5 pt-2"
            >
              {[
                { icon: GithubIcon, href: 'https://github.com/joyshah62', label: 'GitHub' },
                { icon: LinkedinIcon, href: 'https://linkedin.com/in/joyshah62', label: 'LinkedIn' },
                { icon: Mail, href: 'mailto:js4107@scarletmail.rutgers.edu', label: 'Email' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-[#555] hover:text-[#00ff88] transition-colors duration-200"
                >
                  <Icon size={18} />
                </a>
              ))}
              <span className="w-12 h-px bg-white/10" />
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
                className="text-[#555]"
              >
                New Brunswick, NJ
              </span>
            </motion.div>
          </div>

          {/* RIGHT — Visual */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:flex flex-col items-center justify-center w-full relative"
          >
            {/* Floating Photo Container */}
            <motion.div
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-10 w-[280px] h-[340px] md:mr-12 shrink-0 mb-8"
            >
              {/* Glow Behind */}
              <div className="absolute inset-0 bg-[#00ff88]/10 blur-[80px] rounded-full pointer-events-none" />

              {/* Photo Frame */}
              <div className="absolute inset-0 rounded-[2rem] overflow-hidden border border-white/10 bg-[#111] p-2.5 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden bg-[#0a0a0a]">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 pointer-events-none" />
                  <img
                    src="profile.jpeg"
                    alt="Joy Shah"
                    className="w-full h-full object-cover object-[center_top] scale-[1.03]"
                  />
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
            className="text-[#333] tracking-widest uppercase"
          >
            scroll
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            <ArrowDown size={14} className="text-[#333]" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
