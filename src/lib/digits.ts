/**
 * A 784-64-32-10 MLP trained on MNIST, run entirely in the browser.
 * Weights ship as int8 (per-layer scale) in /public/models/digits.json.
 */

export interface DigitModel {
  arch: number[];
  /** [in][out] row-major float weights per layer */
  weights: Float32Array[];
  biases: Float32Array[];
  testAccuracy: number;
}

/** Activations for every layer: input (784), hidden (64), hidden (32), output probabilities (10). */
export type Activations = [Float32Array, Float32Array, Float32Array, Float32Array];

interface RawLayer {
  in: number;
  out: number;
  scale: number;
  w: string;
  b: number[];
}

let cached: Promise<DigitModel> | null = null;

export function loadDigitModel(): Promise<DigitModel> {
  cached ??= fetch('/models/digits.json')
    .then((r) => {
      if (!r.ok) throw new Error(`model ${r.status}`);
      return r.json() as Promise<{ arch: number[]; layers: RawLayer[]; testAccuracy: number }>;
    })
    .then((raw) => ({
      arch: raw.arch,
      testAccuracy: raw.testAccuracy,
      weights: raw.layers.map((l) => {
        const bytes = Uint8Array.from(atob(l.w), (c) => c.charCodeAt(0));
        const q = new Int8Array(bytes.buffer);
        return Float32Array.from(q, (v) => v * l.scale);
      }),
      biases: raw.layers.map((l) => Float32Array.from(l.b)),
    }))
    .catch((err) => {
      cached = null; // allow a retry
      throw err;
    });
  return cached;
}

export function infer(model: DigitModel, input: Float32Array): Activations {
  const acts: Float32Array[] = [input];
  for (let l = 0; l < model.weights.length; l++) {
    const nin = model.arch[l], nout = model.arch[l + 1];
    const a = acts[l], w = model.weights[l];
    const z = Float32Array.from(model.biases[l]);
    for (let i = 0; i < nin; i++) {
      const ai = a[i];
      if (ai === 0) continue;
      const row = i * nout;
      for (let o = 0; o < nout; o++) z[o] += w[row + o] * ai;
    }
    if (l < model.weights.length - 1) {
      for (let o = 0; o < nout; o++) if (z[o] < 0) z[o] = 0;
    } else {
      let max = -Infinity, sum = 0;
      for (let o = 0; o < nout; o++) max = Math.max(max, z[o]);
      for (let o = 0; o < nout; o++) sum += z[o] = Math.exp(z[o] - max);
      for (let o = 0; o < nout; o++) z[o] /= sum;
    }
    acts.push(z);
  }
  return acts as Activations;
}

/**
 * Turns a drawing into an MNIST-style 28×28 input: crop to the ink, fit the longest side
 * into 20px, then centre by centre of mass — the same normalisation MNIST digits went through.
 * Reads ink from the alpha channel. Returns null for an empty canvas.
 */
export function preprocess(source: HTMLCanvasElement): Float32Array | null {
  const ctx = source.getContext('2d', { willReadFrequently: true })!;
  const { width: W, height: H } = source;
  const px = ctx.getImageData(0, 0, W, H).data;

  let minX = W, minY = H, maxX = -1, maxY = -1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (px[(y * W + x) * 4 + 3] > 20) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) return null;

  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const k = 20 / Math.max(bw, bh);
  const dw = Math.max(1, bw * k), dh = Math.max(1, bh * k);

  // Fit the ink box into 20×20, centred in a 28×28 canvas
  const small = document.createElement('canvas');
  small.width = small.height = 28;
  const s = small.getContext('2d', { willReadFrequently: true })!;
  s.imageSmoothingEnabled = true;
  s.imageSmoothingQuality = 'high';
  s.drawImage(source, minX, minY, bw, bh, (28 - dw) / 2, (28 - dh) / 2, dw, dh);
  const fit = s.getImageData(0, 0, 28, 28).data;

  // Centre of mass → shift so it lands on the middle of the grid
  let mass = 0, cx = 0, cy = 0;
  for (let i = 0; i < 784; i++) {
    const v = fit[i * 4 + 3] / 255;
    mass += v;
    cx += (i % 28) * v;
    cy += Math.floor(i / 28) * v;
  }
  const sx = Math.round(13.5 - cx / mass), sy = Math.round(13.5 - cy / mass);

  const out = new Float32Array(784);
  for (let y = 0; y < 28; y++) {
    for (let x = 0; x < 28; x++) {
      const fx = x - sx, fy = y - sy;
      if (fx < 0 || fy < 0 || fx > 27 || fy > 27) continue;
      out[y * 28 + x] = fit[(fy * 28 + fx) * 4 + 3] / 255;
    }
  }
  return out;
}
