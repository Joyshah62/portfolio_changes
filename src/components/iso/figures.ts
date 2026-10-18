import { frame, slits } from '@/lib/iso';

// One iso-glow figure per Journey entry. Hairline structure stays dim; anything marked `lv-*` takes the
// accent while the card is the active one in the stack. Styles: globals.css `.iso`.

export interface IsoFigureDef {
  viewBox: string;
  svg: string;
}

const ASPECT = 1.3;

const defs = (id: string) => `<defs>
  <filter id="${id}-glow" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  <filter id="${id}-bloom" filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="6000" height="6000"><feGaussianBlur stdDeviation="8"/></filter>
</defs>`;

type Kernel = ReturnType<typeof frame>;

/** Ground plate with an inset line, the base of every figure */
const plate = (K: Kernel, w: number, d: number) =>
  K.box(0, 0, 0, w, d, 8, 12) +
  `<g transform="${K.TOP(0, 0, 8)}"><rect class="detail" x="8" y="8" width="${w - 16}" height="${d - 16}" rx="8"/></g>`;

/** A small item sliding along +x into a machine; `--tx/--ty` is its screen-space travel */
function traveller(K: Kernel, x: number, y: number, w: number, d: number, h: number, dx: number, k: number, cls: string, bad = false) {
  const [tx, ty] = K.D(dx, 0, 0);
  return `<g class="pk ${cls}${bad ? ' pk-bad' : ''}" style="--i:${k};--tx:${tx.toFixed(1)}px;--ty:${ty.toFixed(1)}px">${K.box(x, y, 8, w, d, h, 0, bad ? 'lv-face' : '')}</g>`;
}

/** 01 CodeBench: a notebook on a laptop; cells run in order while the tutor replies alongside */
function notebook(): IsoFigureDef {
  const id = 'jr-notebook';
  const K = frame([[0, 0, 0], [200, 0, 0], [0, 160, 0], [200, 160, 0], [25, 35, 115], [175, 45, 115]], ASPECT);
  const { TOP, FRONT, box } = K;
  const code = [[44, 30], [60, 22], [36, 50], [52, 40]];
  const cells = code
    .map(([a, b], i) => {
      const y = 12 + i * 19;
      return `<text class="label" x="9" y="${y + 9}" font-size="5">[${i + 1}]</text>
        <circle class="led lv-led" style="--i:${i * 4}" cx="21" cy="${y + 7}" r="1.6"/>
        <rect class="nbcell" style="--i:${i * 4}" x="25" y="${y}" width="74" height="15" rx="2"/>
        <line class="detail" x1="29" y1="${y + 5}" x2="${29 + a}" y2="${y + 5}"/>
        <line class="detail" x1="29" y1="${y + 10}" x2="${29 + b}" y2="${y + 10}"/>`;
    })
    .join('');
  const bubbles = [[108, 16, 26], [112, 30, 24], [108, 44, 28]]
    .map(([x, y, w], i) => `<rect class="bubble${i ? ' lv-show' : ''}" style="--i:${8 + i * 6}" x="${x}" y="${y}" width="${w}" height="9" rx="3"/>`)
    .join('');
  let svg = plate(K, 200, 160);
  svg += box(25, 35, 15, 150, 10, 100);
  svg += `<g transform="${FRONT(25, 45, 115)}">
    <rect class="halo" filter="url(#${id}-bloom)" x="6" y="6" width="138" height="88"/>
    <rect class="glass lv-glass" x="6" y="6" width="138" height="88" rx="3"/>
    ${cells}
    <rect class="detail" x="104" y="12" width="36" height="74" rx="3"/>
    ${bubbles}
    <text class="label" x="108" y="81" font-size="5">tutor</text>
  </g>`;
  svg += box(25, 45, 8, 150, 95, 7, 6);
  svg += `<g transform="${TOP(25, 45, 15)}">
    <rect class="detail" x="15" y="10" width="120" height="48" rx="3"/>
    ${slits(25, 125, 10, 10, 58)}${slits(22, 46, 12, 15, 135, false)}
    <rect class="detail" x="55" y="66" width="40" height="20" rx="3"/>
  </g>`;
  return { viewBox: K.viewBox, svg: defs(id) + svg };
}

/** 02 M.S.: a study desk; the lamp comes on over the stack of books */
function study(): IsoFigureDef {
  const id = 'jr-study';
  const K = frame([[0, 0, 0], [200, 0, 0], [0, 150, 0], [200, 150, 0], [95, 60, 102], [148, 58, 82]], ASPECT);
  const { TOP, FRONT, box, path } = K;
  const book = (x: number, y: number, z: number, w: number, d: number, h: number, title = '') =>
    box(x, y, z, w, d, h) +
    `<g transform="${FRONT(x, y + d, z + h)}">${slits(2.5, h - 2.5, 2.5, 4, w - 4, false, 'detail lv-detail')}${title ? `<text class="label" x="6" y="${h - 3}" font-size="5">${title}</text>` : ''}</g>`;
  let svg = plate(K, 200, 150);
  svg += `<g transform="${TOP(0, 0, 8)}"><ellipse class="halo" filter="url(#${id}-bloom)" cx="95" cy="92" rx="48" ry="32"/></g>`;
  svg += box(130, 40, 8, 36, 36, 5, 10);
  svg += `<g transform="${TOP(130, 40, 13)}"><circle class="led lv-led" cx="28" cy="28" r="2.2"/></g>`;
  svg += `<path class="wire lv-wire" d="${path([[148, 58, 13], [148, 58, 82], [118, 70, 96]])}"/>`;
  svg += book(40, 80, 8, 70, 48, 10);
  svg += book(45, 78, 18, 64, 44, 9);
  svg += `<g transform="${FRONT(45, 122, 27)}"><text class="label" x="6" y="6.5" font-size="5">systems</text></g>`;
  svg += book(38, 82, 27, 72, 46, 11, 'machine learning');
  svg += `<g transform="${TOP(48, 88, 38)}"><rect class="face top" width="34" height="24" rx="1"/><text class="label lv-hide" x="4" y="14" font-size="6">gpa</text><text class="scr lv-show" x="4" y="14" font-size="6">3.75</text></g>`;
  svg += `<g class="lv-glow">${box(95, 60, 86, 30, 24, 16, 8, 'lv-face')}</g>`;
  return { viewBox: K.viewBox, svg: defs(id) + svg };
}

/** 03 Forenzy: requests stream into a firewall; clean ones pass, the attack is stopped at the gate */
function firewall(): IsoFigureDef {
  const id = 'jr-firewall';
  const K = frame([[0, 0, 0], [250, 0, 0], [0, 140, 0], [250, 140, 0], [120, 55, 92], [150, 130, 92]], ASPECT);
  const { FRONT, SIDE, box, path } = K;
  let svg = plate(K, 250, 140);
  svg += `<path class="wire lv-wire" d="${path([[8, 100, 8], [242, 100, 8]])}"/>`;
  svg += [0, 1, 2].map((k) => traveller(K, 8, 94, 12, 12, 12, 98, k, 'pk-in', k === 1)).join('');
  svg += box(120, 55, 8, 30, 75, 84);
  svg += `<g transform="${FRONT(120, 130, 92)}">
    <circle class="led" cx="8" cy="10" r="2"/><circle class="led lv-led" cx="15" cy="10" r="2"/><circle class="led blink-live" cx="22" cy="10" r="2"/>
    ${slits(6, 24, 4, 20, 76)}
  </g>`;
  svg += `<g transform="${SIDE(150, 130, 92)}">
    <rect class="halo" filter="url(#${id}-bloom)" x="6" y="8" width="63" height="24"/>
    <rect class="glass lv-glass" x="6" y="8" width="63" height="24" rx="2"/>
    <text class="label lv-hide" x="11" y="23" font-size="6.5">monitoring</text>
    <text class="scr lv-show" x="11" y="23" font-size="6.5">f1 · 97.2%</text>
    ${slits(44, 74, 6, 6, 69, false)}
  </g>`;
  svg += [0, 2].map((k) => traveller(K, 152, 94, 12, 12, 12, 78, k, 'pk-out')).join('');
  return { viewBox: K.viewBox, svg: defs(id) + svg };
}

/** 04 CyberNGO: messages from SMS, email and WhatsApp on a phone; the scam gets flagged beside the record stack */
function inbox(): IsoFigureDef {
  const id = 'jr-inbox';
  const K = frame([[0, 0, 0], [220, 0, 0], [0, 160, 0], [220, 160, 0], [150, 40, 26], [200, 76, 26]], ASPECT);
  const { TOP, FRONT, box } = K;
  const messages: Array<[number, number, number, string, boolean]> = [
    [10, 16, 44, 'sms', false],
    [26, 34, 40, 'email', false],
    [10, 52, 48, 'whatsapp', false],
    [22, 70, 44, 'sms', true],
    [10, 88, 36, 'email', false],
  ];
  const bubbles = messages
    .map(([x, y, w, ch, scam], i) => `<rect class="bubble${scam ? ' scam' : ''}" style="--i:${i * 3}" x="${x}" y="${y}" width="${w}" height="13" rx="4"/>
      <text class="label" x="${x + 4}" y="${y + 6}" font-size="3.6">${ch}</text>
      <line class="detail" x1="${x + 4}" y1="${y + 9.5}" x2="${x + w - 6}" y2="${y + 9.5}"/>${scam ? `<text class="scr lv-show" style="--i:16" x="${x + w + 2}" y="${y + 9}" font-size="5">fraud</text>` : ''}`)
    .join('');
  let svg = plate(K, 220, 160);
  for (let i = 0; i < 5; i++) svg += box(150, 40, 8 + i * 3.4, 50, 36, 3);
  svg += `<g transform="${FRONT(150, 76, 25)}"><circle class="led lv-led" cx="44" cy="2" r="1.4"/></g>`;
  svg += `<g transform="${TOP(150, 40, 25)}"><text class="label lv-hide" x="5" y="20" font-size="6">records</text><text class="scr lv-show" x="5" y="20" font-size="6">100k+</text></g>`;
  svg += box(40, 22, 8, 84, 128, 6, 10);
  svg += `<g transform="${TOP(40, 22, 14)}">
    <rect class="halo" filter="url(#${id}-bloom)" x="6" y="10" width="72" height="108"/>
    <rect class="glass lv-glass" x="6" y="10" width="72" height="108" rx="5"/>
    <rect class="detail" x="32" y="4" width="20" height="2.5" rx="1.2"/>
    ${bubbles}
  </g>`;
  return { viewBox: K.viewBox, svg: defs(id) + svg };
}

/** 05 B.Tech: a mortarboard whose tassel lights, beside the published paper */
function graduation(): IsoFigureDef {
  const id = 'jr-graduation';
  const K = frame([[0, 0, 0], [220, 0, 0], [0, 160, 0], [220, 160, 0], [60, 45, 52], [140, 125, 52]], ASPECT);
  const { TOP, box, path } = K;
  let svg = plate(K, 220, 160);
  svg += box(8, 112, 8, 54, 40, 4);
  svg += `<g transform="${TOP(8, 112, 12)}">
    <rect class="band" x="5" y="5" width="44" height="6" rx="1"/>
    ${slits(16, 34, 4.5, 5, 49, false)}
    <text class="label" x="5" y="37" font-size="4">ieee cict 2024</text>
  </g>`;
  svg += box(74, 59, 8, 52, 52, 40, 26);
  svg += box(60, 45, 48, 80, 80, 4);
  svg += `<g transform="${TOP(60, 45, 52)}"><text class="label lv-hide" x="10" y="60" font-size="8">cgpa</text><text class="scr lv-show" x="10" y="60" font-size="8">9.15 / 10</text></g>`;
  svg += box(97, 82, 52, 6, 6, 3, 3);
  svg += `<path class="wire lv-wire" d="${path([[100, 85, 55], [138, 123, 52], [138, 123, 26]])}"/>`;
  svg += `<g class="lv-glow">${box(135, 120, 14, 6, 6, 12, 3, 'lv-face')}</g>`;
  return { viewBox: K.viewBox, svg: defs(id) + svg };
}

/** Figures in Journey order, keyed by entry number */
const builders: Record<string, { id: string; build: () => IsoFigureDef }> = {
  '01': { id: 'jr-notebook', build: notebook },
  '02': { id: 'jr-study', build: study },
  '03': { id: 'jr-firewall', build: firewall },
  '04': { id: 'jr-inbox', build: inbox },
  '05': { id: 'jr-graduation', build: graduation },
};

const cache = new Map<string, IsoFigureDef & { id: string }>();

export function isoFigure(key: string) {
  const entry = builders[key];
  if (!entry) return null;
  if (!cache.has(key)) cache.set(key, { id: entry.id, ...entry.build() });
  return cache.get(key)!;
}
