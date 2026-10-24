import type { ExperimentClip } from "./experimentDatasetContracts";

export type DemoRunCategory = "short" | "medium" | "long";
export type DemoRunStatus = "idle" | "running" | "complete" | "error";

/** Minimal contract shared with the frontend that owns the final dashboard. */
export type DemoRun = {
  run_id: string;
  prompt_id: string;
  prompt: string;
  category?: DemoRunCategory;
  nfe: number;
  status: DemoRunStatus;
  audio_url?: string;
  metrics?: {
    latency_ms?: number;
    rtf?: number;
    wer?: number;
    cer?: number;
    speaker_similarity?: number;
    peak_vram_mb?: number;
  };
  config?: {
    seed?: number;
    reference_audio?: string;
  };
};

export type DemoPrompt = {
  prompt: string;
  category?: DemoRunCategory;
};

export type DemoRunAdapterOptions = {
  /** Required because summary.json contains prompt IDs, not prompt text. */
  prompts: Readonly<Record<string, DemoPrompt>>;
  /** Base URL or public path containing the WAV filenames from summary.json. */
  audioBaseUrl?: string;
  /** Optional reference-audio URL shared by these generated clips. */
  referenceAudio?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNullableNumber(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function assertExperimentClip(value: unknown, index: number): asserts value is ExperimentClip {
  if (
    !isRecord(value) ||
    typeof value.run_id !== "string" ||
    typeof value.prompt_id !== "string" ||
    !["short", "medium", "long"].includes(String(value.category)) ||
    typeof value.nfe !== "number" ||
    typeof value.seed !== "string" ||
    !isNullableNumber(value.sim_ref) ||
    typeof value.wer !== "number" ||
    typeof value.cer !== "number" ||
    typeof value.latency_ms !== "number" ||
    typeof value.rtf !== "number" ||
    typeof value.wav !== "string" ||
    typeof value.error !== "string"
  ) {
    throw new Error(`Invalid experiment clip at clips[${index}].`);
  }
}

/** Parse the `clips` section from an untrusted summary.json payload. */
export function parseExperimentClips(payload: unknown): ExperimentClip[] {
  if (!isRecord(payload) || !Array.isArray(payload.clips)) {
    throw new Error("Expected an experiment payload with a clips array.");
  }

  payload.clips.forEach(assertExperimentClip);
  return payload.clips;
}

function resolveAudioUrl(filename: string, baseUrl?: string) {
  if (/^https?:\/\//.test(filename)) {
    return filename;
  }

  if (!baseUrl) {
    return undefined;
  }

  return `${baseUrl.replace(/\/$/, "")}/${filename.replace(/^\//, "")}`;
}

/** Convert one historical evaluation clip into the dashboard handoff contract. */
export function experimentClipToDemoRun(
  clip: ExperimentClip,
  options: DemoRunAdapterOptions,
): DemoRun {
  const prompt = options.prompts[clip.prompt_id];

  if (!prompt) {
    throw new Error(
      `Missing prompt text for ${clip.prompt_id}. Provide the benchmark prompt manifest before adapting this clip.`,
    );
  }

  const seed = Number(clip.seed);
  const audioUrl = resolveAudioUrl(clip.wav, options.audioBaseUrl);

  return {
    run_id: clip.run_id,
    prompt_id: clip.prompt_id,
    prompt: prompt.prompt,
    category: prompt.category ?? clip.category,
    nfe: clip.nfe,
    status: clip.error.trim() === "" ? "complete" : "error",
    ...(audioUrl ? { audio_url: audioUrl } : {}),
    metrics: {
      latency_ms: clip.latency_ms,
      rtf: clip.rtf,
      wer: clip.wer,
      cer: clip.cer,
      ...(clip.sim_ref === null
        ? {}
        : { speaker_similarity: clip.sim_ref }),
    },
    config: {
      ...(Number.isFinite(seed) ? { seed } : {}),
      ...(options.referenceAudio
        ? { reference_audio: options.referenceAudio }
        : {}),
    },
  };
}

/** Parse and adapt every clip in a summary.json payload. */
export function summaryJsonToDemoRuns(
  payload: unknown,
  options: DemoRunAdapterOptions,
) {
  return parseExperimentClips(payload).map((clip) =>
    experimentClipToDemoRun(clip, options),
  );
}

/** `run_id` groups a batch, so dashboard rows need this composite identity. */
export function demoRunKey(run: DemoRun) {
  return `${run.run_id}:${run.prompt_id}:nfe-${run.nfe}:seed-${run.config?.seed ?? "unknown"}`;
}
