"use client";

import { useMemo, useState } from "react";
import {
  EXPERIMENT_CATEGORIES,
  type ExperimentAnalysisData,
  type ExperimentCategory,
  type ExperimentMetric,
  type SummaryByNfeRow,
} from "./experimentDatasetContracts";

const MAIN_RUN_ID = "xvector_4090";
const BROKEN_RUN_ID = "orig_3090";
const CHART_WIDTH = 680;
const CHART_HEIGHT = 320;
const PADDING = { top: 24, right: 24, bottom: 48, left: 64 } as const;

type ChartDefinition = {
  metric: Extract<
    ExperimentMetric,
    "wer" | "wer_heard" | "sim_ref" | "truncated" | "rtf"
  >;
  title: string;
  description: string;
  valueLabel: string;
  fixedDomain?: readonly [number, number];
  zoomToData?: boolean;
  referenceValue?: number;
  format: (value: number) => string;
};

const CHARTS: readonly ChartDefinition[] = [
  {
    metric: "wer",
    title: "NFE vs word error rate",
    description: "Lower is better. Error bars show the 95% confidence interval.",
    valueLabel: "WER",
    fixedDomain: [0, 1],
    format: (value) => `${(value * 100).toFixed(0)}%`,
  },
  {
    metric: "sim_ref",
    title: "NFE vs speaker similarity",
    description:
      "Higher is better. The vertical scale is zoomed to make small differences visible.",
    valueLabel: "Similarity",
    zoomToData: true,
    format: (value) => value.toFixed(3),
  },
  {
    metric: "rtf",
    title: "NFE vs real-time factor",
    description: "Lower is faster. The dashed line marks real-time generation at RTF 1.",
    valueLabel: "RTF",
    referenceValue: 1,
    format: (value) => value.toFixed(1),
  },
] as const;

const SECONDARY_CHARTS: readonly ChartDefinition[] = [
  {
    metric: "wer_heard",
    title: "NFE vs WER on heard words",
    description:
      "Error rate on only the words spoken before a clip was cut off. Lower is better.",
    valueLabel: "WER heard",
    fixedDomain: [0, 1],
    format: (value) => `${(value * 100).toFixed(0)}%`,
  },
  {
    metric: "truncated",
    title: "NFE vs truncated clips",
    description:
      "Share of clips cut off before reaching the end of the prompt. Lower is better.",
    valueLabel: "Truncated",
    fixedDomain: [0, 1],
    format: (value) => `${(value * 100).toFixed(0)}%`,
  },
] as const;

function categoryLabel(category: ExperimentCategory) {
  return category === "all"
    ? "All prompt lengths"
    : `${category[0].toUpperCase()}${category.slice(1)} prompts`;
}

function range(count: number) {
  return Array.from({ length: count }, (_, index) => index);
}

function LineChart({ rows, definition }: { rows: SummaryByNfeRow[]; definition: ChartDefinition }) {
  const sortedRows = [...rows].sort((a, b) => a.nfe - b.nfe);
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const xMin = Math.min(...sortedRows.map((row) => row.nfe));
  const xMax = Math.max(...sortedRows.map((row) => row.nfe));
  const observedMax = Math.max(
    ...sortedRows.map((row) => row.ci_high ?? row.mean),
    definition.referenceValue ?? 0,
  );
  const observedMin = Math.min(
    ...sortedRows.map((row) => row.ci_low ?? row.mean),
    definition.referenceValue ?? Number.POSITIVE_INFINITY,
  );
  const observedRange = Math.max(0.001, observedMax - observedMin);
  const dynamicDomain: readonly [number, number] = definition.zoomToData
    ? [
        Math.max(0, observedMin - observedRange * 0.18),
        Math.min(1, observedMax + observedRange * 0.18),
      ]
    : [0, Math.max(1, observedMax * 1.12)];
  const [yMin, yMax] = definition.fixedDomain ?? dynamicDomain;
  const x = (value: number) =>
    PADDING.left + ((value - xMin) / Math.max(1, xMax - xMin)) * plotWidth;
  const y = (value: number) =>
    PADDING.top + (1 - (value - yMin) / Math.max(0.0001, yMax - yMin)) * plotHeight;
  const points = sortedRows.map((row) => `${x(row.nfe)},${y(row.mean)}`).join(" ");
  const ticks = range(5).map((index) => yMin + ((yMax - yMin) * index) / 4);

  return (
    <article className="border border-rule p-5">
      <h3 className="font-medium">{definition.title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{definition.description}</p>
      <div className="mt-5">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label={`${definition.title}, ${sortedRows.length} NFE values`}
        >
          {ticks.map((tick) => (
            <g key={tick}>
              <line
                x1={PADDING.left}
                x2={CHART_WIDTH - PADDING.right}
                y1={y(tick)}
                y2={y(tick)}
                stroke="var(--color-rule)"
              />
              <text
                x={PADDING.left - 10}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-muted)"
              >
                {definition.format(tick)}
              </text>
            </g>
          ))}

          {definition.referenceValue !== undefined ? (
            <g>
              <line
                x1={PADDING.left}
                x2={CHART_WIDTH - PADDING.right}
                y1={y(definition.referenceValue)}
                y2={y(definition.referenceValue)}
                stroke="var(--color-accent-strong)"
                strokeDasharray="6 5"
              />
              <text
                x={CHART_WIDTH - PADDING.right}
                y={y(definition.referenceValue) - 7}
                textAnchor="end"
                fontSize="11"
                fill="var(--color-muted)"
              >
                real time
              </text>
            </g>
          ) : null}

          <polyline
            points={points}
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />

          {sortedRows.map((row) => {
            const hasInterval = row.ci_low !== null && row.ci_high !== null;
            return (
              <g key={row.nfe}>
                {hasInterval ? (
                  <>
                    <line
                      x1={x(row.nfe)}
                      x2={x(row.nfe)}
                      y1={y(row.ci_high as number)}
                      y2={y(row.ci_low as number)}
                      stroke="var(--color-accent-strong)"
                    />
                    <line
                      x1={x(row.nfe) - 4}
                      x2={x(row.nfe) + 4}
                      y1={y(row.ci_high as number)}
                      y2={y(row.ci_high as number)}
                      stroke="var(--color-accent-strong)"
                    />
                    <line
                      x1={x(row.nfe) - 4}
                      x2={x(row.nfe) + 4}
                      y1={y(row.ci_low as number)}
                      y2={y(row.ci_low as number)}
                      stroke="var(--color-accent-strong)"
                    />
                  </>
                ) : null}
                <circle
                  cx={x(row.nfe)}
                  cy={y(row.mean)}
                  r="4"
                  fill="var(--color-ink)"
                >
                  <title>{`NFE ${row.nfe}: ${definition.format(row.mean)} (n=${row.n})`}</title>
                </circle>
                <text
                  x={x(row.nfe)}
                  y={CHART_HEIGHT - 24}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-muted)"
                >
                  {row.nfe}
                </text>
              </g>
            );
          })}

          <text
            x={PADDING.left + plotWidth / 2}
            y={CHART_HEIGHT - 3}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-muted)"
          >
            NFE
          </text>
          <text
            x="14"
            y={PADDING.top + plotHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-muted)"
            transform={`rotate(-90 14 ${PADDING.top + plotHeight / 2})`}
          >
            {definition.valueLabel}
          </text>
        </svg>
      </div>
    </article>
  );
}

function LatencyQualityChart({ rows }: { rows: SummaryByNfeRow[] }) {
  const latency = rows.filter((row) => row.metric === "latency_ms");
  const similarity = new Map(
    rows.filter((row) => row.metric === "sim_ref").map((row) => [row.nfe, row.mean]),
  );
  const points = latency
    .map((row) => ({ nfe: row.nfe, latency: row.mean, quality: similarity.get(row.nfe) }))
    .filter((point): point is { nfe: number; latency: number; quality: number } =>
      point.quality !== undefined,
    );
  const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
  const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;
  const xMax = Math.max(...points.map((point) => point.latency)) * 1.08;
  const qualityValues = points.map((point) => point.quality);
  const yMin = Math.max(0, Math.min(...qualityValues) - 0.02);
  const yMax = Math.min(1, Math.max(...qualityValues) + 0.02);
  const x = (value: number) => PADDING.left + (value / xMax) * plotWidth;
  const y = (value: number) =>
    PADDING.top + (1 - (value - yMin) / Math.max(0.0001, yMax - yMin)) * plotHeight;

  return (
    <article className="border border-rule p-5">
      <h3 className="font-medium">Latency vs speaker similarity</h3>
      <p className="mt-2 text-sm leading-6 text-muted">
        Each point is labelled by NFE. Points toward the upper-left provide better quality at lower cost.
      </p>
      <div className="mt-5">
        <svg
          viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
          className="h-auto w-full"
          role="img"
          aria-label="Mean latency versus mean reference-speaker similarity, labelled by NFE"
        >
          {range(5).map((index) => {
            const tick = (xMax * index) / 4;
            return (
              <g key={tick}>
                <line
                  x1={x(tick)}
                  x2={x(tick)}
                  y1={PADDING.top}
                  y2={CHART_HEIGHT - PADDING.bottom}
                  stroke="var(--color-rule)"
                />
                <text
                  x={x(tick)}
                  y={CHART_HEIGHT - 24}
                  textAnchor="middle"
                  fontSize="11"
                  fill="var(--color-muted)"
                >
                  {(tick / 1000).toFixed(1)}s
                </text>
              </g>
            );
          })}
          {range(5).map((index) => {
            const tick = yMin + ((yMax - yMin) * index) / 4;
            return (
              <g key={tick}>
                <line
                  x1={PADDING.left}
                  x2={CHART_WIDTH - PADDING.right}
                  y1={y(tick)}
                  y2={y(tick)}
                  stroke="var(--color-rule)"
                />
                <text
                  x={PADDING.left - 10}
                  y={y(tick) + 4}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--color-muted)"
                >
                  {tick.toFixed(3)}
                </text>
              </g>
            );
          })}
          {points.map((point) => (
            <g key={point.nfe}>
              <circle
                cx={x(point.latency)}
                cy={y(point.quality)}
                r="6"
                fill="var(--color-ink)"
              >
                <title>{`NFE ${point.nfe}: ${(point.latency / 1000).toFixed(2)}s, similarity ${point.quality.toFixed(4)}`}</title>
              </circle>
              <text
                x={x(point.latency) + 9}
                y={y(point.quality) - 8}
                fontSize="11"
                fontWeight="600"
                fill="var(--color-ink)"
              >
                {point.nfe}
              </text>
            </g>
          ))}
          <text
            x={PADDING.left + plotWidth / 2}
            y={CHART_HEIGHT - 3}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-muted)"
          >
            Mean latency
          </text>
          <text
            x="14"
            y={PADDING.top + plotHeight / 2}
            textAnchor="middle"
            fontSize="11"
            fill="var(--color-muted)"
            transform={`rotate(-90 14 ${PADDING.top + plotHeight / 2})`}
          >
            Similarity
          </text>
        </svg>
      </div>
    </article>
  );
}

function formatDelta(value: number, metric: "wer" | "sim_ref") {
  return metric === "wer"
    ? `${value >= 0 ? "+" : ""}${(value * 100).toFixed(1)} pp`
    : `${value >= 0 ? "+" : ""}${value.toFixed(3)}`;
}

function formatDeltaInterval(
  low: number | null,
  high: number | null,
  metric: "wer" | "sim_ref",
) {
  if (low === null || high === null) {
    return "95% CI unavailable";
  }

  return `95% CI ${formatDelta(low, metric)} to ${formatDelta(high, metric)}`;
}

export function ExperimentAnalysis({ data }: { data: ExperimentAnalysisData }) {
  const defaultRun = data.runIds.includes(MAIN_RUN_ID) ? MAIN_RUN_ID : data.runIds[0];
  const [runId, setRunId] = useState(defaultRun);
  const [category, setCategory] = useState<ExperimentCategory>("all");
  const selectedSummary = useMemo(
    () =>
      data.summaryByNfe.filter(
        (row) => row.run_id === runId && row.category === category,
      ),
    [category, data.summaryByNfe, runId],
  );
  const selectedDeltas = useMemo(
    () =>
      data.pairedDeltas.filter(
        (row) => row.run_id === runId && row.category === category,
      ),
    [category, data.pairedDeltas, runId],
  );
  const overview = data.overview.find(
    (item) => item.runId === runId && item.category === category,
  );
  const latencyFit = data.latencyFits.find(
    (row) =>
      row.run_id === runId &&
      row.category === category &&
      row.metric === "latency_ms",
  );
  const deltaNfes = [
    ...new Set(selectedDeltas.map((row) => row.nfe)),
  ].sort((a, b) => a - b);

  return (
    <div className="grid gap-10">
      <section className="border border-ink bg-sunk p-5" aria-labelledby="analysis-filters-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="meta text-muted">Live aggregate dataset</p>
            <h2 id="analysis-filters-title" className="mt-3 text-2xl font-medium">
              Experiment filters
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="meta text-muted">Run</span>
              <select
                value={runId}
                onChange={(event) => setRunId(event.target.value)}
                className="min-w-52 border border-rule bg-paper px-3 py-2"
              >
                {data.runIds.map((id) => (
                  <option key={id} value={id}>
                    {id === BROKEN_RUN_ID ? `${id} (broken)` : `${id} (main)`}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm">
              <span className="meta text-muted">Category</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value as ExperimentCategory)}
                className="min-w-52 border border-rule bg-paper px-3 py-2"
              >
                {EXPERIMENT_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {categoryLabel(value)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {runId === BROKEN_RUN_ID ? (
          <p className="mt-5 border-l-2 border-ink pl-4 text-sm leading-6">
            Comparison only: this run is known to be broken and should not be used for primary conclusions.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="slice-summary-title">
        <p className="meta text-muted">Selected slice</p>
        <h2 id="slice-summary-title" className="mt-3 text-2xl font-medium">
          {runId} · {categoryLabel(category)}
        </h2>
        <dl className="mt-6 grid border-t border-l border-rule sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Clips", overview?.clipCount ?? 0],
            ["Prompts", overview?.promptCount ?? 0],
            ["NFE values", new Set(selectedSummary.map((row) => row.nfe)).size],
            ["Chart metrics", new Set(selectedSummary.map((row) => row.metric)).size],
          ].map(([label, value]) => (
            <div key={label} className="border-r border-b border-rule p-5">
              <dt className="meta text-muted">{label}</dt>
              <dd className="mt-4 text-4xl tracking-[-0.04em]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="quality-charts-title">
        <p className="meta text-muted">95% confidence intervals</p>
        <h2 id="quality-charts-title" className="mt-3 text-2xl font-medium">
          Quality and generation cost
        </h2>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {CHARTS.map((definition) => (
            <LineChart
              key={definition.metric}
              definition={definition}
              rows={selectedSummary.filter((row) => row.metric === definition.metric)}
            />
          ))}
          <LatencyQualityChart rows={selectedSummary} />
        </div>
      </section>

      <section aria-labelledby="secondary-charts-title">
        <p className="meta text-muted">Cutoff-aware diagnostics</p>
        <h2 id="secondary-charts-title" className="mt-3 text-2xl font-medium">
          Heard-word accuracy and truncation
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
          These secondary metrics separate recognition errors from failures caused
          by clips ending before the full prompt was spoken.
        </p>
        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          {SECONDARY_CHARTS.map((definition) => (
            <LineChart
              key={definition.metric}
              definition={definition}
              rows={selectedSummary.filter((row) => row.metric === definition.metric)}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.4fr_1fr]" aria-labelledby="comparison-title">
        <div>
          <p className="meta text-muted">Paired against NFE 32</p>
          <h2 id="comparison-title" className="mt-3 text-2xl font-medium">
            Quality deltas
          </h2>
          <div className="mt-6 overflow-x-auto border border-rule">
            <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
              <thead className="bg-sunk">
                <tr>
                  <th className="meta border-b border-rule px-4 py-3 text-muted">NFE</th>
                  <th className="meta border-b border-rule px-4 py-3 text-muted">Δ WER</th>
                  <th className="meta border-b border-rule px-4 py-3 text-muted">Δ SIM</th>
                </tr>
              </thead>
              <tbody>
                {deltaNfes.map((nfe) => {
                  const wer = selectedDeltas.find((row) => row.nfe === nfe && row.metric === "wer");
                  const sim = selectedDeltas.find((row) => row.nfe === nfe && row.metric === "sim_ref");
                  return (
                    <tr key={nfe} className="border-b border-rule last:border-0">
                      <th scope="row" className="px-4 py-3 font-mono text-xs">{nfe}</th>
                      <td className="px-4 py-3">
                        {wer ? (
                          <>
                            <span>
                              {formatDelta(wer.mean_delta, "wer")}
                              {wer.ci_excludes_zero ? (
                                <span title="95% CI excludes zero"> *</span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                              {formatDeltaInterval(wer.ci_low, wer.ci_high, "wer")}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {sim ? (
                          <>
                            <span>
                              {formatDelta(sim.mean_delta, "sim_ref")}
                              {sim.ci_excludes_zero ? (
                                <span title="95% CI excludes zero"> *</span>
                              ) : null}
                            </span>
                            <span className="mt-1 block text-xs text-muted">
                              {formatDeltaInterval(
                                sim.ci_low,
                                sim.ci_high,
                                "sim_ref",
                              )}
                            </span>
                          </>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">
            * The 95% confidence interval excludes zero, indicating a measurable change from NFE 32.
          </p>
        </div>

        <aside className="border border-rule p-5">
          <p className="meta text-muted">Linear latency fit</p>
          <h3 className="mt-3 text-xl font-medium">Cost per additional NFE</h3>
          {latencyFit ? (
            <>
              <p className="mt-6 font-mono text-sm">
                latency = {(latencyFit.intercept / 1000).toFixed(2)}s + {(latencyFit.per_nfe / 1000).toFixed(2)}s × NFE
              </p>
              <dl className="mt-6 grid gap-5 text-sm">
                <div>
                  <dt className="text-muted">Intercept · 95% CI</dt>
                  <dd className="mt-1">
                    {(latencyFit.intercept / 1000).toFixed(2)}s ·{" "}
                    {(latencyFit.intercept_ci_low / 1000).toFixed(2)}–
                    {(latencyFit.intercept_ci_high / 1000).toFixed(2)}s
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Per-NFE cost · 95% CI</dt>
                  <dd className="mt-1">
                    {(latencyFit.per_nfe / 1000).toFixed(2)}s · {(latencyFit.per_nfe_ci_low / 1000).toFixed(2)}–{(latencyFit.per_nfe_ci_high / 1000).toFixed(2)}s
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Fit quality</dt>
                  <dd className="mt-1">R² {latencyFit.r2.toFixed(3)} · n={latencyFit.n}</dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-5 text-sm text-muted">No latency fit is available for this selection.</p>
          )}
        </aside>
      </section>
    </div>
  );
}
