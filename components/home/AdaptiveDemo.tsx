"use client";

import { LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { DEMO_DURATION, DEMO_SENTENCE, STEP_BUDGET } from "@/lib/content";
import { MODEL_STATUS } from "@/lib/site";
import {
  adaptiveSchedule,
  buildTimeline,
  describeFrame,
  fixedSchedule,
  stepsPerWord,
  stepsSpentAt,
  wordAtFrame,
  wordIndexAt,
} from "@/lib/speech";
import { useMockPlayback } from "@/lib/useMockPlayback";
import { Container } from "../Container";
import { Disclosure, PlusMinus } from "../Disclosure";
import { Section } from "../Section";
import { SectionHeader } from "../SectionHeader";
import { WaveformPlayer } from "../WaveformPlayer";

const FRAMES = 120;
const TIMELINE = buildTimeline(DEMO_SENTENCE);
const ease = [0.22, 1, 0.36, 1] as const;

const MODES = [
  {
    id: "fixed",
    label: "Fixed",
    note: `${STEP_BUDGET.fixed} steps on every frame`,
    schedule: fixedSchedule(FRAMES, STEP_BUDGET.fixed, STEP_BUDGET.fixed),
    speedup: 1,
  },
  {
    id: "adaptive",
    label: "Adaptive",
    note: "Steps predicted per frame",
    schedule: adaptiveSchedule(
      TIMELINE,
      FRAMES,
      STEP_BUDGET.adaptiveMean,
      STEP_BUDGET.fixed,
    ),
    speedup: STEP_BUDGET.speedup,
  },
] as const;

type ModeId = (typeof MODES)[number]["id"];

const FIXED_TOTAL = FRAMES * STEP_BUDGET.fixed;
const SAVED_PCT = Math.round((1 - STEP_BUDGET.adaptiveMean / STEP_BUDGET.fixed) * 100);
const fmt = (n: number) => n.toLocaleString("en-US");

/** Mean steps on frames that fall between words. */
function pauseMean(steps: number[]) {
  let sum = 0;
  let count = 0;
  steps.forEach((s, i) => {
    if (wordAtFrame(TIMELINE, steps.length, i) === null) {
      sum += s;
      count++;
    }
  });
  return count ? sum / count : 0;
}

export function AdaptiveDemo({ index }: { index?: number }) {
  const [modeId, setModeId] = useState<ModeId>("adaptive");
  const mode = MODES.find((m) => m.id === modeId)!;
  const { schedule } = mode;
  const { progress, playing, toggle, seek } = useMockPlayback(DEMO_DURATION);
  const current = wordIndexAt(TIMELINE.spans, progress);
  const idle = progress <= 0 || progress >= 1;
  const spent = stepsSpentAt(schedule.steps, progress);
  const saved = Math.round((1 - schedule.mean / STEP_BUDGET.fixed) * 100);

  const readout = [
    { label: "Steps / frame", value: schedule.mean.toFixed(1) },
    { label: "Steps spent", value: fmt(spent), of: `/${fmt(FIXED_TOTAL)}` },
    { label: "Compute saved", value: `${saved}%` },
    { label: "Wall-clock", value: `${mode.speedup.toFixed(1)}×` },
  ];

  const perWord = stepsPerWord(TIMELINE, schedule.steps);
  // Ranked by total compute: long, consonant-heavy words cost the most.
  const ranked = [...perWord].sort((a, b) => b.total - a.total);
  const most = ranked[0];
  const least = ranked[ranked.length - 1];
  const wordMax = most.total;

  return (
    <Section tone="night" id="demo" aria-labelledby="demo-title">
      <Container>
        <SectionHeader
          id="demo-title"
          index={index}
          label="Featured · Step budget"
          title="Same audio, a fraction of the compute."
          aside={`Each bar is one frame; its height is the refinement steps spent on it, up to the dashed ${STEP_BUDGET.fixed}-step budget. Adaptive spends ${SAVED_PCT}% fewer steps. Turning that into ${STEP_BUDGET.speedup.toFixed(1)}× wall-clock speedup is the systems half of the work.`}
        />

        <div className="mt-12 overflow-hidden border border-night-rule bg-night lg:mt-16">
          <fieldset>
            <legend className="sr-only">Step schedule</legend>
            <LayoutGroup id="demo-mode">
              <div className="grid grid-cols-2 gap-px border-b border-night-rule bg-night-rule">
                {MODES.map((m, i) => {
                  const selected = m.id === modeId;
                  return (
                    <label
                      key={m.id}
                      className={`group relative flex cursor-pointer flex-col gap-1 bg-night px-4 py-4 transition-colors duration-300 md:px-6 md:py-5 has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-4 has-[:focus-visible]:outline-night-ink ${
                        selected
                          ? "text-night-ink"
                          : "text-night-muted hover:bg-night-raised hover:text-night-ink"
                      }`}
                    >
                      <input
                        type="radio"
                        name="schedule"
                        value={m.id}
                        checked={selected}
                        onChange={() => setModeId(m.id)}
                        className="sr-only"
                      />
                      <span className="meta flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            selected ? "w-5 bg-night-accent" : "w-1.5 border border-current/50"
                          }`}
                        />
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-[1.0625rem] tracking-[-0.01em]">{m.label}</span>
                      <span className="text-[0.8125rem] leading-snug opacity-70">{m.note}</span>
                      {selected ? (
                        <motion.span
                          layoutId="demo-mode-bar"
                          aria-hidden="true"
                          className="absolute inset-x-0 bottom-0 h-px bg-night-ink"
                          transition={{ duration: 0.5, ease }}
                        />
                      ) : null}
                    </label>
                  );
                })}
              </div>
            </LayoutGroup>
          </fieldset>

          <div className="px-4 py-8 md:px-10 md:py-12">
            <p className="max-w-[32ch] text-lede">
              <span className="sr-only">{DEMO_SENTENCE}</span>
              {TIMELINE.words.map((word, i) => {
                const state =
                  !idle && i === current
                    ? "bg-night-mark text-night-ink"
                    : idle || i < current
                      ? "text-night-ink"
                      : "text-night-muted";
                return (
                  <span key={i} aria-hidden="true">
                    <span
                      className={`-mx-[0.12em] rounded-[3px] px-[0.12em] transition-colors duration-200 ${state}`}
                    >
                      {word}
                    </span>{" "}
                  </span>
                );
              })}
            </p>

            <WaveformPlayer
              className="mt-10 md:mt-14"
              align="bottom"
              ceiling
              bars={schedule.bars}
              duration={DEMO_DURATION}
              label={`sample with ${mode.label.toLowerCase()} schedule`}
              meta={[mode.label, `${FRAMES} frames`]}
              describe={(i) => describeFrame(TIMELINE, schedule.steps, i)}
              progress={progress}
              playing={playing}
              onToggle={toggle}
              onSeek={seek}
            />
          </div>

          <dl className="grid grid-cols-2 gap-px border-t border-night-rule bg-night-rule md:grid-cols-4">
            {readout.map((item) => (
              <div key={item.label} className="flex flex-col gap-1 bg-night px-4 py-4 md:px-6">
                <dt className="meta text-night-muted">{item.label}</dt>
                <dd className="font-mono text-xl tabular-nums md:text-2xl">
                  {item.value}
                  {item.of ? (
                    <span className="text-sm text-night-muted md:text-base">{item.of}</span>
                  ) : null}
                </dd>
              </div>
            ))}
          </dl>

          <Disclosure
            tone="night"
            rule="top"
            header={(open) => (
              <span className="flex items-center justify-between gap-4 px-4 py-4 md:px-6">
                <span className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
                  <span className="meta text-night-ink">Per-word breakdown</span>
                  <span className="text-[0.8125rem] text-night-muted">
                    Most compute: {most.word} ({fmt(most.total)} steps) · Least:{" "}
                    {least.word} ({fmt(least.total)}) · Pauses:{" "}
                    {pauseMean(schedule.steps).toFixed(1)} steps/frame
                  </span>
                </span>
                <PlusMinus open={open} className="text-night-muted transition-colors group-hover:text-night-ink" />
              </span>
            )}
          >
            <div className="border-t border-night-rule px-4 py-6 md:px-6 md:py-8">
              <ol className="grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                {perWord.map((w, i) => (
                  <li key={i} className="flex flex-col gap-1.5">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="truncate text-[0.9375rem]">{w.word}</span>
                      <span className="font-mono text-[0.8125rem] tabular-nums text-night-muted">
                        {fmt(w.total)}
                      </span>
                    </span>
                    <span aria-hidden="true" className="h-[3px] w-full bg-night-rule">
                      <motion.span
                        className="block h-full origin-left bg-night-ink"
                        initial={false}
                        animate={{ scaleX: w.total / wordMax }}
                        transition={{ duration: 0.6, ease }}
                      />
                    </span>
                  </li>
                ))}
              </ol>
              <p className="meta mt-6 text-night-muted">
                Total refinement steps spent inside each word · {mode.label} schedule ·
                Bars relative to the costliest word
              </p>
            </div>
          </Disclosure>
        </div>

        <div className="meta mt-6 flex flex-col gap-2 text-night-muted lg:flex-row lg:items-center lg:justify-between">
          <p className="flex items-baseline gap-3">
            <span
              aria-hidden="true"
              className="size-1.5 shrink-0 -translate-y-px animate-pulse-dot self-center rounded-full bg-night-accent"
            />
            Model {MODEL_STATUS.model} · last eval {MODEL_STATUS.lastEval}
          </p>
          <p>Illustrative schedule · simulated playback · hover a bar to inspect its frame</p>
        </div>
      </Container>
    </Section>
  );
}
