import type {
  ArtifactReference,
  BenchmarkPromptSnapshot,
  ResearchRun,
} from "./contracts";

const MOCK_PROMPT: BenchmarkPromptSnapshot = {
  id: "mock-prompt-medium-01",
  text: "The research team compared several inference settings using the same carefully controlled sentence.",
  language: "EN",
  length: "medium",
  categories: ["mock", "declarative", "benchmark-preview"],
  benchmarkSet: {
    name: "Mock benchmark prompts",
    version: "preview-1",
  },
};

function createCompletedMockRun({
  nfe,
  latencyMs,
  wer,
  similarity,
  createdAt,
}: {
  nfe: number;
  latencyMs: number;
  wer: number;
  similarity: number;
  createdAt: string;
}): ResearchRun {
  const outputAudio: ArtifactReference = {
    id: `mock-audio-nfe-${nfe}`,
    kind: "generated-audio",
    uri: `mock://generated-audio/nfe-${nfe}.wav`,
    filename: `mock-nfe-${nfe}.wav`,
    mimeType: "audio/wav",
  };

  return {
    schemaVersion: 1,
    id: `mock-run-nfe-${nfe}`,
    experimentId: "mock-fixed-nfe-sweep",
    name: `Mock · Fixed NFE ${nfe}`,
    status: "completed",
    createdAt,
    completedAt: createdAt,
    prompt: MOCK_PROMPT,
    configuration: {
      modelName: "dots-studio/dots.tts-base",
      modelRevision: "mock-revision-not-real",
      seed: 42,
      precision: "bfloat16",
      schedule: {
        kind: "fixed",
        nfe,
      },
      parameters: {
        guidanceScale: 1.0,
        normalizeText: false,
      },
    },
    generation: {
      outputAudio,
      sampleRateHz: 48_000,
      durationSeconds: 5.6,
    },
    metrics: {
      latency: {
        totalMs: latencyMs,
        realTimeFactor: latencyMs / 5_600,
        repetitions: 10,
        warmupRuns: 2,
        batchSize: 1,
        measurementMethod: "Illustrative mock timing",
      },
      wer: {
        value: wer,
        referenceTranscript: MOCK_PROMPT.text,
        asrTranscript: MOCK_PROMPT.text,
        evaluator: "mock-asr",
        evaluatorVersion: "preview",
      },
      speakerSimilarity: {
        value: similarity,
        evaluator: "mock-speaker-encoder",
        evaluatorVersion: "preview",
      },
    },
    telemetry: {
      deviceName: "Mock GPU",
      cudaVersion: "mock",
      totalGpuTimeMs: latencyMs * 0.82,
      kernelLaunchCount: 100 + nfe * 8,
      peakMemoryBytes: 8_589_934_592,
      perNfe: [
        {
          nfe,
          gpuTimeMs: latencyMs * 0.82,
          kernelLaunchCount: 100 + nfe * 8,
          peakMemoryBytes: 8_589_934_592,
        },
      ],
    },
    testing: {
      benchmarkName: "Mock benchmark prompts",
      benchmarkVersion: "preview-1",
      expectedTranscript: MOCK_PROMPT.text,
      observedTranscript: MOCK_PROMPT.text,
      passed: true,
      notes: ["Illustrative data only; no model inference was performed."],
    },
    traceAnalysis: {
      importantTensors: ["mock.latent_state"],
      repeatedOperations: ["mock.flow_step"],
      invariants: ["Mock prompt and seed remain fixed across the sweep."],
      reusableState: ["mock.text_encoding"],
    },
    artifacts: [
      outputAudio,
      {
        id: `mock-config-nfe-${nfe}`,
        kind: "config",
        uri: `mock://configs/nfe-${nfe}.json`,
        filename: `mock-nfe-${nfe}.json`,
        mimeType: "application/json",
      },
      {
        id: `mock-trace-nfe-${nfe}`,
        kind: "trace",
        uri: `mock://traces/nfe-${nfe}.json`,
        filename: `mock-trace-nfe-${nfe}.json`,
        mimeType: "application/json",
      },
    ],
    provenance: {
      repository:
        "https://github.com/Adaptive-Compute-For-TTS/adaptive-compute-frontend-entrypoint",
      commitSha: "mock-commit-not-real",
      branch: "mock-data",
      command: `mock-inference --nfe ${nfe}`,
      createdBy: "frontend mock fixture",
    },
    notes: ["All values in this run are illustrative mock data."],
  };
}

const MOCK_RUNNING_RUN: ResearchRun = {
  schemaVersion: 1,
  id: "mock-run-nfe-16",
  experimentId: "mock-fixed-nfe-sweep",
  name: "Mock · Fixed NFE 16",
  status: "running",
  createdAt: "2026-10-16T14:08:00.000Z",
  prompt: MOCK_PROMPT,
  configuration: {
    modelName: "dots-studio/dots.tts-base",
    modelRevision: "mock-revision-not-real",
    seed: 42,
    precision: "bfloat16",
    schedule: {
      kind: "fixed",
      nfe: 16,
    },
    parameters: {
      guidanceScale: 1.0,
      normalizeText: false,
    },
  },
  generation: {},
  artifacts: [],
  provenance: {
    repository:
      "https://github.com/Adaptive-Compute-For-TTS/adaptive-compute-frontend-entrypoint",
    commitSha: "mock-commit-not-real",
    branch: "mock-data",
    command: "mock-inference --nfe 16",
    createdBy: "frontend mock fixture",
  },
  notes: ["Illustrative running state; no process is actually running."],
};

export const MOCK_RESEARCH_RUNS: ResearchRun[] = [
  createCompletedMockRun({
    nfe: 4,
    latencyMs: 118,
    wer: 0.041,
    similarity: 0.742,
    createdAt: "2026-10-16T13:32:00.000Z",
  }),
  createCompletedMockRun({
    nfe: 8,
    latencyMs: 176,
    wer: 0.031,
    similarity: 0.781,
    createdAt: "2026-10-16T13:47:00.000Z",
  }),
  MOCK_RUNNING_RUN,
];

export function getMockResearchRun(runId: string) {
  return MOCK_RESEARCH_RUNS.find((run) => run.id === runId);
}
