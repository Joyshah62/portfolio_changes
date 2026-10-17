import { marqueeTech, marqueeWords } from '@/data/site';

function Star() {
  return (
    <svg viewBox="0 0 24 24" className="mx-[0.35em] inline-block h-[0.55em] w-[0.55em] shrink-0 text-signal" aria-hidden>
      <path
        fill="currentColor"
        d="M12 0c.6 5.6 1.9 8.6 3.6 9.9C17.3 11.1 20 11.6 24 12c-4 .4-6.7.9-8.4 2.1-1.7 1.3-3 4.3-3.6 9.9-.6-5.6-1.9-8.6-3.6-9.9C6.7 12.9 4 12.4 0 12c4-.4 6.7-.9 8.4-2.1C10.1 8.6 11.4 5.6 12 0Z"
      />
    </svg>
  );
}

export default function MarqueeBanner() {
  const words = [...marqueeWords, ...marqueeWords];
  const tech = [...marqueeTech, ...marqueeTech];

  return (
    <div data-surface="fixed" className="relative overflow-hidden border-y border-ink bg-ink py-6 text-paper" aria-hidden>
      <div className="marquee-left flex w-max items-center whitespace-nowrap">
        {words.map((w, i) => (
          <span key={i} className="flex items-center font-serif text-[clamp(2.4rem,6vw,5rem)] leading-none tracking-tight">
            <span className={i % 2 ? 'italic text-paper/55' : ''}>{w}</span>
            <Star />
          </span>
        ))}
      </div>
      <div className="marquee-right mt-4 flex w-max items-center whitespace-nowrap">
        {tech.map((t, i) => (
          <span key={i} className="eyebrow mx-4 text-paper/50">
            {t}
            <span className="ml-8 text-signal">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}
