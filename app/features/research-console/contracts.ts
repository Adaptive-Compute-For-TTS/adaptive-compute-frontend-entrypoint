export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonObject = { [key: string]: JsonValue };
export type IsoDateTime = string;
export type ResearchDataMode = "empty" | "mock" | "live";

export type ResearchRunStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export type ArtifactKind =
  | "generated-audio"
  | "reference-audio"
  | "config"
  | "plot"
  | "trace"
  | "log"
  | "transcript"
  | "other";

export type ArtifactReference = {
  id: string;
  kind: ArtifactKind;
  uri: string;
  filename: string;
  mimeType?: string;
  sizeBytes?: number;
  sha256?: string;
};

/** A frozen copy of the benchmark prompt used for this specific run. */
export type BenchmarkPromptSnapshot = {
  id: string;
  text: string;
  language: string;
  length: "short" | "medium" | "long" | "unknown";
  categories: string[];
  benchmarkSet?: {
    name: string;
    version: string;
  };
};

export type InferenceSchedule =
  | {
      kind: "fixed";
      nfe: number;
    }
  | {
      kind: "adaptive";
      minimumNfe: number;
      maximumNfe: number;
      meanNfe?: number;
    }
  | {
      kind: "custom";
      label: string;
      parameters: JsonObject;
    };

/** Exact settings required to reproduce model inference. */
export type RunConfiguration = {
  modelName: string;
  modelRevision?: string;
  checkpoint?: string;
  seed: number;
  precision?: string;
  schedule: InferenceSchedule;
  parameters: JsonObject;
};

export type GenerationArtifacts = {
  outputAudio?: ArtifactReference;
  referenceAudio?: ArtifactReference;
  referenceTranscript?: string;
  sampleRateHz?: number;
  durationSeconds?: number;
};

export type LatencyMetrics = {
  totalMs: number;
  firstChunkMs?: number;
  realTimeFactor?: number;
  repetitions?: number;
  warmupRuns?: number;
  batchSize?: number;
  measurementMethod?: string;
};

export type WordErrorRateMetric = {
  /** Store WER as a ratio: 0.029 means 2.9%. */
  value: number;
  referenceTranscript: string;
  asrTranscript: string;
  evaluator?: string;
  evaluatorVersion?: string;
};

export type SpeakerSimilarityMetric = {
  value: number;
  evaluator?: string;
  evaluatorVersion?: string;
};

export type RunMetrics = {
  latency?: LatencyMetrics;
  wer?: WordErrorRateMetric;
  speakerSimilarity?: SpeakerSimilarityMetric;
  additional?: Record<string, number | string | boolean | null>;
};

export type PerNfeGpuSample = {
  nfe: number;
  gpuTimeMs?: number;
  kernelLaunchCount?: number;
  peakMemoryBytes?: number;
};

export type GpuTelemetry = {
  deviceName: string;
  deviceIndex?: number;
  gpuCount?: number;
  driverVersion?: string;
  cudaVersion?: string;
  frameworkVersions?: Record<string, string>;
  totalGpuTimeMs?: number;
  kernelLaunchCount?: number;
  peakMemoryBytes?: number;
  perNfe?: PerNfeGpuSample[];
  additional?: JsonObject;
};

export type TestingInformation = {
  benchmarkName?: string;
  benchmarkVersion?: string;
  expectedTranscript?: string;
  observedTranscript?: string;
  passed?: boolean;
  notes?: string[];
};

export type TraceAnalysis = {
  importantTensors?: string[];
  repeatedOperations?: string[];
  invariants?: string[];
  reusableState?: string[];
  notes?: string[];
};

export type RunProvenance = {
  repository: string;
  commitSha: string;
  branch?: string;
  command?: string;
  createdBy?: string;
};

/**
 * Versioned handoff format shared by the frontend and experiment producers.
 * Runtime API data must still be validated before it is treated as this type.
 */
export type ResearchRun = {
  schemaVersion: 1;
  id: string;
  experimentId?: string;
  name?: string;
  status: ResearchRunStatus;
  createdAt: IsoDateTime;
  completedAt?: IsoDateTime;
  prompt: BenchmarkPromptSnapshot;
  configuration: RunConfiguration;
  generation: GenerationArtifacts;
  metrics?: RunMetrics;
  telemetry?: GpuTelemetry;
  testing?: TestingInformation;
  traceAnalysis?: TraceAnalysis;
  artifacts: ArtifactReference[];
  provenance: RunProvenance;
  notes?: string[];
};
