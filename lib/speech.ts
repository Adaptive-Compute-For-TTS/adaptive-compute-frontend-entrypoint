/**
 * Mock adaptive-inference model. There is no audio and no real predictor:
 * this produces deterministic word timings and an illustrative per-frame
 * step schedule so the UI can behave like playback.
 */

export type Timeline = {
  words: string[];
  /** [start, end] for each word, normalised 0–1. */
  spans: [number, number][];
};

export type Schedule = {
  /** Refinement steps spent on each frame. */
  steps: number[];
  /** Bar heights 0–1, relative to `max`. */
  bars: number[];
  total: number;
  mean: number;
};

/** Small deterministic PRNG so server and client render the same bars. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const round = (n: number) => Math.round(n * 1000) / 1000;

export function buildTimeline(text: string): Timeline {
  const words = text.split(/\s+/).filter(Boolean);
  const lead = 0.6;
  const gap = 0.35;

  // Lay words out on an abstract time axis, then normalise.
  const raw: [number, number][] = [];
  let t = lead;
  for (const word of words) {
    const weight = Math.max(1, word.replace(/\W/g, "").length / 2.6);
    raw.push([t, t + weight]);
    t += weight + gap + (/[,.;:]$/.test(word) ? 1.6 : 0);
  }
  const total = t - gap + lead;
  const spans = raw.map(
    ([a, b]) => [round(a / total), round(b / total)] as [number, number],
  );
  return { words, spans };
}

const frameCenter = (i: number, frames: number) => (i + 0.5) / frames;

/** Every frame gets the same number of steps. */
export function fixedSchedule(frames: number, steps: number, max: number): Schedule {
  const all = Array.from({ length: frames }, () => steps);
  return toSchedule(all, max);
}

/**
 * Illustrative adaptive schedule: few steps in pauses, more inside words,
 * peaks near word onsets. Rescaled so the mean is exactly `targetMean`
 * (when frames × targetMean is a whole number).
 */
export function adaptiveSchedule(
  timeline: Timeline,
  frames: number,
  targetMean: number,
  max: number,
  min = 2,
): Schedule {
  const rand = mulberry32(hash(timeline.words.join(" ")));
  const raw: number[] = [];
  for (let i = 0; i < frames; i++) {
    const x = frameCenter(i, frames);
    const span = timeline.spans.find(([a, b]) => x >= a && x <= b);
    if (!span) {
      raw.push(rand() * 0.15);
      continue;
    }
    const [a, b] = span;
    const pos = (x - a) / (b - a);
    const onset = Math.exp(-((pos - 0.12) ** 2) / 0.02);
    raw.push(0.15 + 0.3 * rand() + 2.2 * onset * rand() ** 0.5);
  }

  // Find a scale so rounded, clamped steps sum to the target total.
  const target = Math.round(targetMean * frames);
  const at = (k: number) =>
    raw.map((r) => Math.min(max, Math.max(min, Math.round(min + k * r))));
  const sum = (xs: number[]) => xs.reduce((s, v) => s + v, 0);
  let lo = 0;
  let hi = max * 4;
  for (let n = 0; n < 50; n++) {
    const mid = (lo + hi) / 2;
    if (sum(at(mid)) < target) lo = mid;
    else hi = mid;
  }
  const steps = at(hi);

  // Settle any rounding remainder one step at a time, largest frames first.
  const order = raw.map((r, i) => [r, i] as const).sort((p, q) => q[0] - p[0]);
  let diff = target - sum(steps);
  for (let n = 0; diff !== 0 && n < frames * 4; n++) {
    const i = order[n % frames][1];
    const next = steps[i] + Math.sign(diff);
    if (next >= min && next <= max) {
      steps[i] = next;
      diff -= Math.sign(diff);
    }
  }
  return toSchedule(steps, max);
}

function toSchedule(steps: number[], max: number): Schedule {
  const total = steps.reduce((s, v) => s + v, 0);
  return {
    steps,
    bars: steps.map((s) => round(s / max)),
    total,
    mean: total / steps.length,
  };
}

/** Steps spent on frames already played at `progress`. */
export function stepsSpentAt(steps: number[], progress: number) {
  const played = Math.min(steps.length, Math.floor(progress * steps.length + 1e-9));
  let spent = 0;
  for (let i = 0; i < played; i++) spent += steps[i];
  return spent;
}

export function wordIndexAt(spans: [number, number][], progress: number) {
  if (progress <= 0) return -1;
  for (let i = spans.length - 1; i >= 0; i--) {
    if (progress >= spans[i][0]) return i;
  }
  return -1;
}

export function formatTime(seconds: number) {
  const s = Math.max(0, seconds);
  const m = Math.floor(s / 60);
  const rest = (s % 60).toFixed(1).padStart(4, "0");
  return `${m}:${rest}`;
}

/** Word under frame `i`, or null in a pause. */
export function wordAtFrame(timeline: Timeline, frames: number, i: number) {
  const x = frameCenter(i, frames);
  const w = timeline.spans.findIndex(([a, b]) => x >= a && x <= b);
  return w === -1 ? null : timeline.words[w].replace(/[^A-Za-z0-9'’-]/g, "");
}

/** Hover readout for one frame: "Frame 041 · 14 steps · delayed". */
export function describeFrame(timeline: Timeline, steps: number[], i: number) {
  const word = wordAtFrame(timeline, steps.length, i);
  const n = steps[i];
  return `Frame ${String(i + 1).padStart(3, "0")} · ${n} step${n === 1 ? "" : "s"} · ${word ?? "pause"}`;
}

/** Steps spent inside each word (total and per frame), in reading order. */
export function stepsPerWord(timeline: Timeline, steps: number[]) {
  const frames = steps.length;
  return timeline.words.map((word, w) => {
    const [a, b] = timeline.spans[w];
    let sum = 0;
    let count = 0;
    for (let i = 0; i < frames; i++) {
      const x = frameCenter(i, frames);
      if (x >= a && x <= b) {
        sum += steps[i];
        count++;
      }
    }
    return {
      word: word.replace(/[^A-Za-z0-9'’-]/g, ""),
      total: sum,
      mean: count ? sum / count : 0,
      frames: count,
    };
  });
}
