'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: 26, suffix: '+', label: 'Projects Built' },
  { value: 3.66, suffix: '', label: 'GPA · Rutgers MS', isFloat: true },
  { value: 100, suffix: '+', label: 'Students Taught' },
  { value: 5, suffix: '+', label: 'CTF Competitions' },
];

function CountUp({ value, suffix, isFloat }: { value: number; suffix: string; isFloat?: boolean }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 50;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        current = value;
        clearInterval(timer);
      }
      setCount(current);
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {isFloat ? count.toFixed(2) : Math.floor(count)}{suffix}
    </span>
  );
}

const terminalContent = [
  { type: 'cmd', text: 'whoami' },
  { type: 'out', text: 'Joy Shah', color: '#00ff88' },
  { type: 'cmd', text: 'cat info.txt' },
  { type: 'out', text: 'MS CS @ Rutgers (GPA: 3.66)', color: '#f5f5f5' },
  { type: 'out', text: 'AI/ML Engineer + CTF Competitor', color: '#f5f5f5' },
  { type: 'out', text: 'CS336 Lecturer — 100+ students', color: '#f5f5f5' },
  { type: 'out', text: 'Based in New Brunswick, NJ', color: '#f5f5f5' },
  { type: 'cmd', text: 'ls skills/' },
  { type: 'out', text: 'ai-ml/  cybersec/  fullstack/  teaching/', color: '#c084fc' },
  { type: 'cmd', text: 'cat currently.txt' },
  { type: 'out', text: 'Open to Summer 2026 internships ✓', color: '#00ff88' },
];

function TerminalBlock() {
  const [visibleLines, setVisibleLines] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setVisibleLines(i);
      if (i >= terminalContent.length) clearInterval(timer);
    }, 200);
    return () => clearInterval(timer);
  }, [inView]);

  return (
    <div
      ref={ref}
      style={{
        background: '#0a0a0a',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '32px',
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Window bar */}
      <div
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
        className="flex items-center gap-1.5 px-4 py-3"
      >
        <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
        <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
        <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
        <span
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
          className="ml-3 text-[#333]"
        >
          terminal — joy@rutgers
        </span>
      </div>

      <div className="p-6 md:p-8 space-y-1.5 flex-1 bg-black/20">
        {terminalContent.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex gap-2"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', lineHeight: 1.6 }}
          >
            {line.type === 'cmd' ? (
              <>
                <span className="text-[#00ff88]">$</span>
                <span className="text-[#f5f5f5]">{line.text}</span>
              </>
            ) : (
              <>
                <span className="text-[#333]">›</span>
                <span style={{ color: line.color }}>{line.text}</span>
              </>
            )}
          </motion.div>
        ))}
        {visibleLines >= terminalContent.length && (
          <div
            className="flex gap-2"
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}
          >
            <span className="text-[#00ff88]">$</span>
            <span className="cursor-blink text-[#00ff88]">▋</span>
          </div>
        )}
      </div>
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    setTime(new Date());
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-[2.5rem] mb-1" />;

  const timeString = time.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.02em', lineHeight: 1 }} className="text-[#f5f5f5] mb-2">
      {timeString}
    </div>
  );
}

export default function About() {
  return (
    <section id="about" className="py-32 px-4 sm:px-8 relative z-10">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: '-100px' }}
           transition={{ duration: 0.6 }}
           className="mb-12"
        >
          <span
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem' }}
            className="text-[#00ff88] tracking-widest uppercase"
          >
            // 001 — ABOUT
          </span>
        </motion.div>

        {/* BENTO BOX GRID */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 auto-rows-auto">
          
          {/* Tile 1: Main Introduction (Spans 8 cols) */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: '-50px' }}
             transition={{ duration: 0.5, delay: 0.05 }}
             className="md:col-span-8 p-8 md:p-10 rounded-[32px] border border-white/5 bg-[#0a0a0a]/90 backdrop-blur-xl relative overflow-hidden group hover:border-white/10 transition-colors duration-500"
          >
             <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00ff88]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
             <h2
               style={{
                 fontFamily: "'Space Grotesk', sans-serif",
                 fontWeight: 700,
                 fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
                 lineHeight: 1.3,
                 letterSpacing: '-0.02em',
               }}
               className="text-[#f5f5f5]"
             >
               I architect high-performance{' '}
               <span className="text-[#00ff88]">AI systems</span>,
               uncover vulnerabilities through{' '}
               <span className="text-[#c084fc]">security research</span>,
               and engineer scalable{' '}
               <span className="text-[#38bdf8]">infrastructure</span>.
             </h2>
             <p
               style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '1.05rem', lineHeight: 1.8 }}
               className="text-[#888] mt-6 max-w-2xl"
             >
               As a Master&apos;s candidate at Rutgers University and CS336 Lecturer, I operate at the intersection of applied AI and distributed systems. From architecting LLM-powered autonomous agents to designing real-time database telemetry pipelines, my focus is always on performance and scale. My technical domain spans the entire stack: fine-tuning transformer models, reverse-engineering binaries for CTF competitions, and deploying resilient cloud architecture.
             </p>
          </motion.div>

          {/* Tile 2: Location / Map Point (Spans 4 cols) */}
          <motion.div
             initial={{ opacity: 0, scale: 0.95 }}
             whileInView={{ opacity: 1, scale: 1 }}
             viewport={{ once: true, margin: '-50px' }}
             transition={{ duration: 0.5, delay: 0.15 }}
             className="md:col-span-4 p-8 rounded-[32px] border border-white/5 bg-[#0a0a0a] relative overflow-hidden flex flex-col justify-between group hover:border-[#00ff88]/30 transition-colors duration-500 min-h-[300px]"
          >
             {/* Grid & Glow Backdrop */}
             <div className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(circle at 100% 0%, rgba(0, 255, 136, 0.15) 0%, transparent 60%), radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)',
                    backgroundSize: '100% 100%, 16px 16px'
                  }}
             />

             {/* Radar Rings (Top Right) */}
             <div className="absolute -top-16 -right-16 w-64 h-64 border border-[#00ff88]/10 rounded-full flex items-center justify-center pointer-events-none group-hover:border-[#00ff88]/20 transition-colors duration-500">
                 <div className="w-48 h-48 border border-[#00ff88]/15 rounded-full flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full animate-spin" style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(0,255,136,0.15) 100%)', animationDuration: '4s' }} />
                    <div className="w-32 h-32 border border-[#00ff88]/15 rounded-full flex items-center justify-center relative">
                       {/* Center Dot */}
                       <div className="w-1.5 h-1.5 bg-[#00ff88] rounded-full shadow-[0_0_15px_#00ff88]" />
                    </div>
                 </div>
             </div>

             <div className="relative z-10 flex justify-end items-start w-full">
               {/* Coordinates */}
               <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }} className="text-[#00ff88]/60 mt-1 tracking-widest uppercase text-right leading-relaxed">
                 40.4862° N<br/>74.4518° W
               </div>
             </div>

             {/* Bottom Info */}
             <div className="relative z-10 mt-auto pt-10">
               <LiveClock />
               <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600 }} className="text-[1.1rem] tracking-tight text-[#888] mb-4">
                 New Brunswick, NJ
               </div>
               
               {/* Status Pills */}
               <div className="flex flex-wrap items-center gap-2">
                 <div className="flex items-center gap-1.5 px-3 py-1 bg-[rgba(0,255,136,0.05)] border border-[rgba(0,255,136,0.15)] rounded-full text-[#00ff88]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}>Open to Relocation</span>
                 </div>
               </div>
             </div>
          </motion.div>

          {/* Tile 3: Stats Grid (Spans 5 cols) */}
          <div className="md:col-span-5 grid grid-cols-2 gap-4">
             {stats.map((stat, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.25 + i * 0.05 }}
                  className="p-6 min-h-[140px] rounded-[32px] border border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm flex flex-col justify-center items-center text-center hover:bg-[#111] hover:border-white/10 transition-colors group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00ff88]/0 to-[#00ff88]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Subtle Giant Background Number */}
                  <div 
                    className="absolute -right-2 -top-4 text-[5rem] font-bold text-white/[0.02] pointer-events-none select-none transition-transform duration-500 group-hover:scale-110 group-hover:text-white/[0.04]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 800,
                      fontSize: '2.5rem',
                      letterSpacing: '-0.04em',
                    }}
                    className="text-[#00ff88] leading-none mb-3 relative z-10 drop-shadow-[0_0_10px_rgba(0,255,136,0.3)]"
                  >
                    <CountUp value={stat.value} suffix={stat.suffix} isFloat={stat.isFloat} />
                  </div>
                  <div
                    style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem' }}
                    className="text-[#777] uppercase tracking-wider font-semibold relative z-10"
                  >
                    {stat.label}
                  </div>
                </motion.div>
             ))}
          </div>

          {/* Tile 4: Terminal (Spans 7 cols) */}
          <motion.div
             initial={{ opacity: 0, y: 20 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true, margin: '-50px' }}
             transition={{ duration: 0.5, delay: 0.35 }}
             className="md:col-span-7 h-full"
          >
             <TerminalBlock />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
