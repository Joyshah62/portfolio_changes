'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useMagnetic } from '../hooks/useMagnetic';
import { playTick } from '../utils/audio';

const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#about', label: 'About' },
  { href: '#journey', label: 'Journey' },
  { href: '#projects', label: 'Projects' },
  { href: '#skills', label: 'Skills' },
  { href: '#contact', label: 'Contact' },
];

function MagneticNavLink({ link, isActive, onClick }: any) {
  const magneticRef = useMagnetic(0.25);
  return (
    <a
      ref={magneticRef}
      href={link.href}
      onClick={(e) => onClick(e, link.href)}
      onMouseEnter={playTick}
      className="relative flex flex-col items-center gap-1 group px-3 py-2 cursor-pointer"
    >
      <span
        style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}
        className={`transition-colors duration-200 ${
          isActive ? 'text-[#f5f5f5]' : 'text-[#666] hover:text-[#f5f5f5]'
        }`}
      >
        {link.label}
      </span>
      <motion.span
        animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-[#00ff88]"
      />
    </a>
  );
}

function MagneticCTA({ href, onClick, children }: any) {
  const magneticRef = useMagnetic(0.35);
  return (
    <a
      ref={magneticRef}
      href={href}
      onClick={(e) => onClick(e, href)}
      onMouseEnter={playTick}
      style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}
      className="px-5 py-2.5 border border-[#00ff88]/50 text-[#00ff88] rounded-lg hover:bg-[#00ff88] hover:text-black transition-all duration-300 tracking-wide font-medium"
    >
      {children}
    </a>
  );
}

export default function Navbar() {
  const [activeSection, setActiveSection] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sections = navLinks.map((l) => l.href.replace('#', ''));
    const observers: IntersectionObserver[] = [];

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMenuOpen(false);
    const id = href.replace('#', '');
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-[999] transition-all duration-300 ${
          scrolled
            ? 'backdrop-blur-xl bg-[#080808]/90 border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <a
            href="#home"
            onClick={(e) => handleLinkClick(e, '#home')}
            className="flex items-center gap-3 group"
          >
            {/* JS monogram mark */}
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'rgba(0,255,136,0.08)',
                border: '1px solid rgba(0,255,136,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
              }}
              className="group-hover:border-[#00ff88]/50 group-hover:bg-[#00ff88]/15 group-hover:[box-shadow:0_0_16px_rgba(0,255,136,0.2)]"
            >
              <span
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 800,
                  fontSize: '0.85rem',
                  letterSpacing: '-0.04em',
                  color: '#00ff88',
                  lineHeight: 1,
                }}
              >
                JS
              </span>
            </div>

            {/* Name */}
            <span
              style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: '1rem' }}
              className="text-[#f5f5f5] tracking-tight hidden sm:inline"
            >
              Joy <span className="text-[#00ff88]">Shah</span>
            </span>
          </a>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => (
              <MagneticNavLink
                key={link.href}
                link={link}
                isActive={activeSection === link.href.replace('#', '')}
                onClick={handleLinkClick}
              />
            ))}
          </div>

          {/* CTA */}
          <div className="hidden md:flex ml-4">
            <MagneticCTA href="#contact" onClick={handleLinkClick}>
              Get in Touch →
            </MagneticCTA>
          </div>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-[#f5f5f5] p-1"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[998] bg-[#080808]/98 backdrop-blur-xl flex flex-col items-center justify-center gap-10"
          >
            {navLinks.map((link, i) => (
              <motion.a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2.5rem' }}
                className={`${
                  activeSection === link.href.replace('#', '')
                    ? 'text-[#00ff88]'
                    : 'text-[#555] hover:text-[#f5f5f5]'
                } transition-colors`}
              >
                {link.label}
              </motion.a>
            ))}
            <motion.a
              href="mailto:js3363@scarletmail.rutgers.edu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.875rem' }}
              className="mt-4 px-6 py-3 border border-[#00ff88]/60 text-[#00ff88] rounded-full"
            >
              Get in Touch →
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
