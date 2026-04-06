'use client';

import { motion } from 'framer-motion';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#journey', label: 'Journey' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

export default function Footer() {
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        borderTop: '1px solid rgba(255,255,255,0.04)',
        background: '#060606',
      }}
      className="py-10 px-6 sm:px-8"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + tagline */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem' }}
                className="text-[#f5f5f5]"
              >
                Joy
              </span>
              <span
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '1.1rem' }}
                className="text-[#00ff88]"
              >
                Shah
              </span>
            </div>
            <span className="w-px h-4 bg-white/10" />
            <span
              style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
              className="text-[#444]"
            >
              AI/ML Engineer & Security Researcher
            </span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem' }}
                className="text-[#444] hover:text-[#666] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-4">
            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
                className="text-[#00ff88]"
              >
                Open to opportunities
              </span>
            </div>
          </div>
        </div>

        <div
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)' }}
          className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-2"
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
            className="text-[#333]"
          >
            © 2026 Joy Shah. Built with Next.js, Tailwind CSS & Framer Motion.
          </span>
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
            className="text-[#222]"
          >
            Designed & developed by Joy Shah.
          </span>
        </div>
      </div>
    </footer>
  );
}
