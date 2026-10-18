'use client';

import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './SocialIcons';
import { contact } from '@/data/site';
import { useMagnetic } from '@/hooks/useMagnetic';
import { useInViewport } from './three/shared';
import SectionHeader from './SectionHeader';

const PaperPlane = dynamic(() => import('./three/PaperPlane'), { ssr: false });

export default function Contact() {
  const ref = useRef<HTMLElement>(null);
  const visible = useInViewport(ref);
  const reduced = useReducedMotion() ?? false;
  const cta = useMagnetic(0.35);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(contact.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = `mailto:${contact.email}`;
    }
  };

  return (
    <section id="contact" ref={ref} className="relative overflow-hidden bg-paper px-4 pb-16 pt-28 text-ink sm:px-8 md:pt-40">
      {/* Paper plane: roams the section, follows the cursor, circles "Get in touch" on hover */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <PaperPlane active={visible} reduced={reduced} />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px]">
        <SectionHeader index="06" label="Contact" title={<>Have a role <em>in mind?</em></>} />

        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8 }}
            className="max-w-lg text-[1.1rem] leading-relaxed text-ink-soft md:col-span-6"
          >
            I&apos;m looking for software and AI engineering roles where I can contribute across models,
            backend services, and product development. I graduate from Rutgers in May 2027 and am open
            to relocation. If that fits your team, I&apos;d like to hear what you&apos;re working on.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col items-start gap-6 md:col-span-6 md:items-end"
          >
            <a
              ref={cta}
              data-plane-target
              href={`mailto:${contact.email}`}
              className="group inline-flex items-center gap-4 rounded-full bg-signal py-3 pl-8 pr-3 text-lg font-semibold text-on-signal shadow-[0_20px_60px_-15px_rgba(255,79,31,0.6)]"
            >
              Get in touch
              <span className="grid h-12 w-12 place-items-center rounded-full bg-on-signal text-[#f5f1e8] transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight size={20} />
              </span>
            </a>
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 font-mono text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {copied ? <Check size={14} className="text-signal" /> : <Copy size={14} />}
              {copied ? 'Copied to clipboard' : contact.email}
            </button>
          </motion.div>
        </div>

        <div className="mt-[22vh] grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-line bg-line backdrop-blur-md md:mt-[28vh] md:grid-cols-4">
          {[
            { label: 'GitHub', value: '@joyshah62', href: contact.github, icon: GithubIcon },
            { label: 'LinkedIn', value: 'Joy Shah', href: contact.linkedin, icon: LinkedinIcon },
            { label: 'Résumé', value: 'View PDF', href: contact.resume },
            { label: 'Based in', value: contact.location },
          ].map(({ label, value, href, icon: Icon }) => {
            const inner = (
              <>
                <span className="eyebrow flex items-center gap-2 text-muted">
                  {Icon && <Icon size={12} />}
                  {label}
                </span>
                <span className="mt-3 block font-serif text-2xl text-ink">{value}</span>
              </>
            );
            return href ? (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-paper/80 p-5 transition-colors hover:bg-card sm:p-6"
              >
                {inner}
              </a>
            ) : (
              <div key={label} className="bg-paper/80 p-5 sm:p-6">
                {inner}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
