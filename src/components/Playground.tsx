'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion, useReducedMotion } from 'framer-motion';
import { Eraser } from 'lucide-react';
import { infer, loadDigitModel, preprocess, type Activations, type DigitModel } from '@/lib/digits';
import { useInViewport } from './three/shared';
import { useTheme } from '@/hooks/useTheme';
import SectionHeader from './SectionHeader';

const NetworkScene = dynamic(() => import('./three/NetworkScene'), { ssr: false });

type Point = [number, number];

/** A "2", in pad-relative coordinates, for the first-visit demo. */
function demoStroke(): Point[] {
  const pts: Point[] = [];
  for (let a = Math.PI * 1.08; a >= -Math.PI * 0.12; a -= 0.08) pts.push([0.5 + Math.cos(a) * 0.19, 0.36 - Math.sin(a) * 0.15]);
  for (let t = 0; t <= 1; t += 0.06) pts.push([0.68 + (0.3 - 0.68) * t, 0.42 + (0.76 - 0.42) * t]);
  for (let t = 0; t <= 1; t += 0.08) pts.push([0.3 + 0.42 * t, 0.76]);
  return pts;
}

export default function Playground() {
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Point[][]>([]);
  const drawing = useRef(false);
  const pending = useRef(0);
  const demoed = useRef(false);
  const demoTimer = useRef(0);

  const near = useInViewport(section, '300px');
  const stageVisible = useInViewport(stage);
  const reduced = useReducedMotion() ?? false;
  const { theme } = useTheme();

  const [model, setModel] = useState<DigitModel | null>(null);
  const [failed, setFailed] = useState(false);
  const [acts, setActs] = useState<Activations | null>(null);
  const [burstAt, setBurstAt] = useState(0);
  const [isDemo, setIsDemo] = useState(false);

  // Fetch the weights only when the section gets close
  useEffect(() => {
    if (!near || model) return;
    loadDigitModel().then(setModel, () => setFailed(true));
  }, [near, model]);

  /* ---------- drawing ---------- */
  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext('2d')!;
    g.clearRect(0, 0, c.width, c.height);
    g.strokeStyle = getComputedStyle(c).color;
    g.lineWidth = c.width * 0.072;
    g.lineCap = 'round';
    g.lineJoin = 'round';
    for (const s of strokes.current) {
      if (!s.length) continue;
      g.beginPath();
      g.moveTo(s[0][0] * c.width, s[0][1] * c.height);
      if (s.length === 1) g.lineTo(s[0][0] * c.width + 0.1, s[0][1] * c.height);
      for (let i = 1; i < s.length - 1; i++) {
        const mx = ((s[i][0] + s[i + 1][0]) / 2) * c.width, my = ((s[i][1] + s[i + 1][1]) / 2) * c.height;
        g.quadraticCurveTo(s[i][0] * c.width, s[i][1] * c.height, mx, my);
      }
      if (s.length > 1) g.lineTo(s[s.length - 1][0] * c.width, s[s.length - 1][1] * c.height);
      g.stroke();
    }
  }, []);

  const run = useCallback(() => {
    if (!model || !canvas.current) return;
    const x = preprocess(canvas.current);
    setActs(x ? infer(model, x) : null);
  }, [model]);

  // Throttle inference to one per frame while a stroke is in progress
  const schedule = useCallback(() => {
    if (pending.current) return;
    pending.current = requestAnimationFrame(() => {
      pending.current = 0;
      run();
    });
  }, [run]);

  // Keep the canvas crisp and in sync with its box (and the theme's ink colour)
  useEffect(() => {
    const c = canvas.current!;
    const fit = () => {
      const r = c.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
      redraw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(c);
    return () => ro.disconnect();
  }, [redraw]);
  useEffect(redraw, [theme, redraw]);

  const clear = useCallback(() => {
    window.clearTimeout(demoTimer.current);
    strokes.current = [];
    setIsDemo(false);
    redraw();
    setActs(null);
  }, [redraw]);

  const at = (e: React.PointerEvent): Point => {
    const r = canvas.current!.getBoundingClientRect();
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height];
  };

  const onDown = (e: React.PointerEvent) => {
    if (isDemo) clear();
    demoed.current = true;
    canvas.current!.setPointerCapture(e.pointerId);
    drawing.current = true;
    strokes.current.push([at(e)]);
    redraw();
    schedule();
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const stroke = strokes.current[strokes.current.length - 1];
    const p = at(e);
    const last = stroke[stroke.length - 1];
    if (Math.hypot(p[0] - last[0], p[1] - last[1]) < 0.006) return;
    stroke.push(p);
    redraw();
    schedule();
  };
  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    run();
    setBurstAt((n) => n + 1); // send a wave through the network
  };

  /* ---------- first-visit demo: the pad draws a "2" by itself ---------- */
  useEffect(() => {
    if (!model || !stageVisible || demoed.current) return;
    demoed.current = true;
    const pts = demoStroke();
    if (reduced) {
      strokes.current = [pts];
      setIsDemo(true);
      redraw();
      run();
      return;
    }
    let i = 0;
    strokes.current = [[]];
    setIsDemo(true);
    const step = () => {
      strokes.current[0].push(pts[i++]);
      redraw();
      run();
      if (i < pts.length) demoTimer.current = window.setTimeout(step, 28);
      else setBurstAt((n) => n + 1);
    };
    demoTimer.current = window.setTimeout(step, 400);
    return () => window.clearTimeout(demoTimer.current);
  }, [model, stageVisible, reduced, redraw, run]);

  /* ---------- readout ---------- */
  const probs = acts?.[3];
  let top = -1;
  if (probs) {
    top = 0;
    for (let i = 1; i < 10; i++) if (probs[i] > probs[top]) top = i;
  }
  const confident = probs && probs[top] >= 0.6;

  return (
    <section id="playground" ref={section} className="relative px-4 py-28 sm:px-8 md:py-40">
      <div className="mx-auto max-w-[1400px]">
        <SectionHeader
          index="04"
          label="Playground"
          title={<>Draw a number. <em>Watch it think.</em></>}
          aside="784 → 64 → 32 → 10"
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Pad + readout */}
          <div className="lg:col-span-4">
            <p className="mb-6 max-w-md text-[1.02rem] leading-relaxed text-ink-soft">
              A small neural network I trained on 60,000 handwritten digits. It runs right here in your browser, so all
              ~53,000 of its weights are multiplied on your device as you draw. Nothing is sent anywhere.
            </p>

            <div className="mx-auto max-w-[340px] lg:mx-0 lg:max-w-none">
              <div className="relative aspect-square overflow-hidden rounded-[28px] border border-line bg-card">
                {/* faint guide grid */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    backgroundImage:
                      'linear-gradient(var(--color-line) 1px, transparent 1px), linear-gradient(90deg, var(--color-line) 1px, transparent 1px)',
                    backgroundSize: '12.5% 12.5%',
                  }}
                />
                <canvas
                  ref={canvas}
                  aria-label="Drawing pad: draw a digit from 0 to 9"
                  role="img"
                  onPointerDown={onDown}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  className="absolute inset-0 h-full w-full cursor-crosshair text-ink"
                  style={{ touchAction: 'none' }}
                />
                {!acts && (
                  <span className="eyebrow pointer-events-none absolute inset-x-0 bottom-5 text-center text-muted">
                    {model ? 'Draw a digit, 0–9' : failed ? 'Model failed to load' : 'Loading the model…'}
                  </span>
                )}
                {isDemo && (
                  <span className="eyebrow pointer-events-none absolute left-4 top-4 rounded-full bg-paper/80 px-2.5 py-1 text-ink-soft backdrop-blur">
                    Demo · draw your own
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-end justify-between gap-4" aria-live="polite">
                <div>
                  <div className="eyebrow mb-1 text-muted">Prediction</div>
                  <div className="flex items-baseline gap-3">
                    <motion.span
                      key={top}
                      initial={{ opacity: 0, y: 10, filter: 'blur(6px)' }}
                      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
                      className={`display text-6xl ${confident ? 'text-signal' : 'text-ink'}`}
                    >
                      {top >= 0 ? top : '–'}
                    </motion.span>
                    <span className="font-mono text-sm text-ink-soft">
                      {probs ? `${Math.round(probs[top] * 100)}% sure${confident ? '' : ' — keep going'}` : ''}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={clear}
                  className="inline-flex items-center gap-2 rounded-full border border-ink px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
                >
                  <Eraser size={15} /> Clear
                </button>
              </div>

              {/* Probability for every digit */}
              <div className="mt-5 grid grid-cols-10 items-end gap-1.5" aria-hidden>
                {Array.from({ length: 10 }, (_, i) => {
                  const p = probs?.[i] ?? 0;
                  return (
                    <div key={i} className="flex flex-col items-center gap-1.5">
                      <div className="relative h-16 w-full overflow-hidden rounded-md bg-paper-2">
                        <div
                          className={`absolute inset-x-0 bottom-0 rounded-md transition-[height] duration-300 ease-out ${i === top ? 'bg-signal' : 'bg-ink/35'}`}
                          style={{ height: `${Math.max(p * 100, 2)}%` }}
                        />
                      </div>
                      <span className={`font-mono text-[0.7rem] ${i === top ? 'text-signal' : 'text-muted'}`}>{i}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* The network, live */}
          <div className="lg:col-span-8">
            <div
              ref={stage}
              className="relative aspect-square w-full overflow-hidden rounded-[32px] border border-line bg-card sm:aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[560px]"
            >
              <div
                className="pointer-events-none absolute inset-0"
                style={{ background: 'radial-gradient(60% 55% at 55% 50%, rgba(255,79,31,0.07), transparent 70%)' }}
              />
              {model && <NetworkScene model={model} acts={acts} burstAt={burstAt} visible={stageVisible} />}
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between p-5">
                <span className="eyebrow text-muted">Input · 28×28</span>
                <span className="eyebrow text-muted">Output · 0–9</span>
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="eyebrow text-muted">Hidden layers · 64 + 32 neurons</span>
                <span className="eyebrow text-muted">
                  {model ? `${(model.testAccuracy * 100).toFixed(1)}% on MNIST test set` : ''}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
