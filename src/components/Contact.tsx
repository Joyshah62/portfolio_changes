'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';

export default function Contact() {
  const magneticRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = magneticRef.current;
    if (!el) return;
    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) * 0.4;
      const y = (e.clientY - rect.top - rect.height / 2) * 0.4;
      el.style.transform = `translate(${x}px, ${y}px)`;
    };
    const handleLeave = () => {
      el.style.transform = 'translate(0,0)';
      el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)';
    };
    const handleEnter = () => {
      el.style.transition = 'transform 0.1s ease';
    };
    el.addEventListener('mousemove', handleMove);
    el.addEventListener('mouseleave', handleLeave);
    el.addEventListener('mouseenter', handleEnter);
    return () => {
      el.removeEventListener('mousemove', handleMove);
      el.removeEventListener('mouseleave', handleLeave);
      el.removeEventListener('mouseenter', handleEnter);
    };
  }, []);

  return (
    <section
      id="contact"
      className="py-32 px-6 sm:px-8 relative"
      style={{
        background:
          'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(0,255,136,0.05) 0%, transparent 70%), #080808',
      }}
    >
      {/* Background dots */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
            className="text-[#00ff88] tracking-widest uppercase"
          >
            // 005 — CONTACT
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: 'clamp(3rem, 8vw, 6.5rem)',
            letterSpacing: '-0.04em',
            lineHeight: 1.0,
          }}
          className="text-[#f5f5f5] mt-6 mb-6"
        >
          Let&apos;s work
          <br />
          <span className="text-[#00ff88]">together.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.1rem', lineHeight: 1.7 }}
          className="text-[#666] max-w-lg mx-auto mb-12"
        >
          I&apos;m currently open to Summer 2026 internship opportunities.
          Whether you have a role, a project, or just want to talk AI and security
          — my inbox is open.
        </motion.p>

        {/* Main CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex justify-center mb-16"
        >
          <a
            ref={magneticRef}
            href="mailto:js3363@scarletmail.rutgers.edu"
            data-magnetic
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 700,
              fontSize: '1.1rem',
              padding: '20px 48px',
              background: '#00ff88',
              color: '#000',
              borderRadius: '100px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 40px rgba(0,255,136,0.25)',
              transition: 'box-shadow 0.3s ease, transform 0.2s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 60px rgba(0,255,136,0.4)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 0 40px rgba(0,255,136,0.25)';
            }}
          >
            <Mail size={18} />
            Send me an email →
          </a>
        </motion.div>

        {/* Social links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex items-center justify-center gap-8"
        >
          {[
            {
              icon: GithubIcon,
              href: 'https://github.com/joyshah62',
              label: 'GitHub',
            },
            {
              icon: LinkedinIcon,
              href: 'https://linkedin.com/in/joy-shah62',
              label: 'LinkedIn',
            },
            {
              icon: Mail,
              href: 'mailto:js4107@scarletmail.rutgers.edu',
              label: 'Email',
            },
          ].map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith('http') ? '_blank' : undefined}
              rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                className="group-hover:border-[#00ff88]/40 group-hover:bg-[#00ff88]/5"
              >
                <Icon size={18} className="text-[#555] group-hover:text-[#00ff88] transition-colors" />
              </div>
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.6rem' }}
                className="text-[#333] group-hover:text-[#555] transition-colors uppercase tracking-wider"
              >
                {label}
              </span>
            </a>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
