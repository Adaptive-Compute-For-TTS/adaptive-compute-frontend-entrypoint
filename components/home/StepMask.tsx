"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { STEP_BUDGET } from "@/lib/content";
import { adaptiveSchedule, buildTimeline, describeFrame, wordAtFrame } from "@/lib/speech";

const SENTENCE = "Turn left onto Station Road, then continue for four hundred metres.";
const FRAMES = 56;
/** Each row of cells stands for this many refinement steps. */
const STEPS_PER_ROW = 2;
const ROWS = STEP_BUDGET.fixed / STEPS_PER_ROW;
const CELL = 10;
const GAP = 2;
const PITCH = CELL + GAP;

const TIMELINE = buildTimeline(SENTENCE);
const SCHEDULE = adaptiveSchedule(TIMELINE, FRAMES, STEP_BUDGET.adaptiveMean, STEP_BUDGET.fixed);
const WIDTH = FRAMES * PITCH - GAP;
const HEIGHT = ROWS * PITCH - GAP;
const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Fig. 01: every refinement step the adaptive model ran (filled) or
 * skipped (faint) for one sentence. Columns are frames, rows are steps.
 */
export function StepMask() {
  const [hover, setHover] = useState<number | null>(null);
  const hoveredWord = hover === null ? null : wordAtFrame(TIMELINE, FRAMES, hover);

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    setHover(Math.min(FRAMES - 1, Math.max(0, Math.floor(x * FRAMES))));
  };

  return (
    <figure className="flex flex-col gap-4">
      <div className="meta flex items-baseline justify-between gap-4 text-muted">
        <span>Fig. 01 · Steps run per frame</span>
        <span className="tabular-nums">
          {SCHEDULE.mean.toFixed(1)} / {STEP_BUDGET.fixed} mean
        </span>
      </div>

      <div className="border-y border-rule py-5">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="block h-auto w-full touch-none"
          role="img"
          aria-label={`Step mask for “${SENTENCE}”: ${FRAMES} frames, between 2 and ${STEP_BUDGET.fixed} steps each, ${SCHEDULE.mean.toFixed(1)} on average.`}
          onPointerMove={onPointerMove}
          onPointerLeave={() => setHover(null)}
        >
          {SCHEDULE.steps.map((steps, col) => {
            const filled = Math.ceil(steps / STEPS_PER_ROW);
            const x = col * PITCH;
            const dim = hover !== null && hover !== col;
            return (
              <g key={col}>
                {/* Skipped steps: faint cells above the run. */}
                {Array.from({ length: ROWS - filled }, (_, r) => (
                  <rect
                    key={r}
                    x={x}
                    y={r * PITCH}
                    width={CELL}
                    height={CELL}
                    rx={1}
                    className="fill-ink/[0.06]"
                  />
                ))}
                {/* Entrance runs once; hover dimming is plain CSS on the inner group. */}
                <motion.g
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, ease, delay: 0.35 + col * 0.012 }}
                >
                  <g className={`transition-opacity duration-200 ${dim ? "opacity-30" : "opacity-100"}`}>
                    {Array.from({ length: filled }, (_, k) => (
                      <rect
                        key={k}
                        x={x}
                        y={(ROWS - 1 - k) * PITCH}
                        width={CELL}
                        height={CELL}
                        rx={1}
                        className="fill-ink"
                      />
                    ))}
                  </g>
                </motion.g>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="meta flex min-h-[1.4em] items-baseline justify-between gap-4">
        <span className="truncate text-ink">
          {hover === null
            ? "Hover a column to read one frame"
            : describeFrame(TIMELINE, SCHEDULE.steps, hover)}
        </span>
        <span className="hidden shrink-0 text-muted sm:inline">
          <span aria-hidden="true" className="mr-1.5 inline-block size-2 rounded-[1px] bg-ink align-[-1px]" />
          Run
          <span aria-hidden="true" className="mr-1.5 ml-4 inline-block size-2 rounded-[1px] bg-ink/10 align-[-1px]" />
          Skipped
        </span>
      </div>

      <figcaption className="flex flex-col gap-2">
        <span className="text-[0.9375rem] leading-relaxed text-muted">
          “
          {TIMELINE.words.map((word, i) => {
            const bare = word.replace(/[^A-Za-z0-9'’-]/g, "");
            const on = hoveredWord !== null && bare === hoveredWord;
            return (
              <span key={i}>
                <span className={`transition-colors duration-200 ${on ? "text-ink" : ""}`}>
                  {word}
                </span>
                {i < TIMELINE.words.length - 1 ? " " : ""}
              </span>
            );
          })}
          ”
        </span>
        <span className="meta text-muted">
          A full-step model fills every cell · Placeholder schedule
        </span>
      </figcaption>
    </figure>
  );
}
