"use client";

import { motion } from "motion/react";
import { useState } from "react";
import { LEADERBOARD, STEP_BUDGET, type LeaderboardRow } from "@/lib/content";
import { ArrowLink } from "./ArrowLink";
import { Collapse, PlusMinus } from "./Disclosure";
import { MetaLabel } from "./MetaLabel";

const COLUMNS = [
  { key: "rank", label: "#", align: "left" },
  { key: "model", label: "Method", align: "left" },
  { key: "steps", label: "Steps", align: "right" },
  { key: "mos", label: "MOS ↑", align: "right" },
  { key: "wer", label: "WER ↓", align: "right" },
  { key: "latency", label: "Latency ↓", align: "right" },
  { key: "speedup", label: "Speedup ↑", align: "right" },
  { key: "toggle", label: "", align: "right" },
] as const;

// On narrow screens the table scrolls; rank and model stay pinned.
const STICKY = {
  rank: "w-10 sticky left-0 z-10 lg:static",
  model: "sticky left-10 z-10 border-r border-r-rule lg:static lg:border-r-0",
} as const;

const ease = [0.22, 1, 0.36, 1] as const;
/** Upper bound of the WER bars, in percent. */
const WER_SCALE = 7;

export function Leaderboard({
  captionId,
  showMethodLink = true,
}: {
  captionId: string;
  showMethodLink?: boolean;
}) {
  // The leading row opens by default so the depth is visible at a glance.
  const [open, setOpen] = useState<Set<string>>(() => new Set([LEADERBOARD[0].method]));
  const toggle = (method: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(method)) next.delete(method);
      else next.add(method);
      return next;
    });

  return (
    <div>
      <MetaLabel aria-hidden="true" className="mb-3 block lg:hidden">
        Swipe table → · Tap a method for details
      </MetaLabel>
      <div
        role="region"
        aria-labelledby={captionId}
        tabIndex={0}
        // relative: keeps absolutely positioned children (sr-only text) inside the scroller.
        className="relative overflow-x-auto"
      >
        <table className="w-full min-w-[42rem] border-collapse text-left">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`meta border-b border-ink bg-paper py-3 pr-4 font-normal whitespace-nowrap text-muted last:pr-2 ${
                    col.align === "right" ? "text-right" : ""
                  } ${STICKY[col.key as keyof typeof STICKY] ?? ""}`}
                >
                  {col.key === "toggle" ? <span className="sr-only">Details</span> : col.label}
                </th>
              ))}
            </tr>
          </thead>
          {LEADERBOARD.map((row, i) => (
            <Row
              key={row.method}
              row={row}
              lead={i === 0}
              open={open.has(row.method)}
              onToggle={() => toggle(row.method)}
            />
          ))}
        </table>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-12">
        <div className="flex flex-col gap-3 lg:col-span-7">
          <MetaLabel>Placeholder data</MetaLabel>
          <p className="max-w-measure text-[0.9375rem] leading-relaxed text-muted">
            Ranked by MOS among accelerated methods; the full {STEP_BUDGET.fixed}-step
            model is shown for reference. Steps are mean refinement steps per frame.
            MOS on a 5-point scale from 40 listeners × 120 utterances, with 95%
            intervals; WER from an off-the-shelf ASR model. Latency is wall-clock
            time per utterance on one GPU, including our step predictor. Speedup is
            relative to full steps.
          </p>
        </div>
        {showMethodLink ? (
          <div className="lg:col-span-5 lg:justify-self-end">
            <ArrowLink href="/benchmarks">Full benchmark and method</ArrowLink>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  row,
  lead,
  open,
  onToggle,
}: {
  row: LeaderboardRow;
  lead: boolean;
  open: boolean;
  onToggle: () => void;
}) {
  const panelId = `lb-${row.method.toLowerCase().replace(/\W+/g, "-")}`;
  // Cells carry the background so pinned columns cover scrolled content.
  const bg = lead
    ? "bg-accent"
    : open
      ? "bg-sunk"
      : "bg-paper transition-colors duration-300 group-hover/row:bg-paper-hover";
  const soft = lead ? "text-ink/70" : "text-muted";

  return (
    <tbody className="group/row font-mono tabular-nums">
      <tr
        className={`cursor-pointer ${open ? "" : "border-b border-rule"}`}
        // The method button is the accessible control; the row is a larger mouse target.
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          onToggle();
        }}
      >
        <td className={`${bg} py-5 pr-4 pl-2 text-sm ${soft} ${STICKY.rank}`}>
          {row.rank === null ? "Ref" : String(row.rank).padStart(2, "0")}
        </td>
        <th scope="row" className={`${bg} py-5 pr-4 font-sans font-normal ${STICKY.model}`}>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={onToggle}
            className="flex cursor-pointer items-center gap-3 text-left"
          >
            <span className="flex flex-col lg:flex-row lg:items-baseline lg:gap-3">
              <span className="text-lg tracking-[-0.01em] whitespace-nowrap transition-transform duration-500 ease-out-soft group-hover/row:translate-x-1">
                {row.method}
              </span>
              <span className={`meta whitespace-nowrap ${soft}`}>{row.note}</span>
            </span>
            <PlusMinus open={open} className={`lg:hidden ${soft}`} />
          </button>
        </th>
        <td className={`${bg} py-5 pr-4 text-right`}>{row.steps}</td>
        <td className={`${bg} py-5 pr-4 text-right`}>{row.mos}</td>
        <td className={`${bg} py-5 pr-4 text-right`}>{row.wer}</td>
        <td className={`${bg} py-5 pr-4 text-right`}>{row.latency}</td>
        <td className={`${bg} py-5 pr-4 text-right`}>{row.speedup}</td>
        <td className={`${bg} w-10 py-5 pr-2 text-right`}>
          <PlusMinus open={open} className={`hidden lg:inline-block ${soft} group-hover/row:text-ink`} />
        </td>
      </tr>
      <tr className={open ? "border-b border-rule" : ""}>
        <td colSpan={COLUMNS.length} className="p-0">
          <Collapse open={open} id={panelId}>
            {/* Pinned to the viewport on small screens so it never scrolls sideways. */}
            <div className="sticky left-0 max-w-[calc(100vw-3rem)] bg-sunk md:max-w-[calc(100vw-6rem)] lg:max-w-none">
              <RowDetail row={row} />
            </div>
          </Collapse>
        </td>
      </tr>
    </tbody>
  );
}

function RowDetail({ row }: { row: LeaderboardRow }) {
  const d = row.detail;
  const [min, p50, p95, max] = d.stepDist;
  const pct = (v: number) => `${(v / STEP_BUDGET.fixed) * 100}%`;

  return (
    <div className="grid gap-8 px-3 pt-6 pb-8 font-sans lg:grid-cols-12 lg:gap-10 lg:px-4">
      <div className="flex flex-col gap-4 lg:col-span-4">
        <MetaLabel>Reading</MetaLabel>
        <p className="text-[0.9375rem] leading-relaxed">{d.summary}</p>
        <p className="text-[0.8125rem] leading-snug text-muted">
          <span className="meta mr-2 text-ink">Cost</span>
          {d.extraCost}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <MetaLabel>Steps per frame</MetaLabel>
        <div className="relative mt-2 h-8" aria-hidden="true">
          <span className="absolute inset-x-0 top-1/2 h-px bg-rule" />
          {/* Whisker min→max, box p50→p95. Geometry is static; only scale animates. */}
          <motion.span
            className="absolute top-1/2 h-px origin-left bg-ink"
            style={{ left: pct(min), width: pct(max - min) }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.7, ease, delay: 0.1 }}
          />
          <span
            className="absolute top-1/2 h-3 -translate-y-1/2"
            style={{ left: `min(calc(100% - 2px), ${pct(p50)})`, width: `max(2px, ${pct(p95 - p50)})` }}
          >
            <motion.span
              className="block size-full origin-left bg-ink"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, ease, delay: 0.2 }}
            />
          </span>
          <span
            className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-ink"
            style={{ left: pct(min) }}
          />
          <span
            className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-ink"
            style={{ left: `min(calc(100% - 1px), ${pct(max)})` }}
          />
        </div>
        <div className="meta flex justify-between text-[0.6875rem] text-muted" aria-hidden="true">
          {[0, 8, 16, 24, 32].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <p className="font-mono text-[0.8125rem] tabular-nums">
          {min === max
            ? `${min} on every frame`
            : `min ${min} · p50 ${p50} · p95 ${p95} · max ${max}`}
        </p>
      </div>

      <div className="flex flex-col gap-4 lg:col-span-4">
        <MetaLabel>Breakdown</MetaLabel>
        <dl className="grid grid-cols-[1fr_auto] gap-x-6 gap-y-2 font-mono text-[0.8125rem] tabular-nums">
          <dt className="font-sans text-muted">MOS, 95% CI</dt>
          <dd className="text-right">
            {row.mos} {d.mosCi}
          </dd>
          <dt className="font-sans text-muted">Latency p50 / p95</dt>
          <dd className="text-right">
            {row.latency} / {d.latencyP95}
          </dd>
          <dt className="font-sans text-muted">Real-time factor</dt>
          <dd className="text-right">{d.rtf}</dd>
        </dl>
        <ul className="mt-2 flex flex-col gap-2.5">
          {d.werByDomain.map((w) => (
            <li key={w.domain} className="flex flex-col gap-1">
              <span className="flex justify-between text-[0.8125rem]">
                <span className="text-muted">WER · {w.domain}</span>
                <span className="font-mono tabular-nums">{w.value.toFixed(1)}%</span>
              </span>
              <span aria-hidden="true" className="h-[3px] bg-rule">
                <motion.span
                  className="block h-full origin-left bg-ink"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: w.value / WER_SCALE }}
                  transition={{ duration: 0.7, ease, delay: 0.15 }}
                />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
