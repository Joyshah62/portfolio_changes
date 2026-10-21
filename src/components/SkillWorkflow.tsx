'use client';

import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, Bot, Search, Wrench, BrainCircuit, ScanLine, ShieldCheck, Monitor, Server, Database, FileCode, Container, Cloud, Box, Braces, Check, type LucideIcon } from 'lucide-react';
import styles from './Skills.module.css';

const workflows: Record<string, { label: string; steps: [string, string][] }> = {
  ai: { label: 'Agent orchestration', steps: [['Retrieve', 'Find relevant context with hybrid search.'], ['Reason', 'Ground the response in retrieved context.'], ['Act', 'Call a tool and return its result.']] },
  ml: { label: 'Inference pipeline', steps: [['Prepare', 'Transform incoming data into model features.'], ['Classify', 'Combine model predictions in an ensemble.'], ['Evaluate', 'Inspect confidence and classification results.']] },
  web: { label: 'Request lifecycle', steps: [['Request', 'Send an interaction from the React interface.'], ['Validate', 'Check authentication and API input.'], ['Respond', 'Return structured data to the client.']] },
  databases: { label: 'Hybrid retrieval', steps: [['Embed', 'Represent the query as a dense vector.'], ['Search', 'Retrieve vector and lexical matches.'], ['Rank', 'Fuse candidates into a ranked result set.']] },
  cloud: { label: 'Isolated execution', steps: [['Provision', 'Create an ephemeral container for the task.'], ['Execute', 'Run code inside a restricted environment.'], ['Archive', 'Store output artifacts and execution logs.']] },
  languages: { label: 'Type-safe delivery', steps: [['Define', 'Describe data contracts and expected types.'], ['Check', 'Validate schemas across Python and TypeScript.'], ['Build', 'Compile the application with checked contracts.']] },
};

type DiagramNode = { x: number; y: number; label: string; icon: LucideIcon; stage: number; shape?: 'database' | 'document' | 'hex' };
type Diagram = { nodes: DiagramNode[]; edges: { d: string; stage: number; dashed?: boolean }[]; caption: string };
const diagrams: Record<string, Diagram> = {
  ai: {
    caption: 'Context → agent → tool → feedback',
    nodes: [
      { x: 42, y: 65, label: 'Context', icon: Search, stage: 0, shape: 'document' },
      { x: 150, y: 42, label: 'Agent', icon: Bot, stage: 1, shape: 'hex' },
      { x: 258, y: 65, label: 'Tool', icon: Wrench, stage: 2 },
    ],
    edges: [{ d: 'M66 59 L122 46', stage: 1 }, { d: 'M178 46 L232 59', stage: 2 }, { d: 'M282 65 H293 V119 H107 V42 H120', stage: 2, dashed: true }],
  },
  ml: {
    caption: 'Features fan out; predictions converge',
    nodes: [
      { x: 35, y: 69, label: 'Features', icon: ScanLine, stage: 0 },
      { x: 144, y: 27, label: 'Model A', icon: BrainCircuit, stage: 1, shape: 'hex' },
      { x: 144, y: 105, label: 'Model B', icon: BrainCircuit, stage: 1, shape: 'hex' },
      { x: 265, y: 69, label: 'Verdict', icon: ShieldCheck, stage: 2 },
    ],
    edges: [{ d: 'M59 62 L116 30', stage: 1 }, { d: 'M59 76 L116 102', stage: 1 }, { d: 'M172 27 L239 61', stage: 2 }, { d: 'M172 105 L239 77', stage: 2 }],
  },
  web: {
    caption: 'Solid arrows: request · dashed arrows: response',
    nodes: [
      { x: 40, y: 68, label: 'Browser', icon: Monitor, stage: 0 },
      { x: 150, y: 68, label: 'API', icon: Server, stage: 1 },
      { x: 260, y: 68, label: 'Data', icon: Database, stage: 2, shape: 'database' },
    ],
    edges: [{ d: 'M65 60 H124', stage: 1 }, { d: 'M175 60 H234', stage: 2 }, { d: 'M235 78 H176', stage: 2, dashed: true }, { d: 'M125 78 H66', stage: 2, dashed: true }],
  },
  databases: {
    caption: 'Vector + lexical search → ranked matches',
    nodes: [
      { x: 35, y: 67, label: 'Query', icon: Search, stage: 0 },
      { x: 146, y: 26, label: 'Vectors', icon: Database, stage: 1, shape: 'database' },
      { x: 146, y: 105, label: 'Lexical', icon: Database, stage: 1, shape: 'database' },
      { x: 265, y: 67, label: 'Ranked', icon: FileCode, stage: 2, shape: 'document' },
    ],
    edges: [{ d: 'M59 67 H85 V26 H120', stage: 1 }, { d: 'M85 67 V105 H120', stage: 1 }, { d: 'M170 26 H209 V60 H239', stage: 2 }, { d: 'M170 105 H209 V74 H239', stage: 2 }],
  },
  cloud: {
    caption: 'Provision → isolated runtime → artifact store',
    nodes: [
      { x: 42, y: 32, label: 'Control', icon: Cloud, stage: 0 },
      { x: 150, y: 74, label: 'Sandbox', icon: Container, stage: 1 },
      { x: 258, y: 32, label: 'Artifacts', icon: Box, stage: 2 },
    ],
    edges: [{ d: 'M66 32 H95 V74 H124', stage: 1 }, { d: 'M174 74 H210 V32 H232', stage: 2 }],
  },
  languages: {
    caption: 'Source files → contract checks → build',
    nodes: [
      { x: 36, y: 27, label: 'Python', icon: FileCode, stage: 0, shape: 'document' },
      { x: 36, y: 105, label: 'TypeScript', icon: Braces, stage: 0, shape: 'document' },
      { x: 150, y: 66, label: 'Typecheck', icon: Check, stage: 1, shape: 'hex' },
      { x: 264, y: 66, label: 'Build', icon: Box, stage: 2 },
    ],
    edges: [{ d: 'M60 27 H89 L122 60', stage: 1 }, { d: 'M60 105 H89 L122 72', stage: 1 }, { d: 'M178 66 H238', stage: 2 }],
  },
};

export default function SkillWorkflow({ domain, reducedMotion }: { domain: string; reducedMotion: boolean }) {
  const [step, setStep] = useState(0);
  const workflow = workflows[domain] ?? workflows.ai;
  const diagram = diagrams[domain] ?? diagrams.ai;
  const arrowId = useId();
  return (
    <div className={styles.workflow}>
      <div className={styles.workflowHeading}>
        <span>{workflow.label}</span>
        <span>EXPLORE THE WORKFLOW</span>
      </div>
      <svg viewBox="0 0 304 152" className={styles.workflowMap} aria-hidden="true">
        <defs>
          <marker id={arrowId} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M1 1 L7 4 L1 7" fill="none" stroke="var(--accent-ink)" strokeWidth="1.5" />
          </marker>
        </defs>
        {domain === 'cloud' && <rect x="115" y="46" width="70" height="66" rx="9" fill="none" stroke="var(--accent-ink)" strokeDasharray="3 4" />}
        {diagram.edges.map((edge, index) => (
          <motion.path key={index} d={edge.d} fill="none" stroke={step >= edge.stage ? 'var(--accent-ink)' : 'var(--color-muted)'} strokeWidth="1.6" strokeDasharray={edge.dashed ? '4 4' : undefined} markerEnd={`url(#${arrowId})`} initial={{ opacity: reducedMotion ? 1 : 0 }} animate={{ opacity: step >= edge.stage ? 1 : 0.55 }} transition={{ duration: reducedMotion ? 0 : 0.4, delay: reducedMotion ? 0 : index * 0.07 }} />
        ))}
        {diagram.nodes.map(({ x, y, label, icon: Icon, stage, shape }) => (
          <g key={label} transform={`translate(${x} ${y})`}>
            <g fill={stage === step ? 'var(--accent)' : 'var(--color-card)'} stroke={stage <= step ? 'var(--accent-ink)' : 'var(--color-muted)'} strokeWidth={stage === step ? 2 : 1}>
              {shape === 'database' ? <><path d="M-23 -12 V12 C-23 23 23 23 23 12 V-12 Z" /><ellipse cy="-12" rx="23" ry="7" /></>
                : shape === 'document' ? <path d="M-21 -20 H11 L21 -10 V20 H-21 Z M11 -20 V-10 H21" />
                : shape === 'hex' ? <path d="M-16 -21 H16 L28 0 L16 21 H-16 L-28 0 Z" />
                : <rect x="-23" y="-20" width="46" height="40" rx="7" />}
            </g>
            <Icon x={-10} y={-10} width={20} height={20} color={stage === step ? 'var(--accent-on)' : 'var(--color-ink)'} strokeWidth={1.6} />
            <text y="34" textAnchor="middle" fill="var(--color-ink)" fontSize="9" fontWeight={stage === step ? 700 : 400}>{label}</text>
          </g>
        ))}
      </svg>
      <p className={styles.diagramCaption}>{diagram.caption}</p>
      <div className={styles.workflowSteps} role="group" aria-label="Explore workflow stages">
        {workflow.steps.map(([label], index) => (
          <button key={label} type="button" aria-pressed={step === index} onClick={() => setStep(index)}>{label}</button>
        ))}
      </div>
      <p className={styles.workflowDetail} aria-live="polite">{workflow.steps[step][1]}</p>
      <button type="button" className={styles.workflowNext} onClick={() => setStep((step + 1) % 3)}>
        {step === 2 ? 'Start again' : 'Next step'}
        {step === 2 ? <RotateCcw size={13} /> : <ArrowRight size={13} />}
      </button>
    </div>
  );
}
