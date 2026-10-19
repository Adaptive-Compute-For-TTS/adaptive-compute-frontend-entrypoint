export const EXPERIMENT_CATEGORIES = [
  "all",
  "short",
  "medium",
  "long",
] as const;

export type ExperimentCategory = (typeof EXPERIMENT_CATEGORIES)[number];

export type ExperimentMetric =
  | "sim_ref"
  | "sim_hi_nfe"
  | "wer"
  | "wer_heard"
  | "cer"
  | "truncated"
  | "failed"
  | "rtf"
  | "latency_ms";

export type SummaryByNfeRow = {
  run_id: string;
  category: ExperimentCategory;
  nfe: number;
  metric: ExperimentMetric;
  n: number;
  mean: number;
  ci_low: number | null;
  ci_high: number | null;
};

export type PairedDeltaRow = {
  run_id: string;
  category: ExperimentCategory;
  nfe: number;
  vs_nfe: number;
  metric: ExperimentMetric;
  n: number;
  mean_delta: number;
  ci_low: number | null;
  ci_high: number | null;
  ci_excludes_zero: boolean;
};

export type LatencyFitRow = {
  run_id: string;
  category: ExperimentCategory;
  metric: "latency_ms" | "rtf";
  n: number;
  intercept: number;
  intercept_ci_low: number;
  intercept_ci_high: number;
  per_nfe: number;
  per_nfe_ci_low: number;
  per_nfe_ci_high: number;
  r2: number;
};

export type ExperimentClip = {
  run_id: string;
  prompt_id: string;
  category: Exclude<ExperimentCategory, "all">;
  nfe: number;
  seed: string;
  sim_ref: number | null;
  sim_hi_nfe: number | null;
  wer: number;
  wer_heard: number | null;
  cer: number;
  missing_end_words: number;
  latency_ms: number;
  rtf: number;
  duration_s: number | null;
  hi_nfe: number;
  wav: string;
  error: string;
};

export type ExperimentDataset = {
  clips: ExperimentClip[];
  summary_by_nfe: SummaryByNfeRow[];
  paired_deltas: PairedDeltaRow[];
  latency_fit: LatencyFitRow[];
};

export type ExperimentSliceOverview = {
  runId: string;
  category: ExperimentCategory;
  clipCount: number;
  promptCount: number;
};

export type ExperimentAnalysisData = {
  summaryByNfe: readonly SummaryByNfeRow[];
  pairedDeltas: readonly PairedDeltaRow[];
  latencyFits: readonly LatencyFitRow[];
  overview: readonly ExperimentSliceOverview[];
  runIds: readonly string[];
};
