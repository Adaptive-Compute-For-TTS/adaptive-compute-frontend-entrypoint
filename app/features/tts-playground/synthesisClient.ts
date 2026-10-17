import type {
  TtsGenerationInput,
  TtsGenerationResponse,
} from "./contracts";
import { runMockSynthesis } from "./mockSynthesis";

/**
 * The UI depends on this interface instead of a specific inference backend.
 * A future HTTP client can implement the same contract without changing the
 * playground form.
 */
export type TtsSynthesisClient = {
  generate(input: TtsGenerationInput): Promise<TtsGenerationResponse>;
};

const mockSynthesisClient: TtsSynthesisClient = {
  generate: runMockSynthesis,
};

const activeSynthesisClient = mockSynthesisClient;

export function synthesizeSpeech(input: TtsGenerationInput) {
  return activeSynthesisClient.generate(input);
}
