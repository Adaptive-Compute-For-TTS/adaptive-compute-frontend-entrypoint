# DemoRun frontend handoff

This is the minimal dashboard contract for Sai's frontend. It deliberately does
not prescribe a second dashboard implementation.

## Contract

```ts
type DemoRun = {
  run_id: string;
  prompt_id: string;
  prompt: string;
  category?: "short" | "medium" | "long";
  nfe: number;
  status: "idle" | "running" | "complete" | "error";
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
```

The source of truth and adapter are in
`app/features/research-console/demoRunContract.ts`.

## UI mapping

| UI | Contract field |
| --- | --- |
| Prompt selector | `prompt_id`, `prompt`, `category` |
| NFE selector | `nfe` |
| Run-status badge | `status` |
| Audio player | `audio_url` |
| Latency card | `metrics.latency_ms` |
| Real-time-factor card | `metrics.rtf` |
| WER card | `metrics.wer` |
| CER card | `metrics.cer` |
| Speaker-similarity card | `metrics.speaker_similarity` |
| Peak-VRAM card | `metrics.peak_vram_mb` |
| Reproduction/config panel | `config.seed`, `config.reference_audio` |

## Adapter usage

```ts
import summary from "@/summary.json";
import {
  demoRunKey,
  summaryJsonToDemoRuns,
} from "@/app/features/research-console/demoRunContract";

const prompts = {
  p001: { prompt: "Prompt text supplied by the benchmark manifest", category: "short" },
} as const;

const runs = summaryJsonToDemoRuns(summary, {
  prompts,
  audioBaseUrl: "https://example.org/generated-audio/xvector_4090",
  referenceAudio: "https://example.org/reference.wav",
});

runs.map((run) => ({ key: demoRunKey(run), run }));
```

## Important source-data notes

- `summary.json` has 972 clip records and contains `prompt_id`, but not prompt
  text. The benchmark prompt manifest must be provided to the adapter.
- The source `run_id` identifies a batch such as `xvector_4090`; it is not a
  unique clip ID. Use `demoRunKey(run)` for list/render keys.
- The JSON provides WAV filenames, not hosted URLs. `audio_url` is omitted until
  an `audioBaseUrl` is supplied.
- `speaker_similarity` maps from `clips[].sim_ref`.
- Historical clips map to `complete`, or `error` when `clips[].error` is not
  empty. The execution service is responsible for emitting `idle` and `running`.
- `peak_vram_mb` and `reference_audio` are not present in the supplied summary.
  They remain absent until the telemetry and artifact services provide them.
- Missing optional values stay absent; the adapter does not invent defaults.

## Reusable pieces

- `DemoRun` and related TypeScript types
- `parseExperimentClips()` for runtime validation of the JSON clip section
- `experimentClipToDemoRun()` for individual records
- `summaryJsonToDemoRuns()` for the full dataset
- `demoRunKey()` for stable dashboard-row identity

No additional UI was created for this handoff. Sai can bind these fields to the
existing prompt selector, status badge, audio player, metric cards, and charts.
