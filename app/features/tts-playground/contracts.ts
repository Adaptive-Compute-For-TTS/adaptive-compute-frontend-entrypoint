export const GENERATION_MODES = ["text-only", "voice-clone"] as const;

export type GenerationMode = (typeof GENERATION_MODES)[number];

export const LANGUAGE_OPTIONS = [
  { value: "auto_detect", label: "Auto detect" },
  { value: "EN", label: "English" },
  { value: "ZH", label: "Chinese" },
] as const;

export type TtsLanguage = (typeof LANGUAGE_OPTIONS)[number]["value"];

/**
 * Browser-side input collected by the public playground.
 *
 * The future API adapter will convert this into multipart FormData because
 * JSON cannot directly transport the reference audio File.
 */
export type TtsGenerationInput = {
  text: string;
  language: TtsLanguage;
  mode: GenerationMode;
  reference?: {
    audio: File;
    transcript: string;
  };
};

export type TtsGenerationStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export type TtsGenerationRecord = {
  id: string;
  status: TtsGenerationStatus;
  audioUrl: string | null;
  createdAt: string;
};

export type TtsGenerationResponse =
  | {
      ok: true;
      generation: TtsGenerationRecord;
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
      };
    };
