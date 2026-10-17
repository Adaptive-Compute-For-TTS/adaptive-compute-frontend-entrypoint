"use client";

import { DEMO_DURATION, DEMO_SENTENCE, LEADERBOARD, STEP_BUDGET } from "@/lib/content";
import { adaptiveSchedule, buildTimeline, describeFrame, fixedSchedule } from "@/lib/speech";
import { Disclosure, PlusMinus } from "./Disclosure";
import { WaveformPlayer } from "./WaveformPlayer";

const FRAMES = 120;
const MAX = STEP_BUDGET.fixed;
const TIMELINE = buildTimeline(DEMO_SENTENCE);

const SAMPLES = [
  { method: "Full steps", schedule: fixedSchedule(FRAMES, MAX, MAX) },
  { method: "Uniform reduction", schedule: fixedSchedule(FRAMES, 8, MAX) },
  { method: "Step distillation", schedule: fixedSchedule(FRAMES, 8, MAX) },
  {
    method: "Adaptive TTS",
    schedule: adaptiveSchedule(TIMELINE, FRAMES, STEP_BUDGET.adaptiveMean, MAX),
  },
].map((s) => ({ ...s, row: LEADERBOARD.find((r) => r.method === s.method)! }));

const stepsLabel = (mean: number) =>
  `${Number.isInteger(mean) ? mean : mean.toFixed(1)} steps/frame`;

export function SampleList() {
  return (
    <ul className="border-t border-ink">
      {SAMPLES.map((s, i) => (
        <li key={s.method} className="border-b border-rule">
          <div className="pt-8 pb-6">
            <WaveformPlayer
              align="bottom"
              ceiling
              bars={s.schedule.bars}
              duration={DEMO_DURATION}
              label={`${s.method} sample`}
              meta={[`${String(i + 1).padStart(2, "0")} · ${s.method}`, stepsLabel(s.schedule.mean)]}
              describe={(f) => describeFrame(TIMELINE, s.schedule.steps, f)}
            />
          </div>
          <Disclosure
            rule="top"
            header={(open) => (
              <span className="meta flex items-center justify-between gap-4 py-3 text-muted transition-colors group-hover:text-ink">
                <span>
                  MOS {s.row.mos} · WER {s.row.wer} · {s.row.latency}
                </span>
                <span className="flex items-center gap-2">
                  {open ? "Hide" : "Details"}
                  <PlusMinus open={open} />
                </span>
              </span>
            )}
          >
            <div className="grid gap-6 pt-2 pb-8 md:grid-cols-12">
              <p className="text-[0.9375rem] leading-relaxed md:col-span-7">
                {s.row.detail.summary}
              </p>
              <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 font-mono text-[0.8125rem] tabular-nums md:col-span-4 md:col-start-9">
                <dt className="font-sans text-muted">MOS, 95% CI</dt>
                <dd className="text-right">
                  {s.row.mos} {s.row.detail.mosCi}
                </dd>
                <dt className="font-sans text-muted">Latency p50 / p95</dt>
                <dd className="text-right">
                  {s.row.latency} / {s.row.detail.latencyP95}
                </dd>
                <dt className="font-sans text-muted">Speedup</dt>
                <dd className="text-right">{s.row.speedup}</dd>
                <dt className="font-sans text-muted">Steps spent</dt>
                <dd className="text-right">{s.schedule.total.toLocaleString("en-US")}</dd>
              </dl>
            </div>
          </Disclosure>
        </li>
      ))}
    </ul>
  );
}
