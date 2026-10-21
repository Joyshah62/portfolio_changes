import {
  siDocker, siElevenlabs, siFastapi, siFlask, siGit, siGnubash, siGooglegemini, siJavascript, siJsonwebtokens,
  siJupyter, siLinux, siMongodb, siMysql, siNginx, siNumpy, siOpencv, siPandas, siPostgresql, siPython, siPytorch,
  siReact, siScikitlearn, siSqlalchemy, siTypescript, siYolo, type SimpleIcon,
} from 'simple-icons';
// Raw lucide shapes (not the React components), so the 3D scene can paint them into textures.
import { __iconNode as arrowDownWideNarrow } from 'lucide-react/dist/esm/icons/arrow-down-wide-narrow.js';
import { __iconNode as axis3d } from 'lucide-react/dist/esm/icons/axis-3d.js';
import { __iconNode as bot } from 'lucide-react/dist/esm/icons/bot.js';
import { __iconNode as brainCircuit } from 'lucide-react/dist/esm/icons/brain-circuit.js';
import { __iconNode as cloud } from 'lucide-react/dist/esm/icons/cloud.js';
import { __iconNode as database } from 'lucide-react/dist/esm/icons/database.js';
import { __iconNode as fileSearch } from 'lucide-react/dist/esm/icons/file-search.js';
import { __iconNode as flaskConical } from 'lucide-react/dist/esm/icons/flask-conical.js';
import { __iconNode as messageSquareText } from 'lucide-react/dist/esm/icons/message-square-text.js';
import { __iconNode as scanSearch } from 'lucide-react/dist/esm/icons/scan-search.js';
import { __iconNode as webhook } from 'lucide-react/dist/esm/icons/webhook.js';
import { __iconNode as wrench } from 'lucide-react/dist/esm/icons/wrench.js';

type IconNode = [string, Record<string, string>][];

/** Real brand marks where one exists; a line icon for concepts and for brands simple-icons doesn't carry. */
const logos: Record<string, SimpleIcon | IconNode> = {
  'LLM Agents': bot,
  'Tool Calling': wrench,
  RAG: fileSearch,
  'Hybrid Search': scanSearch,
  Reranking: arrowDownWideNarrow,
  'Prompt Engineering': messageSquareText,
  Gemini: siGooglegemini,
  ElevenLabs: siElevenlabs,
  PyTorch: siPytorch,
  'Scikit Learn': siScikitlearn,
  BERT: brainCircuit,
  YOLO: siYolo,
  OpenCV: siOpencv,
  Pandas: siPandas,
  NumPy: siNumpy,
  FastAPI: siFastapi,
  Flask: siFlask,
  React: siReact,
  'REST APIs': webhook,
  SQLAlchemy: siSqlalchemy,
  Alembic: flaskConical,
  JWT: siJsonwebtokens,
  'JupyterLab Extensions': siJupyter,
  PostgreSQL: siPostgresql,
  pgvector: axis3d,
  MySQL: siMysql,
  MongoDB: siMongodb,
  'AWS (S3)': cloud,
  Docker: siDocker,
  Linux: siLinux,
  Nginx: siNginx,
  Git: siGit,
  Bash: siGnubash,
  Python: siPython,
  TypeScript: siTypescript,
  JavaScript: siJavascript,
  SQL: database,
};

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');

/**
 * Brand colours that would vanish against the current surface fall back to the category accent:
 * near-black marks on dark surfaces, near-white / pale-yellow marks on light surfaces.
 */
function readableBrandHex(hex: string, fallbackAccent: string, mode: 'dark' | 'light') {
  const [r, g, b] = [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
  const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  if (mode === 'dark' && lum < 0.12) return fallbackAccent;
  if (mode === 'light' && lum > 0.62) return fallbackAccent;
  return `#${hex}`;
}

/** A standalone 24×24 SVG for the skill: brand colour for logos, `accent` for line icons. */
export function logoSvg(skill: string, accent: string, mode: 'dark' | 'light' = 'dark') {
  const logo = logos[skill] ?? database;
  const open = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"';
  if ('path' in logo) return `${open} fill="${readableBrandHex(logo.hex, accent, mode)}"><path d="${logo.path}"/></svg>`;
  const shapes = logo
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== 'key').map(([k, v]) => `${k}="${escape(v)}"`).join(' ')}/>`)
    .join('');
  return `${open} fill="none" stroke="${accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${shapes}</svg>`;
}
