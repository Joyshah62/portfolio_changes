'use client';

// Color map — each technology gets its category accent color
const COLORS: Record<string, string> = {
  // AI / ML  →  green
  LLaMA: '#00ff88', RAG: '#00ff88', Whisper: '#00ff88',
  PyTorch: '#00ff88', BERT: '#00ff88', 'Fine-tuning': '#00ff88',
  HuggingFace: '#00ff88',

  // Security  →  red
  CTF: '#ff6b6b', Ghidra: '#ff6b6b', Cryptography: '#ff6b6b',
  'Reverse Engineering': '#ff6b6b', Wireshark: '#ff6b6b',
  'Burp Suite': '#ff6b6b', pwntools: '#ff6b6b',

  // Frameworks / Web  →  sky blue
  React: '#38bdf8', FastAPI: '#38bdf8', Flask: '#38bdf8',
  'Next.js': '#38bdf8', WebSockets: '#38bdf8',
  'Node.js': '#38bdf8', Express: '#38bdf8',

  // Languages  →  purple
  Python: '#c084fc', TypeScript: '#c084fc', JavaScript: '#c084fc',
  Java: '#c084fc', SQL: '#c084fc', Go: '#c084fc',

  // Cloud / DB  →  amber
  AWS: '#fbbf24', Docker: '#fbbf24', PostgreSQL: '#fbbf24',
  'Distributed Systems': '#fbbf24', Kubernetes: '#fbbf24',
  MongoDB: '#fbbf24',
};

const DEFAULT_COLOR = '#2a2a2a';

const row1: string[] = [
  'Python', 'LLaMA', 'RAG', 'Whisper', 'FastAPI', 'React',
  'AWS', 'Docker', 'PyTorch', 'BERT', 'CTF', 'Ghidra',
  // duplicated for seamless loop
  'Python', 'LLaMA', 'RAG', 'Whisper', 'FastAPI', 'React',
  'AWS', 'Docker', 'PyTorch', 'BERT', 'CTF', 'Ghidra',
];

const row2: string[] = [
  'Next.js', 'TypeScript', 'PostgreSQL', 'Distributed Systems',
  'Cryptography', 'Reverse Engineering', 'Flask', 'Wireshark',
  'WebSockets', 'Burp Suite',
  // duplicated
  'Next.js', 'TypeScript', 'PostgreSQL', 'Distributed Systems',
  'Cryptography', 'Reverse Engineering', 'Flask', 'Wireshark',
  'WebSockets', 'Burp Suite',
];

const ICONS: Record<string, string> = {
  Python: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
  FastAPI: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg',
  React: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
  AWS: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/amazonwebservices/amazonwebservices-original-wordmark.svg',
  Docker: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
  PyTorch: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/pytorch/pytorch-original.svg',
  'Next.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg',
  TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg',
  PostgreSQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg',
  Flask: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/flask/flask-original.svg',
};

function Item({ label }: { label: string }) {
  const color = COLORS[label] ?? '#888';
  const iconUrl = ICONS[label];
  const needsInvert = label === 'Next.js' || label === 'Flask' || label === 'AWS';

  return (
    <div className="flex items-center gap-4 mx-2">
        <div className="px-5 py-2.5 rounded-full border border-white/[0.04] bg-white/[0.015] backdrop-blur-md transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 flex items-center justify-center gap-3 cursor-default hover:scale-105">
          {iconUrl ? (
            <img 
               src={iconUrl} 
               alt={`${label} logo`} 
               className="w-4 h-4 object-contain" 
               style={{ filter: needsInvert ? 'invert(1) brightness(2)' : 'none' }}
            />
          ) : (
            <span 
              className="w-2 h-2 rounded-full" 
              style={{ 
                backgroundColor: color, 
                boxShadow: `0 0 12px ${color}` 
              }} 
            />
          )}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: '#d1d5db',
              whiteSpace: 'nowrap',
              letterSpacing: '0.04em',
              fontWeight: 500
            }}
            className="transition-colors hover:text-white"
          >
            {label}
          </span>
        </div>
        <span className="text-white/[0.05] text-xs">✦</span>
    </div>
  );
}

export default function MarqueeBanner() {
  return (
    <div
      className="w-full py-10 overflow-hidden relative group"
      style={{
        background: '#0a0a0a',
        borderTop: '1px solid rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.03)',
      }}
    >
      {/* Edge gradient masks for smooth entering/exiting */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none" 
        style={{ 
          background: 'linear-gradient(to right, #0a0a0a 0%, transparent 15%, transparent 85%, #0a0a0a 100%)' 
        }} 
      />

      {/* Row 1 — scrolls left */}
      <div className="overflow-hidden mb-5">
        <div className="marquee-left flex w-max group-hover:[animation-play-state:paused] transition-all duration-300">
          {row1.map((item, i) => <Item key={i} label={item} />)}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="overflow-hidden">
        <div className="marquee-right flex w-max group-hover:[animation-play-state:paused] transition-all duration-300">
          {row2.map((item, i) => <Item key={i} label={item} />)}
        </div>
      </div>
    </div>
  );
}
