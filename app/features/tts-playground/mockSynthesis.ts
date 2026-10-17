import type {
  TtsGenerationInput,
  TtsGenerationResponse,
} from "./contracts";

const MOCK_DELAY_MS = 1_200;
const MOCK_ERROR_TEXT = "[mock-error]";

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

/**
 * Produces a short WAV tone so the audio-result UI can be tested without
 * bundling a fake speech sample or implying that dots.tts ran successfully.
 */
function createPlaceholderAudioUrl(text: string) {
  const sampleRate = 16_000;
  const durationSeconds = 1.5;
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const bytesPerSample = 2;
  const audioByteLength = sampleCount * bytesPerSample;
  const buffer = new ArrayBuffer(44 + audioByteLength);
  const view = new DataView(buffer);

  writeAscii(view, 0, "RIFF");
  view.setUint32(4, 36 + audioByteLength, true);
  writeAscii(view, 8, "WAVE");
  writeAscii(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeAscii(view, 36, "data");
  view.setUint32(40, audioByteLength, true);

  const frequency = 220 + (text.length % 5) * 35;

  for (let index = 0; index < sampleCount; index += 1) {
    const time = index / sampleRate;
    const envelope = Math.sin((Math.PI * index) / sampleCount);
    const signal =
      Math.sin(2 * Math.PI * frequency * time) +
      0.3 * Math.sin(2 * Math.PI * frequency * 1.5 * time);
    const sample = Math.max(-1, Math.min(1, signal * envelope * 0.12));

    view.setInt16(44 + index * bytesPerSample, sample * 0x7fff, true);
  }

  return URL.createObjectURL(new Blob([buffer], { type: "audio/wav" }));
}

export async function runMockSynthesis(
  input: TtsGenerationInput,
): Promise<TtsGenerationResponse> {
  await wait(MOCK_DELAY_MS);

  if (input.text.toLowerCase() === MOCK_ERROR_TEXT) {
    return {
      ok: false,
      error: {
        code: "MOCK_SYNTHESIS_FAILED",
        message: "This is a simulated inference failure.",
      },
    };
  }

  return {
    ok: true,
    generation: {
      id: `mock-${Date.now().toString(36)}`,
      status: "completed",
      audioUrl: createPlaceholderAudioUrl(input.text),
      createdAt: new Date().toISOString(),
    },
  };
}
