'use client';

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  Globe,
  Play,
  Pause,
  type LucideIcon,
} from 'lucide-react';
import { skillCategories } from '@/data/site';
import { logoSvg } from '@/lib/skillLogos';
import { useTheme } from '@/hooks/useTheme';
import { textOn } from './SkillsWheel';
import SectionHeader from './SectionHeader';
import SkillWorkflow from './SkillWorkflow';
import styles from './Skills.module.css';

const COUNT = skillCategories.length;
const TOTAL_TOOLS = skillCategories.reduce((sum, category) => sum + category.skills.length, 0);

// Ring geometry (SVG coordinate space 520 × 520)
const C = 260;
const R_INNER = 192;
const R_OUTER = 236;
const R_MID = (R_INNER + R_OUTER) / 2;
const SEG = 360 / COUNT;
const GAP = 1.6;

const rad = (deg: number) => (deg * Math.PI) / 180;
// Rounded to 2 decimals so server and client produce byte-identical SVG attributes (avoids hydration drift).
const fx = (n: number) => Math.round(n * 100) / 100;
const polar = (r: number, deg: number) =>
  [fx(C + r * Math.sin(rad(deg))), fx(C - r * Math.cos(rad(deg)))] as const;

function sectorPath(r0: number, r1: number, a0: number, a1: number) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(r1, a0);
  const [x1, y1] = polar(r1, a1);
  const [x2, y2] = polar(r0, a1);
  const [x3, y3] = polar(r0, a0);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r1} ${r1} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}L${x2.toFixed(2)} ${y2.toFixed(2)}A${r0} ${r0} 0 ${large} 0 ${x3.toFixed(2)} ${y3.toFixed(2)}Z`;
}

// Left tile grid: EVERY tool gets a cell (37 tools in a 5 × 8 = 40-cell grid), laid out
// category by category so each discipline reads as a contiguous block.
const GRID_COLS = 5;
const GRID_ROWS = 8;
const GRID_W = 360; // SVG wire-space width
const GRID_H = 512;
const CELL_W = (GRID_W * 0.7778) / GRID_COLS; // grid occupies the left 77.78%; the rest is the wire bus
const CELL_H = GRID_H / GRID_ROWS;
const BUS_X = 326;

interface GridTile {
  row: number;
  col: number;
  skill: string;
  catIndex: number;
  /** Short caption shown under the icon */
  caption: string;
}

const CAPTIONS: Record<string, string> = {
  'LLM Agents': 'Agents',
  'Tool Calling': 'Tools',
  'Hybrid Search': 'Hybrid',
  'Prompt Engineering': 'Prompts',
  'Scikit Learn': 'Sklearn',
  'REST APIs': 'REST',
  'JupyterLab Extensions': 'Jupyter',
  'AWS (S3)': 'AWS',
  PostgreSQL: 'Postgres',
  TypeScript: 'TS',
  JavaScript: 'JS',
};

const GRID_TILES: GridTile[] = (() => {
  const tiles: GridTile[] = [];
  let cell = 0;
  skillCategories.forEach((cat, catIndex) => {
    cat.skills.forEach(skill => {
      const row = Math.floor(cell / GRID_COLS) + 1;
      const col = (cell % GRID_COLS) + 1;
      tiles.push({ row, col, skill, catIndex, caption: CAPTIONS[skill] ?? skill });
      cell += 1;
    });
  });
  return tiles;
})();

interface DisciplineBlueprint {
  icon: LucideIcon;
  headline: string;
  highlightedPills: string[];
  project: string;
  projectUrl: string;
  previewTitle: string;
  previewBadge: string;
  previewMetrics: Array<{ label: string; value: string }>;
  command: string;
  statusLine: string;
  json: Record<string, string | number | boolean | string[]>;
  footerCheck: string;
  footerSub: string;
}

const BLUEPRINTS: Record<string, DisciplineBlueprint> = {
  ai: {
    icon: Bot,
    headline: 'AI agents, retrieval & voice',
    highlightedPills: ['LLM Agents', 'Tool Calling', 'RAG', 'Gemini'],
    project: 'Composur · CodeBench · PlaNYt',
    projectUrl: '#projects',
    previewTitle: 'Composur · Interview workflow',
    previewBadge: 'VOICE + RETRIEVAL',
    previewMetrics: [
      { label: 'Retriever', value: 'Hybrid + Rerank' },
      { label: 'Speech', value: 'ElevenLabs' },
    ],
    command: 'agent.run({ model: "gemini-2.5", tools: [rag, sandbox] })',
    statusLine: 'Example: retrieve résumé context and call a tool.',
    json: {
      session: 'composur_voice_04',
      intent: 'follow_up_probe',
      retrieved_chunks: 6,
      rerank_score: 0.94,
      voice_stream: 'elevenlabs_turbo_v2',
      rubric_pass: true,
    },
    footerCheck: 'Used in Composur, CodeBench & PlaNYt',
    footerSub: 'Example interview session',
  },
  ml: {
    icon: BrainCircuit,
    headline: 'Machine learning for security',
    highlightedPills: ['PyTorch', 'BERT', 'YOLO', 'OpenCV'],
    project: 'Forenzy WAF · IEEE CICT Liveness',
    projectUrl: '#projects',
    previewTitle: 'Forenzy · Threat detection',
    previewBadge: '97.2% F1 SCORE',
    previewMetrics: [
      { label: 'False positives', value: '23% → 4%' },
      { label: 'Daily volume', value: '2+ GB/day' },
    ],
    command: 'ensemble.predict({ models: 5, stream: "nginx_modsec" })',
    statusLine: 'Example: classify an HTTP request with a BERT ensemble.',
    json: {
      Models: '5x_BERT_Ensemble',
      threat_class: 'SQLi_union_bypass',
      confidence: 0.984,
      false_positive_rate: '4.0%',
      liveness_accuracy: '98.5%',
      triage_reduction: '-65%',
    },
    footerCheck: 'BERT threat detection · 97.2% F1',
    footerSub: 'Example classification result',
  },
  web: {
    icon: Globe,
    headline: 'Web interfaces & backend APIs',
    highlightedPills: ['FastAPI', 'React', 'SQLAlchemy', 'JupyterLab Extensions'],
    project: 'CodeBench @ Rutgers · Composur',
    projectUrl: '#projects',
    previewTitle: 'CodeBench · Coding tutor',
    previewBadge: 'JUPYTERLAB',
    previewMetrics: [
      { label: 'Notebook RPC', value: 'FastAPI + JWT' },
      { label: 'Migrations', value: 'Alembic SQL' },
    ],
    command: 'fastapi.post("/v1/notebook/cell-assist", { cell_id: 14 })',
    statusLine: 'Example: read notebook context and check student code.',
    json: {
      service: 'codebench_api_v2',
      extension: '@codebench/jupyter-tutor',
      auth_guard: 'jwt_rs256_verified',
      orm_session: 'sqlalchemy_async',
      guided_hint: 'Check base case on line 12',
      status: '200_OK',
    },
    footerCheck: 'React interfaces and FastAPI services',
    footerSub: 'Example notebook response',
  },
  databases: {
    icon: Database,
    headline: 'Search & application data',
    highlightedPills: ['PostgreSQL', 'pgvector', 'MongoDB'],
    project: 'Composur Hybrid Search · CodeBench',
    projectUrl: '#projects',
    previewTitle: 'Composur · Hybrid search',
    previewBadge: 'HNSW + BM25',
    previewMetrics: [
      { label: 'Index type', value: 'HNSW Cosine' },
      { label: 'Search', value: 'Vector + lexical' },
    ],
    command: 'db.query("SELECT * FROM chunks ORDER BY emb <=> $1 LIMIT 6")',
    statusLine: 'Example: combine vector and keyword search results.',
    json: {
      engine: 'postgresql_16_pgvector',
      dimensions: 1536,
      distance_metric: 'cosine_hnsw',
      hybrid_fusion: 'reciprocal_rank',
      replayed_turns: 1420,
      acid_compliant: true,
    },
    footerCheck: 'Vector search with PostgreSQL & pgvector',
    footerSub: 'Example retrieval result',
  },
  cloud: {
    icon: Cloud,
    headline: 'Containers & deployment',
    highlightedPills: ['Docker', 'AWS (S3)', 'Nginx', 'Linux'],
    project: 'Composur Sandboxes · Forenzy Pipeline',
    projectUrl: '#projects',
    previewTitle: 'Composur · Code execution',
    previewBadge: 'ISOLATED EXEC',
    previewMetrics: [
      { label: 'Gateway', value: 'Nginx + ModSec' },
      { label: 'Storage', value: 'AWS S3 Buckets' },
    ],
    command: 'docker.run({ image: "sandbox:py312", net: "none", cpu: 0.5 })',
    statusLine: 'Example: run code in an isolated container.',
    json: {
      runtime: 'docker_isolated_sandbox',
      reverse_proxy: 'nginx_modsecurity',
      artifact_store: 's3://composur-runs/',
      memory_limit: '256MB',
      network_policy: 'airgapped',
      exit_code: 0,
    },
    footerCheck: 'Isolated Docker environments for code execution',
    footerSub: 'Example execution result',
  },
  languages: {
    icon: Code2,
    headline: 'Python, TypeScript & SQL',
    highlightedPills: ['Python', 'TypeScript', 'SQL'],
    project: 'Composur · CodeBench',
    projectUrl: '#projects',
    previewTitle: 'Python & TypeScript · Data contracts',
    previewBadge: 'STRICT MODE',
    previewMetrics: [
      { label: 'Backend / ML', value: 'Python 3.12' },
      { label: 'Frontend / UI', value: 'TypeScript 5' },
    ],
    command: 'pipeline.compile({ py: "3.12", ts: "strict", sql: "pg16" })',
    statusLine: 'Example: check Python and TypeScript data contracts.',
    json: {
      primary_ml: 'Python (PyTorch, FastAPI)',
      primary_ui: 'TypeScript (React, Next.js)',
      query_layer: 'SQL (PostgreSQL, MySQL)',
      type_coverage: '100%',
      lint_errors: 0,
    },
    footerCheck: 'Python for AI & APIs · TypeScript for web',
    footerSub: 'Example contract check',
  },
};

const AUTOPLAY_MS = 6500;

/** Types `text` out character by character; re-runs whenever the text changes. */
function Typewriter({ text, instant }: { text: string; instant: boolean }) {
  const [shown, setShown] = useState(instant ? text : '');
  useEffect(() => {
    if (instant) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, 14);
    return () => window.clearInterval(id);
  }, [text, instant]);
  return (
    <>
      {instant ? text : shown}
      {!instant && shown.length < text.length && <span className={styles.caret}>▍</span>}
    </>
  );
}

export default function Skills() {
  const [active, setActive] = useState<number>(0);
  const [focusedSkill, setFocusedSkill] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(true);
  const [keyboardEngaged, setKeyboardEngaged] = useState(false);
  const [engaged, setEngaged] = useState(false); // pointer is over the diagram
  const [inView, setInView] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion() ?? false;
  const { theme } = useTheme();

  const category = skillCategories[active];
  const blueprint = BLUEPRINTS[category.id] ?? BLUEPRINTS.ai;
  const CenterIcon = blueprint.icon;

  // Tiles belonging to the currently selected category
  const activeTiles = GRID_TILES.filter(t => t.catIndex === active);
  // One shared trace per row, routed along cell boundaries clear of the logos.
  const activeRows = Array.from(new Set(activeTiles.map(tile => tile.row))).map(row => ({
    row,
    tiles: activeTiles.filter(tile => tile.row === row),
  }));

  const stepCategory = (dir: -1 | 1) => {
    setFocusedSkill(null);
    setActive(prev => (prev + dir + COUNT) % COUNT);
  };

  const selectCategory = (index: number, skill: string | null = null) => {
    setActive(index);
    setFocusedSkill(skill);
  };

  // Only auto-advance while the diagram is on screen
  useEffect(() => {
    const node = frameRef.current;
    if (!node) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 });
    io.observe(node);
    return () => io.disconnect();
  }, []);

  // Auto-cycle through disciplines; pauses while hovered, when reduced motion is on, or when toggled off
  useEffect(() => {
    if (!autoplay || engaged || keyboardEngaged || !inView || reducedMotion) return;
    const id = window.setInterval(() => {
      setFocusedSkill(null);
      setActive(prev => (prev + 1) % COUNT);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [autoplay, engaged, keyboardEngaged, inView, reducedMotion]);

  const onRingKeyDown = (event: KeyboardEvent, index: number) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step) {
      event.preventDefault();
      const next = (index + step + COUNT) % COUNT;
      selectCategory(next);
      const selector = event.currentTarget.getAttribute('role') === 'tab' ? '[role="tab"]' : '[role="radio"]';
      const siblings = event.currentTarget.parentElement?.querySelectorAll<HTMLElement | SVGElement>(selector);
      siblings?.[next]?.focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectCategory(index);
    }
  };

  return (
    <section
      id="skills"
      className={`${styles.skillsSection} relative px-4 py-16 sm:px-8 md:py-20`}
      onFocusCapture={() => setKeyboardEngaged(true)}
      onBlurCapture={event => {
        if (!event.currentTarget.contains(event.relatedTarget)) setKeyboardEngaged(false);
      }}
      aria-label="Skills and technologies"
    >
      <div className="mx-auto max-w-[1240px]">
        <SectionHeader
          index="05"
          label="Skills"
          title={
            <>
              The tools <em>I work with.</em>
            </>
          }
          aside={`${COUNT} disciplines · ${TOTAL_TOOLS} tools`}
        />

        {/* Top Discipline Selector Bar */}
        <div className={styles.navBar}>
          <div className={styles.pills} role="tablist" aria-label="Choose a skill discipline">
            {skillCategories.map((cat, i) => {
              const isSelected = active === i;
              return (
                <button
                  type="button"
                  role="tab"
                  key={cat.id}
                  aria-selected={isSelected}
                  tabIndex={isSelected ? 0 : -1}
                  onKeyDown={event => onRingKeyDown(event, i)}
                  onClick={() => selectCategory(i)}
                  style={
                    isSelected
                      ? {
                          background: cat.color,
                          borderColor: cat.color,
                          color: textOn(cat.color),
                        }
                      : undefined
                  }
                >
                  <span className={styles.pillIndex}>0{i + 1}</span>
                  <i style={{ background: isSelected ? 'currentColor' : cat.color }} />
                  <span>{cat.label}</span>
                  <span className={styles.pillCount}>{cat.skills.length}</span>
                </button>
              );
            })}
          </div>

          <div className={styles.stepControls} aria-label="Cycle disciplines">
            <button
              type="button"
              className={`${styles.autoBtn} ${autoplay && !reducedMotion ? styles.autoBtnOn : ''}`}
              onClick={() => setAutoplay(v => !v)}
              aria-pressed={autoplay}
              aria-label={autoplay ? 'Pause auto-cycle' : 'Resume auto-cycle'}
              title={autoplay ? 'Pause auto-cycle' : 'Resume auto-cycle'}
              style={{ '--accent': category.color, '--accent-on': textOn(category.color) } as React.CSSProperties}
            >
              {autoplay ? <Pause size={13} /> : <Play size={13} />}
              {autoplay && !reducedMotion && (
                <span key={active} className={styles.autoRing} style={{ animationDuration: `${AUTOPLAY_MS}ms` }} />
              )}
            </button>
            <button
              type="button"
              onClick={() => stepCategory(-1)}
              aria-label="Previous discipline"
              title="Previous discipline"
            >
              <ArrowLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => stepCategory(1)}
              aria-label="Next discipline"
              title="Next discipline"
            >
              <ArrowRight size={15} />
            </button>
          </div>
        </div>

        {/* ============================================================
            THREE-STAGE ARCHITECTURAL PIPELINE DIAGRAM
            [Left: Logo Tile Grid] ---> [Center: Segmented Hub] ---> [Right: Live Output]
        ============================================================ */}
        <div
          ref={frameRef}
          className={styles.diagramFrame}
          style={{ '--accent': category.color, '--accent-on': textOn(category.color) } as React.CSSProperties}
          onPointerEnter={() => setEngaged(true)}
          onPointerLeave={() => setEngaged(false)}
        >
          {/* ---------------- LEFT STAGE: ECOSYSTEM LOGO GRID + ORTHOGONAL WIRES ---------------- */}
          <div className={styles.leftStage}>
            <div className={styles.stageLabel}>
              <span>MY TOOLKIT // {TOTAL_TOOLS} TOOLS</span>
              <span>{activeTiles.length} SELECTED</span>
            </div>

            <div className={styles.gridCanvas}>
              {/* 5 × 8 Background Architectural Cells */}
              <div className={styles.cellMatrix} aria-hidden="true">
                {Array.from({ length: 40 }, (_, idx) => (
                  <div key={idx} className={styles.emptyCell} />
                ))}
              </div>

              {/* Placed Interactive Logo Tiles */}
              {GRID_TILES.map(tile => {
                const tileCat = skillCategories[tile.catIndex];
                const isCatActive = tile.catIndex === active;
                const isSkillFocused = focusedSkill === tile.skill;
                const leftPct = ((tile.col - 1) / GRID_COLS) * 77.78;
                const topPct = ((tile.row - 1) / GRID_ROWS) * 100;

                return (
                  <button
                    type="button"
                    key={tile.skill}
                    className={`${styles.logoTile} ${isCatActive ? styles.logoTileActive : ''} ${
                      isSkillFocused ? styles.logoTileFocused : ''
                    }`}
                    style={{
                      left: `${leftPct}%`,
                      top: `${topPct}%`,
                      '--tile-color': tileCat.color,
                    } as React.CSSProperties}
                    onClick={() => selectCategory(tile.catIndex, tile.skill)}
                    onPointerEnter={() => {
                      if (isCatActive) setFocusedSkill(tile.skill);
                    }}
                    onPointerLeave={() => setFocusedSkill(null)}
                    title={`${tile.skill} (${tileCat.label})`}
                    aria-label={`Select ${tile.skill} in ${tileCat.label}`}
                  >
                    <span
                      className={styles.tileIcon}
                      dangerouslySetInnerHTML={{
                        __html: logoSvg(
                          tile.skill,
                          'currentColor',
                          theme,
                        ),
                      }}
                    />
                    <span className={styles.tileCaption}>{tile.caption}</span>
                    {/* Bottom-edge ports connect to the shared row trace. */}
                    {isCatActive && (
                      <span
                        className={styles.diamondPort}
                        style={{ background: category.color }}
                      />
                    )}
                  </button>
                );
              })}

              {/* Orthogonal Circuit Wires Routing from Active Tiles into the Center Wheel */}
              <svg
                className={styles.leftWires}
                viewBox="0 0 360 512"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Vertical collector bus & main horizontal feed into the wheel */}
                <path
                  d={`M ${BUS_X} ${Math.min(activeRows[0].row * CELL_H, GRID_H / 2)} V ${Math.max(activeRows[activeRows.length - 1].row * CELL_H, GRID_H / 2)} M ${BUS_X} 256 H 358`}
                  className={styles.wireBus}
                />
                {/* Signal flowing along the feed into the wheel */}
                <path
                  d={`M ${BUS_X} 256 L 358 256`}
                  className={styles.wireFlow}
                  style={{ stroke: category.color }}
                />
                {/* Arrowhead entering the wheel */}
                <path
                  d="M 347 250 L 355 256 L 347 262"
                  className={styles.wireArrow}
                />

                {activeRows.map(({ row, tiles }, k) => {
                  const startX = fx((Math.min(...tiles.map(tile => tile.col)) - 0.5) * CELL_W);
                  const junctionY = fx(row * CELL_H);
                  const d = `M ${startX} ${junctionY} H ${BUS_X}`;
                  const isFocused = tiles.some(tile => focusedSkill === tile.skill);

                  return (
                    <g key={`${category.id}-${row}`}>
                      <path
                        d={d}
                        pathLength={1}
                        className={`${styles.wireLine} ${isFocused ? styles.wireLineFocused : ''}`}
                        style={{ stroke: category.color, animationDelay: `${k * 55}ms` }}
                      />
                      <circle
                        cx={BUS_X}
                        cy={junctionY}
                        r={isFocused ? 4 : 2.6}
                        fill={category.color}
                        className={styles.wireNode}
                        style={{ animationDelay: `${k * 55 + 260}ms` }}
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* ---------------- CENTER STAGE: SEGMENTED RING DIAL + INNER HUB ---------------- */}
          <div className={styles.centerStage}>
            <div className={styles.wheelContainer}>
              <svg
                className={styles.ringSvg}
                viewBox="0 0 520 520"
                role="radiogroup"
                aria-label="Skill discipline ring"
              >
                {/* Subtle outer & inner hairline compass circles (outer one slowly rotates) */}
                <circle
                  cx={C}
                  cy={C}
                  r={R_OUTER + 10}
                  className={`${styles.compassHairline} ${styles.compassSpin}`}
                />
                <circle cx={C} cy={C} r={R_INNER - 8} className={styles.compassHairline} />

                {/* Accent arc that draws itself along the active segment on every switch */}
                <path
                  key={`arc-${category.id}`}
                  d={sectorPath(R_OUTER + 4, R_OUTER + 6, active * SEG + 60 - SEG / 2 + GAP, active * SEG + 60 + SEG / 2 - GAP)}
                  pathLength={1}
                  className={styles.activeArc}
                  style={{ fill: category.color }}
                />

                {/* 6 Segmented Ring Arcs with Icons */}
                {skillCategories.map((cat, i) => {
                  // Offset so segment 0 sits prominently on the right-upper arc (like the reference image)
                  const centerDeg = i * SEG + 60;
                  const a0 = centerDeg - SEG / 2 + GAP;
                  const a1 = centerDeg + SEG / 2 - GAP;
                  const isSelected = i === active;
                  const [ix, iy] = polar(R_MID, centerDeg);
                  const SegIcon = (BLUEPRINTS[cat.id] ?? BLUEPRINTS.ai).icon;

                  return (
                    <g
                      key={cat.id}
                      role="radio"
                      aria-checked={isSelected}
                      aria-label={cat.label}
                      tabIndex={isSelected ? 0 : -1}
                      className={`${styles.ringSegment} ${
                        isSelected ? styles.ringSegmentActive : ''
                      }`}
                      onClick={() => selectCategory(i)}
                      onKeyDown={e => onRingKeyDown(e, i)}
                    >
                      <path
                        d={sectorPath(R_INNER, R_OUTER, a0, a1)}
                        style={
                          isSelected
                            ? { fill: cat.color, stroke: cat.color }
                            : undefined
                        }
                      />
                      <foreignObject
                        x={ix - 14}
                        y={iy - 14}
                        width={28}
                        height={28}
                        className={styles.segmentIconWrap}
                      >
                        <div
                          className={styles.segmentIcon}
                          style={{
                            color: isSelected ? textOn(cat.color) : undefined,
                          }}
                        >
                          <SegIcon size={16} strokeWidth={1.9} />
                        </div>
                      </foreignObject>
                    </g>
                  );
                })}
              </svg>

              {/* Inner Hub Content (Centered inside the Ring) */}
              <div className={styles.wheelHub} aria-live="polite">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={category.id}
                    className={styles.wheelHubInner}
                    initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Prominent Square Accent Badge at Top of Hub */}
                    <div
                      className={styles.hubBadge}
                      style={{
                        background: category.color,
                        color: textOn(category.color),
                      }}
                    >
                      <CenterIcon size={20} strokeWidth={2.1} />
                    </div>

                    <span className={styles.hubKicker}>
                      0{active + 1} {'//'} {category.label}
                    </span>

                    <h3 className={styles.hubTitle}>{blueprint.headline}</h3>

                    <span className={styles.hubToolCount}>{category.skills.length} tools in this area</span>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
            <div className={styles.toolShelf}>
              <span className={styles.toolShelfLabel}>{category.label} tools</span>
                    {/* Tools stay outside the circular hub so every label has room. */}
                    <motion.div
                      key={category.id}
                      className={styles.hubPillGrid}
                      initial="hidden"
                      animate="show"
                      variants={{
                        hidden: {},
                        show: { transition: { staggerChildren: reducedMotion ? 0 : 0.04, delayChildren: 0.08 } },
                      }}
                    >
                      {category.skills.map(skill => {
                        const isHighlighted =
                          focusedSkill === skill ||
                          (focusedSkill === null &&
                            blueprint.highlightedPills.includes(skill));

                        return (
                          <motion.button
                            type="button"
                            key={skill}
                            title={skill}
                            aria-pressed={focusedSkill === skill}
                            variants={{
                              hidden: reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.96 },
                              show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
                            }}
                            className={`${styles.hubPill} ${
                              isHighlighted ? styles.hubPillHighlighted : ''
                            }`}
                            style={
                              isHighlighted
                                ? {
                                    background: category.color,
                                    borderColor: category.color,
                                    color: textOn(category.color),
                                  }
                                : undefined
                            }
                            onPointerEnter={() => setFocusedSkill(skill)}
                            onPointerLeave={() => setFocusedSkill(null)}
                            onClick={() =>
                              setFocusedSkill(prev => (prev === skill ? null : skill))
                            }
                          >
                            {skill}
                          </motion.button>
                        );
                      })}
                    </motion.div>
            </div>
          </div>

          {/* ---------------- RIGHT STAGE: ARCHITECTURAL PREVIEW + LIVE CODE/JSON WINDOW ---------------- */}
          <div className={styles.rightStage}>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={category.id}
                className={styles.rightStack}
                initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -6 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.previewShell}>
            {/* Orthogonal Connector Wire from Wheel Rim to Right Windows */}
            <svg
              className={styles.rightWires}
              viewBox="0 0 56 32"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              <path
                d="M2 16 H48"
                className={styles.wireBus}
                style={{ stroke: category.color }}
              />
              <path
                d="M2 16 H48"
                className={styles.wireFlow}
                style={{ stroke: category.color }}
              />
              <path
                d="M41 9 L48 16 L41 23"
                className={styles.wireArrow}
                style={{ stroke: category.color }}
              />
            </svg>

                {/* Top Window: System / Architecture Wireframe Card */}
                <div className={styles.previewWindow}>
                  <div className={styles.windowChrome}>
                    <div className={styles.windowDots}>
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className={styles.windowTitle}>{blueprint.previewTitle}</span>
                    <span
                      className={styles.windowBadge}
                      style={{
                        color: 'var(--accent-ink)',
                        borderColor: category.color,
                      }}
                    >
                      {blueprint.previewBadge}
                    </span>
                  </div>

                  <SkillWorkflow key={category.id} domain={category.id} reducedMotion={reducedMotion} />
                  <div className={styles.previewMetrics}>
                    {blueprint.previewMetrics.map(metric => (
                      <div key={metric.label} className={styles.metricCell}>
                        <small>{metric.label}</small>
                        <strong>{metric.value}</strong>
                      </div>
                    ))}
                  </div>
                </div>

                </div>

                {/* Vertical Arrow Connector Between Top & Bottom Window */}
                <div className={styles.verticalConnector} aria-hidden="true">
                  <span className={styles.verticalLine} />
                  <span className={styles.verticalChevron} />
                </div>

                {/* Bottom Window: Structured Code & JSON Output Inspector */}
                <div
                  className={styles.codeWindow}
                  style={{ borderColor: category.color }}
                >
                  <div
                    className={styles.windowChrome}
                    style={{
                      borderBottomColor: `color-mix(in srgb, ${category.color} 28%, var(--color-line))`,
                    }}
                  >
                    <div className={styles.windowDotsColored}>
                      <span style={{ background: category.color }} />
                      <span style={{ background: category.color, opacity: 0.55 }} />
                      <span style={{ background: category.color, opacity: 0.28 }} />
                    </div>
                    <span className={styles.windowTitle}>
                      {focusedSkill
                        ? `Example · ${focusedSkill}`
                        : `Example output · ${category.label}`}
                    </span>
                  </div>

                  <div className={styles.codeBody}>
                    <div className={styles.codeCommand}>{blueprint.command}</div>
                    <div
                      className={styles.codeStatus}
                      style={{ color: 'var(--accent-ink)' }}
                    >
                      <span className={styles.statusBlip} style={{ background: category.color }} />
                      <Typewriter
                        key={focusedSkill ?? category.id}
                        text={focusedSkill ? `Example integration: ${focusedSkill}` : blueprint.statusLine}
                        instant={reducedMotion}
                      />
                    </div>

                    <pre className={styles.jsonBlock}>
                      {'{\n'}
                      {Object.entries(blueprint.json).map(([k, v], i) => (
                        <div
                          key={k}
                          className={styles.jsonRow}
                          style={{ animationDelay: `${120 + i * 70}ms` }}
                        >
                          <span className={styles.jsonKey}>&quot;{k}&quot;</span>:{' '}
                          <span className={styles.jsonVal}>
                            {typeof v === 'string' ? `"${v}"` : String(v)}
                          </span>
                          ,
                        </div>
                      ))}
                      {focusedSkill && (
                        <div className={styles.jsonRow}>
                          <span className={styles.jsonKey}>&quot;active_tool&quot;</span>:{' '}
                          <span
                            className={styles.jsonHighlight}
                            style={{ color: 'var(--accent-ink)' }}
                          >
                            &quot;{focusedSkill}&quot;
                          </span>
                          ,
                        </div>
                      )}
                      {'}'}
                    </pre>

                    <div className={styles.codeFooter}>
                      <p
                        className={styles.codeCheck}
                        style={{ color: 'var(--accent-ink)' }}
                      >
                        ✓ {blueprint.footerCheck}
                      </p>
                      <div className={styles.codeSavedRow}>
                        <span>{blueprint.footerSub}</span>
                        <a href={blueprint.projectUrl} className={styles.seeWorkLink}>
                          {blueprint.project.split('·')[0].trim()}{' '}
                          <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Full list for screen readers and search engines */}
        <ul className="sr-only">
          {skillCategories.map(cat => (
            <li key={cat.id}>
              {cat.label}: {cat.skills.join(', ')}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
