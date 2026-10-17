import type { ResearchDataMode, ResearchRun } from "./contracts";
import { getMockResearchRun, MOCK_RESEARCH_RUNS } from "./mockRuns";

export type ResearchRunRepository = {
  mode: Exclude<ResearchDataMode, "empty">;
  list(): Promise<readonly ResearchRun[]>;
  getById(runId: string): Promise<ResearchRun | undefined>;
};

const mockResearchRunRepository: ResearchRunRepository = {
  mode: "mock",
  async list() {
    return MOCK_RESEARCH_RUNS;
  },
  async getById(runId) {
    return getMockResearchRun(runId);
  },
};

/**
 * Server-side data boundary for the research console.
 * Replace this assignment with an API/database repository when available.
 */
export const researchRunRepository: ResearchRunRepository =
  mockResearchRunRepository;
