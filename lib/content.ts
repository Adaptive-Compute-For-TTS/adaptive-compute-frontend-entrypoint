// All placeholder content. Replace with real data when it exists.
// Bylines are group names until the team is public.

export const DEMO_SENTENCE =
  "Your train to Leeds is delayed by twelve minutes, and will now depart from platform four.";

/** Seconds of (simulated) audio for the demo sentence. Same under every schedule. */
export const DEMO_DURATION = 5.6;

/**
 * Single source for the headline numbers, so the metrics strip,
 * leaderboard and demo always agree.
 */
export const STEP_BUDGET = {
  /** Steps per frame in the fixed, full-step model. */
  fixed: 32,
  /** Mean steps per frame chosen by our predictor. */
  adaptiveMean: 7.8,
  /** Wall-clock speedup vs. full steps (300 ms → 96 ms). */
  speedup: 3.1,
} as const;

/** The step predictor's footprint, shared by the hero, metrics and architecture. */
export const PREDICTOR = {
  params: "1.2M",
  /** Per utterance, included in every latency figure. */
  overheadMs: 1.8,
  trainGpuHours: 6,
} as const;

export const METRICS = [
  {
    value: STEP_BUDGET.speedup,
    decimals: 1,
    unit: "×",
    label: "Wall-clock speedup",
    detail: "300 ms → 96 ms median per utterance, single GPU, predictor included",
  },
  {
    value: STEP_BUDGET.adaptiveMean,
    decimals: 1,
    unit: `/${STEP_BUDGET.fixed}`,
    label: "Mean steps / frame",
    detail: `${Math.round((1 - STEP_BUDGET.adaptiveMean / STEP_BUDGET.fixed) * 100)}% of refinement steps never run. Range 2–32 per frame`,
  },
  {
    value: -0.04,
    decimals: 2,
    unit: "",
    label: "MOS vs. full steps",
    detail: "4.27 vs. 4.31, inside the ±0.06 interval. 40 listeners × 120 utterances",
  },
  {
    value: PREDICTOR.overheadMs,
    decimals: 1,
    unit: " ms",
    label: "Predictor overhead",
    detail: `Per utterance, counted in every latency figure. ${PREDICTOR.params} params, under 0.5% of the base model`,
  },
];

export type LeaderboardDetail = {
  /** One-sentence read of the row, shown first when expanded. */
  summary: string;
  /** Per-frame step distribution: min, median, p95, max. */
  stepDist: [number, number, number, number];
  mosCi: string;
  /** WER by text domain. */
  werByDomain: { domain: string; value: number }[];
  latencyP95: string;
  rtf: string;
  extraCost: string;
};

export type LeaderboardRow = {
  /** null marks the unranked full-step reference row. */
  rank: number | null;
  method: string;
  note: string;
  steps: string;
  mos: string;
  wer: string;
  latency: string;
  speedup: string;
  detail: LeaderboardDetail;
};

/** Median utterance length in the test set, used for real-time factor. */
export const MEDIAN_UTTERANCE_S = 5.6;
const rtf = (ms: number) => (ms / 1000 / MEDIAN_UTTERANCE_S).toFixed(3);

export const WER_DOMAINS = ["Read speech", "Conversational", "Numbers & names"] as const;
const wer = (a: number, b: number, c: number) =>
  WER_DOMAINS.map((domain, i) => ({ domain, value: [a, b, c][i] }));

// Ranked by MOS among accelerated methods. Speedup = 300 ms / latency.
export const LEADERBOARD: LeaderboardRow[] = [
  {
    rank: 1,
    method: "Adaptive TTS",
    note: "Ours · per-frame",
    steps: STEP_BUDGET.adaptiveMean.toFixed(1),
    mos: "4.27",
    wer: "2.9%",
    latency: "96 ms",
    speedup: `${STEP_BUDGET.speedup.toFixed(1)}×`,
    detail: {
      summary:
        "Within the confidence interval of full steps on MOS, at a third of the latency. Most of the remaining gap is on numbers and names, where the predictor occasionally under-spends.",
      stepDist: [2, 6, 22, 32],
      mosCi: "± 0.06",
      werByDomain: wer(2.1, 3.4, 3.9),
      latencyP95: "131 ms",
      rtf: rtf(96),
      extraCost: `Predictor: ${PREDICTOR.params} params, ~${PREDICTOR.trainGpuHours} GPU-h to train, ${PREDICTOR.overheadMs} ms per utterance`,
    },
  },
  {
    rank: 2,
    method: "Step distillation",
    note: "Baseline",
    steps: "8",
    mos: "4.10",
    wer: "3.3%",
    latency: "92 ms",
    speedup: "3.3×",
    detail: {
      summary:
        "Slightly faster than adaptive because it skips the predictor, but every frame gets 8 steps, so hard onsets lose detail and easy silence still pays full price.",
      stepDist: [8, 8, 8, 8],
      mosCi: "± 0.07",
      werByDomain: wer(2.4, 3.9, 4.6),
      latencyP95: "104 ms",
      rtf: rtf(92),
      extraCost: "Student retraining: ~1,200 GPU-h, one model per step count",
    },
  },
  {
    rank: 3,
    method: "Uniform reduction",
    note: "Baseline",
    steps: "8",
    mos: "3.86",
    wer: "4.4%",
    latency: "92 ms",
    speedup: "3.3×",
    detail: {
      summary:
        "The naive cut: same model, a quarter of the steps everywhere. Listeners most often flag buzzy fricatives and smeared plosives.",
      stepDist: [8, 8, 8, 8],
      mosCi: "± 0.08",
      werByDomain: wer(3.1, 5.0, 6.2),
      latencyP95: "103 ms",
      rtf: rtf(92),
      extraCost: "None. No training, no extra parameters",
    },
  },
  {
    rank: null,
    method: "Full steps",
    note: "Reference",
    steps: String(STEP_BUDGET.fixed),
    mos: "4.31",
    wer: "2.8%",
    latency: "300 ms",
    speedup: "1.0×",
    detail: {
      summary:
        "The unmodified base model. It sets the quality ceiling every other row is measured against, and the latency floor we are trying to beat.",
      stepDist: [32, 32, 32, 32],
      mosCi: "± 0.05",
      werByDomain: wer(2.0, 3.2, 3.8),
      latencyP95: "322 ms",
      rtf: rtf(300),
      extraCost: "None",
    },
  },
];

// ------------------------------------------------------------------
// Analysis: the expandable findings on the home and benchmarks pages.
// ------------------------------------------------------------------

/**
 * Where the adaptive predictor spends steps, by acoustic segment class.
 * `frames` is the share of frames; `steps` is mean steps per frame.
 * Weighted mean comes out at STEP_BUDGET.adaptiveMean (7.8).
 */
export const SEGMENT_CLASSES = [
  { name: "Silence & pauses", frames: 0.24, steps: 2.4 },
  { name: "Vowels & sonorants", frames: 0.41, steps: 6.6 },
  { name: "Fricatives", frames: 0.15, steps: 9.6 },
  { name: "Word-initial transitions", frames: 0.11, steps: 13.4 },
  { name: "Plosive bursts", frames: 0.09, steps: 17.8 },
] as const;

/** Speedup shrinks with batch size: a batch waits for its hardest frame. */
export const BATCH_SPEEDUP = [
  { batch: 1, speedup: STEP_BUDGET.speedup },
  { batch: 4, speedup: 2.8 },
  { batch: 16, speedup: 2.2 },
  { batch: 64, speedup: 1.6 },
] as const;

/** Blind A/B preference, 40 listeners × 120 pairs per comparison. */
export const PREFERENCE = [
  { versus: "Full steps", ours: 31, tie: 41, theirs: 28 },
  { versus: "Step distillation", ours: 52, tie: 27, theirs: 21 },
  { versus: "Uniform reduction", ours: 68, tie: 19, theirs: 13 },
] as const;

/** Predictor behaviour on the held-out set. */
export const PREDICTOR_STATS = [
  { label: "Frames under-predicted", value: "3.1%", note: "Predicted fewer steps than an oracle needed for < 0.05 dB loss" },
  { label: "Frames over-predicted", value: "11.4%", note: "Spent more than needed. Costs time, not quality" },
  { label: "Predictor overhead", value: `${PREDICTOR.overheadMs} ms`, note: "Per utterance, included in every latency figure" },
  { label: "Parameters", value: PREDICTOR.params, note: "Under 0.5% of the base model" },
] as const;

/** Where adaptive still loses to full steps. MOS delta vs. full steps. */
export const FAILURE_CASES = [
  { case: "Whispered speech", delta: -0.21, why: "Noise-like spectra look easy to the predictor but need many steps" },
  { case: "Laughter & non-speech", delta: -0.17, why: "Rare in training data; predictor confidence is poorly calibrated" },
  { case: "Code-switching", delta: -0.12, why: "Language boundaries create onsets the text encoder does not flag" },
  { case: "Long numerals", delta: -0.09, why: "Dense plosive runs; the cap of 32 steps is hit back-to-back" },
] as const;

export type Finding = {
  id: string;
  label: string;
  title: string;
  /** Visible when collapsed. */
  takeaway: string;
  /** Headline number on the right of the row. */
  stat: string;
  statLabel: string;
};

export const FINDINGS: Finding[] = [
  {
    id: "segments",
    label: "Allocation",
    title: "Where the steps go",
    takeaway: "Plosive bursts take 7.4× the steps of silence, and silence is a quarter of all frames.",
    stat: "7.4×",
    statLabel: "Burst vs. silence",
  },
  {
    id: "preference",
    label: "Listening test",
    title: "What listeners prefer",
    takeaway: "Against full steps, most listeners hear no difference. Against both baselines, adaptive wins outright.",
    stat: "41%",
    statLabel: "No preference vs. full",
  },
  {
    id: "batching",
    label: "Systems",
    title: "Speedup under batching",
    takeaway: "A batch is only as fast as its hardest frame, so the speedup narrows as batches grow.",
    stat: "1.6×",
    statLabel: "At batch 64",
  },
  {
    id: "predictor",
    label: "Predictor",
    title: "How often the predictor is wrong",
    takeaway: "It errs toward spending too much. Under-prediction, the error that costs quality, is rare.",
    stat: "3.1%",
    statLabel: "Under-predicted",
  },
  {
    id: "failures",
    label: "Limits",
    title: "Where adaptive still loses",
    takeaway: "Whispers, laughter and code-switching fool the predictor. These are the open problems.",
    stat: "−0.21",
    statLabel: "Worst MOS gap",
  },
];

/** Evaluation sets. Shown as a credibility strip, Andon-style. */
export const EVAL_SETS = [
  { name: "LibriTTS-R", detail: "Read speech · test-clean" },
  { name: "VCTK", detail: "108 speakers · accents" },
  { name: "Expresso", detail: "Conversational · expressive" },
  { name: "Numerals-1k", detail: "In-house · numbers & names" },
] as const;

/** Inference pipeline for the field-note diagram. */
export const PIPELINE = [
  { id: "text", tag: "Unchanged", label: "Text encoder", meta: "Phonemes → hidden states", detail: "Unchanged from the base model. Its hidden states are what the step predictor reads." },
  { id: "predictor", tag: "New", label: "Step predictor", meta: `${PREDICTOR.params} params · ${PREDICTOR.overheadMs} ms`, detail: "A small convolutional head that outputs a step count per frame, from 2 to 32, before any refinement runs." },
  { id: "scheduler", tag: "New", label: "Scheduler", meta: "Groups frames by budget", detail: "Packs frames with similar step counts so the GPU isn’t idling on frames that already finished." },
  { id: "refine", tag: "Modified", label: "Refinement loop", meta: "Triton kernel · 2–32 steps", detail: "The base model’s denoiser, run with a per-frame stop mask. Finished frames drop out of the batch." },
  { id: "vocoder", tag: "Unchanged", label: "Vocoder", meta: "Mel → 24 kHz audio", detail: "Unchanged. Adaptive inference ends before audio is synthesised." },
] as const;

export type TeamMember = {
  name: string;
  role: string;
  /** Mono line under the role. */
  focus: string;
  bio: string;
  /** Path under /public, e.g. "/team/jane.jpg". Leave out for a placeholder frame. */
  photo?: string;
};

/** About us. Every entry is a placeholder until the team is public. */
export const TEAM: TeamMember[] = [
  {
    name: "Team member",
    role: "Research lead",
    focus: "Modeling · step prediction",
    bio: "Leads the step predictor and the training recipe behind it, and spends most days deciding what makes a frame hard. Placeholder bio: replace with background, prior work and a line about life outside the lab.",
  },
  {
    name: "Team member",
    role: "Systems engineer",
    focus: "Triton · GPU scheduling",
    bio: "Turns skipped steps into real milliseconds: kernels, batching and the scheduler that keeps the GPU busy. Placeholder bio: replace with background, prior work and a line about life outside the lab.",
  },
  {
    name: "Team member",
    role: "Evaluation lead",
    focus: "Listening tests · metrics",
    bio: "Runs the listening tests and owns the method behind every number on this site. Placeholder bio: replace with background, prior work and a line about life outside the lab.",
  },
  {
    name: "Team member",
    role: "Research engineer",
    focus: "Data · infrastructure",
    bio: "Builds the data pipeline, the evaluation sets and the tooling that makes experiments repeatable. Placeholder bio: replace with background, prior work and a line about life outside the lab.",
  },
];

/** How the lab works. About us page. */
export const COMMITMENTS = [
  {
    title: "Every number traces to a method",
    body: "Each figure on this site comes from a documented measurement. If one doesn’t, it’s a bug and we fix it.",
  },
  {
    title: "Listeners before metrics",
    body: "A speedup only counts if people can’t hear the cost. Human listening tests gate every result we publish.",
  },
  {
    title: "Negative results get written up",
    body: "We publish what didn’t work, including the cases where adaptive inference still loses to full steps.",
  },
  {
    title: "Open by default",
    body: "Code, evaluation sets and the inference engine will be released alongside the paper.",
  },
] as const;

export type Post = {
  category: string;
  /** Group byline. */
  authors: string;
  date: string;
  readTime: string;
  title: string;
  summary: string;
};

export const POSTS: Post[] = [
  {
    category: "Systems",
    authors: "Systems group",
    date: "Sep 18, 2026",
    readTime: "9 min",
    title: "From fewer steps to faster wall-clock",
    summary:
      "Why skipped compute doesn’t automatically become saved milliseconds, and where Triton kernels and GPU-aware scheduling actually help.",
  },
  {
    category: "Method",
    authors: "Modeling group",
    date: "Aug 27, 2026",
    readTime: "7 min",
    title: "Predicting step counts per frame",
    summary:
      "A lightweight predictor that decides how many refinement steps each frame needs before any of them are spent.",
  },
  {
    category: "Analysis",
    authors: "Modeling group",
    date: "Jul 30, 2026",
    readTime: "11 min",
    title: "Not every frame is equally hard",
    summary:
      "Measuring where a fixed step schedule over-spends compute, and where it can’t afford to cut back.",
  },
  {
    category: "Evaluation",
    authors: "Evaluation group",
    date: "Jun 12, 2026",
    readTime: "6 min",
    title: "Benchmarking step reduction fairly",
    summary:
      "Comparing adaptive inference with distillation and uniform step cuts at matched quality, not just matched speed.",
  },
];

/** How every number on the site is produced. Benchmarks page, #method. */
export const METHOD = [
  {
    label: "Test set",
    summary: "1,200 utterances across four evaluation sets, median 5.6 s.",
    detail:
      "LibriTTS-R test-clean, VCTK, Expresso and an in-house numbers-and-names set, sampled to 300 utterances each. No utterance appears in predictor training data.",
  },
  {
    label: "Listening test",
    summary: "MOS and blind A/B preference, 40 listeners.",
    detail:
      "Listeners rate 120 utterances per method on a 5-point scale, in randomised order with hidden references and attention checks. Intervals are 95% bootstrap over listeners and utterances.",
  },
  {
    label: "Intelligibility",
    summary: "WER from an off-the-shelf ASR model, split by text domain.",
    detail:
      "The same ASR model and text normaliser for every method, so differences come from the audio, not the transcript pipeline. Numbers and names are scored after normalisation.",
  },
  {
    label: "Latency",
    summary: "Wall-clock per utterance, one GPU, predictor included.",
    detail:
      "Median and p95 over the full test set after 50 warm-up runs, from text in to mel out. The vocoder is excluded because it is identical for every method.",
  },
  {
    label: "Baselines",
    summary: "Same base model and weights for every row.",
    detail:
      "Uniform reduction runs the base model at 8 steps. Step distillation trains an 8-step student from the same teacher. The full-step model is the unmodified 32-step reference.",
  },
] as const;

// ------------------------------------------------------------------
// Architecture breakdown: the home page's tabbed section. Every figure
// is derived from the constants above, so the tabs can't drift from the
// leaderboard, findings or metrics strip.
// ------------------------------------------------------------------

const ADAPTIVE_ROW = LEADERBOARD.find((r) => r.method === "Adaptive TTS")!;
const FULL_ROW = LEADERBOARD.find((r) => r.method === "Full steps")!;
const ms = (v: string) => Number.parseFloat(v);

export type ArchitectureModule = {
  id: "predictor" | "routing" | "guard";
  label: string;
  /** Pipeline stage this module corresponds to. */
  stage: string;
  /** One line under the tab label. */
  meta: string;
  summary: string;
  stats: { label: string; value: string; note: string }[];
  chart: {
    title: string;
    /** Upper bound of the bar scale. */
    max: number;
    rows: { label: string; value: number; display: string; key?: boolean }[];
    note: string;
  };
  specs: { label: string; value: string }[];
};

export const ARCHITECTURE: ArchitectureModule[] = [
  {
    id: "predictor",
    label: "Phoneme complexity predictor",
    stage: "New · Stage 02",
    meta: "Step count per frame, before refinement",
    summary:
      "A small convolutional head reads the text encoder’s phoneme states and predicts how many refinement steps each frame needs, from 2 to 32, before any of them run.",
    stats: [
      { label: "Parameters", value: PREDICTOR.params, note: "Under 0.5% of the base model" },
      { label: "Overhead", value: `${PREDICTOR.overheadMs} ms`, note: "Per utterance, in every latency figure" },
      { label: "Under-predicted", value: PREDICTOR_STATS[0].value, note: "The error that costs quality" },
    ],
    chart: {
      title: "Mean steps per frame, by segment class",
      max: STEP_BUDGET.fixed,
      rows: SEGMENT_CLASSES.map((c, i) => ({
        label: c.name,
        value: c.steps,
        display: c.steps.toFixed(1),
        key: i === SEGMENT_CLASSES.length - 1,
      })),
      note: `Out of the ${STEP_BUDGET.fixed}-step budget. Silence is a quarter of the audio and under a tenth of the compute.`,
    },
    specs: [
      { label: "Input", value: "Phoneme hidden states from the text encoder" },
      { label: "Output", value: `Integer step count per frame, 2–${STEP_BUDGET.fixed}` },
      { label: "Loss", value: "Under-prediction penalised 4× over-prediction" },
      { label: "Training", value: `~${PREDICTOR.trainGpuHours} GPU-h against a per-frame oracle` },
    ],
  },
  {
    id: "routing",
    label: "Dynamic compute routing",
    stage: "New · Stage 03",
    meta: "Frames grouped by predicted budget",
    summary:
      "The scheduler packs frames with similar step budgets into the same batch, so the GPU isn’t idling on frames that have already finished refining.",
    stats: [
      {
        label: "Mean steps",
        value: `${STEP_BUDGET.adaptiveMean}/${STEP_BUDGET.fixed}`,
        note: "Per frame, across the test set",
      },
      {
        label: "Steps skipped",
        value: `${Math.round((1 - STEP_BUDGET.adaptiveMean / STEP_BUDGET.fixed) * 100)}%`,
        note: "Refinement steps that never run",
      },
      {
        label: "At batch 64",
        value: `${BATCH_SPEEDUP[BATCH_SPEEDUP.length - 1].speedup.toFixed(1)}×`,
        note: "The open systems problem",
      },
    ],
    chart: {
      title: "Wall-clock speedup, by batch size",
      max: 3.5,
      rows: BATCH_SPEEDUP.map((b, i) => ({
        label: `Batch ${b.batch}`,
        value: b.speedup,
        display: `${b.speedup.toFixed(1)}×`,
        key: i === 0,
      })),
      note: "A batch waits for its hardest frame. Regrouping by predicted budget recovers part of the loss.",
    },
    specs: [
      { label: "Grouping", value: "Frames bucketed by predicted step count" },
      { label: "Kernel", value: "Triton, with a per-frame stop mask" },
      { label: "Batch sizes", value: BATCH_SPEEDUP.map((b) => b.batch).join(", ") },
      { label: "Baseline", value: "Same base model and weights for every method" },
    ],
  },
  {
    id: "guard",
    label: "Real-time latency guard",
    stage: "Modified · Stage 04",
    meta: "Per-frame stop mask, hard step cap",
    summary: `Each frame stops at its predicted count and drops out of the batch. A hard cap at the full ${STEP_BUDGET.fixed}-step budget means no frame ever runs more steps than the base model would.`,
    stats: [
      { label: "Latency p50", value: ADAPTIVE_ROW.latency, note: `vs. ${FULL_ROW.latency} at full steps` },
      { label: "Latency p95", value: ADAPTIVE_ROW.detail.latencyP95, note: `vs. ${FULL_ROW.detail.latencyP95} at full steps` },
      { label: "Real-time factor", value: ADAPTIVE_ROW.detail.rtf, note: "Seconds of compute per second of audio" },
    ],
    chart: {
      title: "Latency per utterance, one GPU",
      max: ms(FULL_ROW.detail.latencyP95),
      rows: [
        { label: "Adaptive · p50", value: ms(ADAPTIVE_ROW.latency), display: ADAPTIVE_ROW.latency, key: true },
        { label: "Adaptive · p95", value: ms(ADAPTIVE_ROW.detail.latencyP95), display: ADAPTIVE_ROW.detail.latencyP95 },
        { label: "Full steps · p50", value: ms(FULL_ROW.latency), display: FULL_ROW.latency },
        { label: "Full steps · p95", value: ms(FULL_ROW.detail.latencyP95), display: FULL_ROW.detail.latencyP95 },
      ],
      note: "Text in to mel out, after 50 warm-up runs. The vocoder is identical for every method and excluded.",
    },
    specs: [
      { label: "Step cap", value: `${STEP_BUDGET.fixed} per frame, the full budget` },
      { label: "Stop rule", value: "Finished frames leave the batch immediately" },
      { label: "Predictor", value: `${PREDICTOR.overheadMs} ms, included in every figure` },
      { label: "Hardware", value: "Single GPU, batch 1" },
    ],
  },
];
