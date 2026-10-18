/** Words the flow field spells, and where in the section's scroll each one is fully formed. */
export const flowWords = ['ideas.', 'code.', 'shipped.'] as const;
export const flowCentres = [0.2, 0.5, 0.8] as const;

const smoothstep = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};

/** Which word the particles chase, and how hard (0 = free flow, 1 = locked to the glyphs). */
export function formAt(p: number) {
  let index = 0;
  for (let i = 1; i < flowCentres.length; i++) if (Math.abs(p - flowCentres[i]) < Math.abs(p - flowCentres[index])) index = i;
  return { index, form: 1 - smoothstep(0.06, 0.13, Math.abs(p - flowCentres[index])) };
}
