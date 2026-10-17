"use client";

import { motion } from "motion/react";
import {
  BATCH_SPEEDUP,
  FAILURE_CASES,
  FINDINGS,
  PREDICTOR_STATS,
  PREFERENCE,
  SEGMENT_CLASSES,
  STEP_BUDGET,
  type Finding,
} from "@/lib/content";
import { Disclosure, PlusMinus } from "./Disclosure";

const ease = [0.22, 1, 0.36, 1] as const;

/** Horizontal bar that grows from the left when its panel opens. */
function Bar({
  value,
  className = "bg-ink",
  delay = 0,
}: {
  /** 0–1 */
  value: number;
  className?: string;
  delay?: number;
}) {
  return (
    <span aria-hidden="true" className="block h-2 w-full bg-rule/70">
      <motion.span
        className={`block h-full origin-left ${className}`}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: Math.min(1, value) }}
        transition={{ duration: 0.8, ease, delay }}
      />
    </span>
  );
}

/** Expandable list of analysis findings, each with its supporting data. */
export function Findings({
  defaultOpen = "segments",
  headingLevel = "h3",
}: {
  defaultOpen?: Finding["id"] | null;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <div className="border-t border-ink">
      {FINDINGS.map((f, i) => (
        <Disclosure
          key={f.id}
          headingLevel={headingLevel}
          defaultOpen={f.id === defaultOpen}
          header={(open) => (
            <span className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-3 py-7 lg:grid-cols-12 lg:gap-y-2 lg:py-9">
              <span className="meta col-span-2 flex gap-3 text-muted lg:col-span-3 lg:row-start-1 lg:pt-3">
                <span className="tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-ink">{f.label}</span>
              </span>
              <span className="text-2xl tracking-[-0.02em] transition-transform duration-500 ease-out-soft group-hover:translate-x-1 md:text-[1.75rem] md:leading-tight lg:col-span-5 lg:col-start-4 lg:row-start-1">
                {f.title}
              </span>
              <span className="flex flex-col items-end gap-1 text-right lg:col-span-3 lg:col-start-9 lg:row-span-2 lg:row-start-1">
                <span className="font-mono text-3xl tracking-[-0.03em] tabular-nums md:text-4xl">
                  {f.stat}
                </span>
                <span className="meta text-[0.6875rem] text-muted">{f.statLabel}</span>
              </span>
              <span className="col-span-2 max-w-[52ch] text-[0.9375rem] leading-relaxed text-muted lg:col-span-5 lg:col-start-4 lg:row-start-2">
                {f.takeaway}
              </span>
              <span className="col-span-2 flex justify-end lg:col-span-1 lg:col-start-12 lg:row-span-2 lg:row-start-1 lg:self-center">
                <span className="meta flex items-center gap-2 text-muted transition-colors group-hover:text-ink">
                  <span className="lg:sr-only">{open ? "Hide data" : "Show data"}</span>
                  <PlusMinus open={open} />
                </span>
              </span>
            </span>
          )}
        >
          <div className="pb-10 lg:grid lg:grid-cols-12 lg:gap-x-6">
            <div className="lg:col-span-9 lg:col-start-4">
              <FindingDetail id={f.id} />
            </div>
          </div>
        </Disclosure>
      ))}
    </div>
  );
}

function FindingDetail({ id }: { id: Finding["id"] }) {
  switch (id) {
    case "segments":
      return <Segments />;
    case "preference":
      return <Preference />;
    case "batching":
      return <Batching />;
    case "predictor":
      return <Predictor />;
    case "failures":
      return <Failures />;
    default:
      return null;
  }
}

function Note({ children }: { children: React.ReactNode }) {
  return <p className="mt-6 max-w-measure text-[0.875rem] leading-relaxed text-muted">{children}</p>;
}

const th = "meta border-b border-ink py-2 pr-4 font-normal text-muted last:pr-0";
const td = "border-b border-rule py-3 pr-4 last:pr-0";

function Segments() {
  const mean = SEGMENT_CLASSES.reduce((s, c) => s + c.frames * c.steps, 0);
  return (
    <>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-left">
          <caption className="sr-only">Steps per frame by acoustic segment class</caption>
          <thead>
            <tr>
              <th scope="col" className={th}>Segment</th>
              <th scope="col" className={`${th} text-right`}>Frames</th>
              <th scope="col" className={`${th} w-[38%]`}>Steps / frame</th>
              <th scope="col" className={`${th} text-right`}>Share of steps</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[0.875rem] tabular-nums">
            {SEGMENT_CLASSES.map((c, i) => (
              <tr key={c.name}>
                <th scope="row" className={`${td} font-sans text-[0.9375rem] font-normal`}>
                  {c.name}
                </th>
                <td className={`${td} text-right`}>{Math.round(c.frames * 100)}%</td>
                <td className={td}>
                  <span className="flex items-center gap-3">
                    <span className="flex-1">
                      <Bar value={c.steps / STEP_BUDGET.fixed} delay={i * 0.05} />
                    </span>
                    <span className="w-10 text-right">{c.steps.toFixed(1)}</span>
                  </span>
                </td>
                <td className={`${td} text-right`}>
                  {((c.frames * c.steps * 100) / mean).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Note>
        Bars are out of the {STEP_BUDGET.fixed}-step budget. Weighted across all frames the
        mean is {mean.toFixed(1)} steps. Silence is a quarter of the audio but under a tenth of
        the compute; plosive bursts are a tenth of the audio and a fifth of the compute.
      </Note>
    </>
  );
}

const PREF_KEYS = [
  { key: "ours", label: "Prefer adaptive", swatch: "bg-ink" },
  { key: "tie", label: "No preference", swatch: "bg-muted/50" },
  { key: "theirs", label: "Prefer other", swatch: "bg-accent" },
] as const;

function Preference() {
  return (
    <>
      <ul className="flex flex-col gap-6">
        {PREFERENCE.map((p, i) => (
          <li key={p.versus} className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between gap-4">
              <span className="text-[0.9375rem]">Adaptive vs. {p.versus}</span>
              <span className="font-mono text-[0.8125rem] text-muted tabular-nums">
                {p.ours} / {p.tie} / {p.theirs}
              </span>
            </span>
            <motion.span
              aria-hidden="true"
              className="flex h-3 origin-left overflow-hidden rounded-[2px]"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, ease, delay: i * 0.08 }}
            >
              {PREF_KEYS.map((k) => (
                <span key={k.key} className={k.swatch} style={{ width: `${p[k.key]}%` }} />
              ))}
            </motion.span>
            <span className="sr-only">
              {p.ours}% prefer adaptive, {p.tie}% no preference, {p.theirs}% prefer {p.versus}.
            </span>
          </li>
        ))}
      </ul>
      <ul className="meta mt-6 flex flex-wrap gap-x-6 gap-y-2 text-muted" aria-hidden="true">
        {PREF_KEYS.map((k) => (
          <li key={k.key} className="flex items-center gap-2">
            <span className={`inline-block size-2 rounded-[1px] ${k.swatch}`} />
            {k.label}
          </li>
        ))}
      </ul>
      <Note>
        Blind A/B, order randomised, 40 listeners × 120 pairs per comparison. Against full
        steps the split is close to even, which is the result we want: the cut in compute
        is not audible to most listeners.
      </Note>
    </>
  );
}

function Batching() {
  const top = 3.5;
  return (
    <>
      <ul className="flex flex-col gap-4">
        {BATCH_SPEEDUP.map((b, i) => (
          <li key={b.batch} className="grid grid-cols-[5.5rem_1fr_3.5rem] items-center gap-4">
            <span className="meta text-muted">Batch {b.batch}</span>
            <span className="relative block">
              <Bar value={b.speedup / top} delay={i * 0.06} />
              {/* 1.0× reference: no speedup. */}
              <span
                aria-hidden="true"
                className="absolute -top-1 -bottom-1 w-px border-l border-dashed border-muted"
                style={{ left: `${(1 / top) * 100}%` }}
              />
            </span>
            <span className="text-right font-mono text-[0.9375rem] tabular-nums">
              {b.speedup.toFixed(1)}×
            </span>
          </li>
        ))}
      </ul>
      <p className="meta mt-3 pl-[6.5rem] text-[0.6875rem] text-muted">Dashed line: 1.0×, no speedup</p>
      <Note>
        Frames in a batch finish at different steps, and the kernel waits for the slowest.
        The scheduler regroups frames by predicted budget, which recovers some of the loss;
        closing the rest is the main systems problem we are working on.
      </Note>
    </>
  );
}

function Predictor() {
  return (
    <>
      <dl className="grid gap-px overflow-hidden border border-rule bg-rule sm:grid-cols-2">
        {PREDICTOR_STATS.map((s) => (
          <div key={s.label} className="flex flex-col gap-2 bg-paper p-5">
            <dt className="meta text-muted">{s.label}</dt>
            <dd className="font-mono text-3xl tracking-[-0.03em] tabular-nums">{s.value}</dd>
            <dd className="text-[0.875rem] leading-snug text-muted">{s.note}</dd>
          </div>
        ))}
      </dl>
      <Note>
        The oracle is the smallest step count per frame whose output stays within 0.05 dB
        log-spectral distance of the full-step result. The training loss penalises
        under-prediction four times more than over-prediction.
      </Note>
    </>
  );
}

function Failures() {
  const worst = Math.max(...FAILURE_CASES.map((f) => Math.abs(f.delta)));
  return (
    <>
      <ul className="border-t border-ink">
        {FAILURE_CASES.map((f, i) => (
          <li
            key={f.case}
            className="grid gap-2 border-b border-rule py-4 md:grid-cols-[12rem_7rem_1fr] md:items-baseline md:gap-6"
          >
            <span className="text-[0.9375rem]">{f.case}</span>
            <span className="flex items-center gap-3">
              <span className="font-mono text-[0.9375rem] tabular-nums">
                −{Math.abs(f.delta).toFixed(2)}
              </span>
              <span className="w-12">
                <Bar value={Math.abs(f.delta) / worst} delay={i * 0.05} />
              </span>
            </span>
            <span className="text-[0.875rem] leading-snug text-muted">{f.why}</span>
          </li>
        ))}
      </ul>
      <Note>
        MOS change versus full steps on targeted subsets of 30 utterances each, so intervals
        are wide (about ±0.12). We publish these because they show where the predictor
        needs better signals, not just more data.
      </Note>
    </>
  );
}
