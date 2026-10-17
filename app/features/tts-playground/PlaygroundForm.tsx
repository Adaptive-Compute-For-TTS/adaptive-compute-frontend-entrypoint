"use client";

import { type FormEvent, useEffect, useState } from "react";
import {
  LANGUAGE_OPTIONS,
  type GenerationMode,
  type TtsGenerationInput,
  type TtsGenerationResponse,
  type TtsLanguage,
} from "./contracts";
import { synthesizeSpeech } from "./synthesisClient";

const MAX_TEXT_LENGTH = 500;

export function PlaygroundForm() {
  const [mode, setMode] = useState<GenerationMode>("text-only");
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<TtsLanguage>("auto_detect");
  const [referenceAudio, setReferenceAudio] = useState<File | null>(null);
  const [referenceTranscript, setReferenceTranscript] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<TtsGenerationResponse | null>(null);

  useEffect(() => {
    const audioUrl = response?.ok ? response.generation.audioUrl : null;

    return () => {
      if (audioUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [response]);

  const voiceCloneIsValid =
    referenceAudio !== null && referenceTranscript.trim().length > 0;

  const canSubmit =
    text.trim().length > 0 &&
    (mode === "text-only" || voiceCloneIsValid);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    const input: TtsGenerationInput = {
      text: text.trim(),
      language,
      mode,
      ...(mode === "voice-clone" && referenceAudio
        ? {
            reference: {
              audio: referenceAudio,
              transcript: referenceTranscript.trim(),
            },
          }
        : {}),
    };

    setIsSubmitting(true);
    setResponse(null);

    try {
      setResponse(await synthesizeSpeech(input));
    } catch {
      setResponse({
        ok: false,
        error: {
          code: "SYNTHESIS_CLIENT_ERROR",
          message: "The synthesis client encountered an unexpected error.",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-8" onSubmit={handleSubmit}>
      <fieldset>
        <legend className="meta mb-3 text-muted">Generation mode</legend>

        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`cursor-pointer border p-4 transition-colors ${
              mode === "text-only"
                ? "border-ink bg-sunk"
                : "border-rule hover:border-ink/40"
            }`}
          >
            <input
              type="radio"
              name="generation-mode"
              value="text-only"
              checked={mode === "text-only"}
              onChange={() => {
                setMode("text-only");
                setResponse(null);
              }}
              className="sr-only"
            />

            <span className="block font-medium">Text only</span>
            <span className="mt-1 block text-sm text-muted">
              Generate speech using the model&apos;s default voice behavior.
            </span>
          </label>

          <label
            className={`cursor-pointer border p-4 transition-colors ${
              mode === "voice-clone"
                ? "border-ink bg-sunk"
                : "border-rule hover:border-ink/40"
            }`}
          >
            <input
              type="radio"
              name="generation-mode"
              value="voice-clone"
              checked={mode === "voice-clone"}
              onChange={() => {
                setMode("voice-clone");
                setResponse(null);
              }}
              className="sr-only"
            />

            <span className="block font-medium">Reference voice</span>
            <span className="mt-1 block text-sm text-muted">
              Guide the generated voice with a recording and transcript.
            </span>
          </label>
        </div>
      </fieldset>

      <div>
        <div className="mb-3 flex items-center justify-between gap-4">
          <label htmlFor="generation-text" className="meta text-muted">
            Text to generate
          </label>

          <span className="meta text-muted">
            {text.length}/{MAX_TEXT_LENGTH}
          </span>
        </div>

        <textarea
          id="generation-text"
          name="text"
          rows={6}
          maxLength={MAX_TEXT_LENGTH}
          required
          value={text}
          placeholder="Enter the sentence you want dots.tts to speak."
          onChange={(event) => {
            setText(event.target.value);
            setResponse(null);
          }}
          className="w-full resize-y border border-rule bg-transparent p-4 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
        />
      </div>

      <div>
        <label
          htmlFor="generation-language"
          className="meta mb-3 block text-muted"
        >
          Language
        </label>

        <select
          id="generation-language"
          name="language"
          value={language}
          onChange={(event) => {
            setLanguage(event.target.value as TtsLanguage);
            setResponse(null);
          }}
          className="w-full border border-rule bg-paper p-4 outline-none transition-colors focus:border-ink sm:max-w-xs"
        >
          {LANGUAGE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {mode === "voice-clone" ? (
        <div className="grid gap-6 border-l-2 border-accent-strong pl-5">
          <div>
            <label
              htmlFor="reference-audio"
              className="meta mb-3 block text-muted"
            >
              Reference audio
            </label>

            <input
              id="reference-audio"
              name="referenceAudio"
              type="file"
              accept=".wav,.mp3,.flac,audio/wav,audio/mpeg,audio/flac"
              required
              onChange={(event) => {
                setReferenceAudio(event.target.files?.[0] ?? null);
                setResponse(null);
              }}
              className="block w-full border border-rule p-4 text-sm file:mr-4 file:border-0 file:bg-ink file:px-4 file:py-2 file:text-paper"
            />

            <p className="mt-2 text-sm text-muted">
              Use a short, clear recording containing one speaker.
            </p>
          </div>

          <div>
            <label
              htmlFor="reference-transcript"
              className="meta mb-3 block text-muted"
            >
              Exact reference transcript
            </label>

            <textarea
              id="reference-transcript"
              name="referenceTranscript"
              rows={3}
              required
              value={referenceTranscript}
              placeholder="Write exactly what is spoken in the reference recording."
              onChange={(event) => {
                setReferenceTranscript(event.target.value);
                setResponse(null);
              }}
              className="w-full resize-y border border-rule bg-transparent p-4 text-base outline-none transition-colors placeholder:text-muted/60 focus:border-ink"
            />
          </div>
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-4 border-t border-rule pt-6 sm:flex-row sm:items-center">
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="bg-ink px-6 py-3 text-sm font-medium text-paper transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
        >
          {isSubmitting ? "Generating mock…" : "Generate speech"}
        </button>

        <p className="text-sm text-muted" aria-live="polite" role="status">
          {isSubmitting
            ? "Simulating model inference…"
            : response?.ok
              ? "Mock generation completed."
              : response
                ? response.error.message
                : "Mock adapter ready. Inference service not connected yet."}
        </p>
      </div>

      {response?.ok ? (
        <section
          aria-labelledby="mock-result-title"
          className="border border-rule bg-sunk p-5 sm:p-6"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="meta text-muted">Mock result</p>
              <h3 id="mock-result-title" className="mt-2 text-xl font-medium">
                Generated audio placeholder
              </h3>
            </div>

            <span className="meta border border-rule px-2 py-1 text-muted">
              {response.generation.status}
            </span>
          </div>

          {response.generation.audioUrl ? (
            <audio
              controls
              src={response.generation.audioUrl}
              aria-label="Mock generated audio placeholder"
              className="mt-6 w-full"
            />
          ) : null}

          <p className="mt-3 text-sm text-muted">
            This tone only tests the audio player. It is not dots.tts output.
          </p>

          <dl className="mt-6 grid gap-4 border-t border-rule pt-5 text-sm sm:grid-cols-2">
            <div>
              <dt className="meta text-muted">Run ID</dt>
              <dd className="mt-1 break-all font-mono">
                {response.generation.id}
              </dd>
            </div>
            <div>
              <dt className="meta text-muted">Created</dt>
              <dd className="mt-1">
                {new Date(response.generation.createdAt).toLocaleString()}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <p className="text-xs text-muted">
        Developer test: enter <code>[mock-error]</code> to simulate a failed
        request.
      </p>
    </form>
  );
}
