import rawDataset from "@/summary.json";
import {
  EXPERIMENT_CATEGORIES,
  type ExperimentAnalysisData,
  type ExperimentCategory,
  type ExperimentDataset,
  type ExperimentSliceOverview,
} from "./experimentDatasetContracts";

function assertExperimentDataset(value: unknown): asserts value is ExperimentDataset {
  if (
    typeof value !== "object" ||
    value === null ||
    !("clips" in value) ||
    !("summary_by_nfe" in value) ||
    !("paired_deltas" in value) ||
    !("latency_fit" in value) ||
    !Array.isArray(value.clips) ||
    !Array.isArray(value.summary_by_nfe) ||
    !Array.isArray(value.paired_deltas) ||
    !Array.isArray(value.latency_fit)
  ) {
    throw new Error("summary.json does not match the experiment dataset shape.");
  }
}

function createOverview(dataset: ExperimentDataset) {
  const runIds = [...new Set(dataset.clips.map((clip) => clip.run_id))].sort();
  const overview: ExperimentSliceOverview[] = [];

  for (const runId of runIds) {
    const runClips = dataset.clips.filter((clip) => clip.run_id === runId);

    for (const category of EXPERIMENT_CATEGORIES) {
      const clips =
        category === "all"
          ? runClips
          : runClips.filter((clip) => clip.category === category);

      overview.push({
        runId,
        category: category satisfies ExperimentCategory,
        clipCount: clips.length,
        promptCount: new Set(clips.map((clip) => clip.prompt_id)).size,
      });
    }
  }

  return { overview, runIds };
}

const dataset: unknown = rawDataset;
assertExperimentDataset(dataset);

const { overview, runIds } = createOverview(dataset);

export const experimentDatasetRepository = {
  mode: "live" as const,
  async getAnalysisData(): Promise<ExperimentAnalysisData> {
    return {
      summaryByNfe: dataset.summary_by_nfe,
      pairedDeltas: dataset.paired_deltas,
      latencyFits: dataset.latency_fit,
      overview,
      runIds,
    };
  },
};
