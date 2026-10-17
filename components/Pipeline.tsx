"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useState } from "react";
import { PIPELINE } from "@/lib/content";
import { MetaLabel } from "./MetaLabel";

const ease = [0.22, 1, 0.36, 1] as const;
type StageId = (typeof PIPELINE)[number]["id"];

/**
 * Fig. 02: the inference pipeline. Hovering, focusing or tapping a stage
 * glides the marker to it and swaps in its detail.
 */
export function Pipeline() {
  const [active, setActive] = useState<StageId>("predictor");
  const stage = PIPELINE.find((s) => s.id === active)!;
  const index = PIPELINE.findIndex((s) => s.id === active);

  return (
    <figure className="flex flex-col gap-6">
      <LayoutGroup id="pipeline">
        <ol className="grid border-t border-ink md:grid-cols-5">
          {PIPELINE.map((s, i) => {
            const on = s.id === active;
            const ours = s.tag !== "Unchanged";
            return (
              <li
                key={s.id}
                className={`relative border-b border-rule md:border-b-0 ${i > 0 ? "md:border-l" : ""}`}
              >
                <button
                  type="button"
                  aria-pressed={on}
                  onMouseEnter={() => setActive(s.id)}
                  onFocus={() => setActive(s.id)}
                  onClick={() => setActive(s.id)}
                  className={`relative flex size-full cursor-pointer flex-col gap-2 px-3 py-5 text-left transition-colors duration-300 md:px-5 md:py-6 ${
                    on ? "bg-sunk" : "hover:bg-paper-hover"
                  }`}
                >
                  {on ? (
                    <motion.span
                      layoutId="pipeline-marker"
                      aria-hidden="true"
                      className="absolute inset-x-0 -top-px h-[3px] bg-ink"
                      transition={{ duration: 0.45, ease }}
                    />
                  ) : null}
                  <span className="meta flex items-center justify-between gap-2 text-muted">
                    <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    <span className={ours ? "text-ink" : ""}>{s.tag}</span>
                  </span>
                  <span
                    className={`text-xl tracking-[-0.02em] transition-colors duration-300 ${
                      ours || on ? "text-ink" : "text-ink/60"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="text-[0.8125rem] leading-snug text-muted">{s.meta}</span>
                  <span className="mt-1 text-[0.9375rem] leading-relaxed md:hidden">{s.detail}</span>
                  {i < PIPELINE.length - 1 ? (
                    <span
                      aria-hidden="true"
                      className="absolute top-1/2 -right-[0.4rem] z-10 hidden -translate-y-1/2 bg-paper text-[0.75rem] leading-none text-muted md:block"
                    >
                      →
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      </LayoutGroup>

      <div className="hidden gap-4 border-b border-rule pb-8 md:grid md:grid-cols-12 md:gap-6">
        <MetaLabel className="md:col-span-3">
          Stage {String(index + 1).padStart(2, "0")} of {PIPELINE.length}
        </MetaLabel>
        <div className="min-h-[5.5rem] md:col-span-9">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={stage.id}
              className="max-w-[52ch] text-xl leading-snug tracking-[-0.015em] md:text-2xl"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3, ease }}
            >
              {stage.detail}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <figcaption className="meta text-muted">
        Fig. 02 · Inference pipeline · New and modified stages in ink
      </figcaption>
    </figure>
  );
}
