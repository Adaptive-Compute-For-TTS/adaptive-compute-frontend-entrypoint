import Link from "next/link";
import type { ResearchDataMode, ResearchRun } from "./contracts";

const RUN_COLUMNS = [
  "Run",
  "Prompt",
  "NFE",
  "Status",
  "Audio",
  "Metrics",
  "Created",
] as const;

function displayNfe(run: ResearchRun) {
  const schedule = run.configuration.schedule;

  if (schedule.kind === "fixed") {
    return String(schedule.nfe);
  }

  if (schedule.kind === "adaptive") {
    return schedule.meanNfe === undefined
      ? "Adaptive"
      : `${schedule.meanNfe.toFixed(1)} mean`;
  }

  return schedule.label;
}

function displayMetrics(run: ResearchRun) {
  const values: string[] = [];

  if (run.metrics?.latency) {
    values.push(`${run.metrics.latency.totalMs.toFixed(0)} ms`);
  }

  if (run.metrics?.wer) {
    values.push(`${(run.metrics.wer.value * 100).toFixed(1)}% WER`);
  }

  if (run.metrics?.speakerSimilarity) {
    values.push(`${run.metrics.speakerSimilarity.value.toFixed(3)} SIM`);
  }

  return values.length > 0 ? values.join(" · ") : "—";
}

const REVIEW_AREAS = [
  {
    title: "Configuration snapshot",
    description:
      "Model revision, fixed NFE, seed, solver settings, hardware and runtime environment.",
  },
  {
    title: "Testing information",
    description:
      "Benchmark prompt, reference transcript, ASR output, test category and evaluation notes.",
  },
  {
    title: "Metrics",
    description:
      "Latency, WER, speaker similarity, GPU timing, memory use and kernel-launch counts.",
  },
] as const;

export function ResearchDashboard({
  runs,
  dataMode = "empty",
}: {
  runs: readonly ResearchRun[];
  dataMode?: ResearchDataMode;
}) {
  const audioCount = runs.filter(
    (run) => run.generation.outputAudio !== undefined,
  ).length;
  const metricsCount = runs.filter(
    (run) => run.metrics !== undefined,
  ).length;
  const summaryItems = [
    {
      label: "Runs",
      value: String(runs.length),
      note: runs.length === 0 ? "Experiment store not connected" : "Indexed runs",
    },
    {
      label: "Audio files",
      value: String(audioCount),
      note: audioCount === 0 ? "Artifact store not connected" : "Generated outputs",
    },
    {
      label: "Metrics",
      value: String(metricsCount),
      note: metricsCount === 0 ? "Awaiting evaluation data" : "Evaluated runs",
    },
    {
      label: "Configurations",
      value: String(runs.length),
      note: runs.length === 0 ? "No configs indexed" : "Reproducible snapshots",
    },
  ] as const;

  return (
    <div className="grid gap-12">
      <div className="flex flex-col gap-5 border border-ink bg-sunk p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="meta text-ink">
            Prototype · {dataMode === "mock" ? "Mock data" : "No access control"}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {dataMode === "mock"
              ? "Every row and metric on this page is illustrative. No dots.tts inference or evaluation was performed."
              : "This route is a frontend preview only. It does not verify a user, create a session or expose stored experiment data."}
          </p>
        </div>
        <Link
          href="/research/login"
          className="shrink-0 text-sm underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
        >
          Return to login
        </Link>
      </div>

      <section aria-labelledby="research-summary-title">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="meta text-muted">Workspace overview</p>
            <h2 id="research-summary-title" className="mt-3 text-2xl font-medium">
              Experiment inventory
            </h2>
          </div>
          <span className="meta border border-rule px-2 py-1 text-muted">
            {dataMode === "mock"
              ? "Mock dataset"
              : runs.length === 0
                ? "Empty state"
                : `${runs.length} runs`}
          </span>
        </div>

        <dl className="mt-6 grid border-t border-l border-rule sm:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="border-r border-b border-rule p-5"
            >
              <dt className="meta text-muted">{item.label}</dt>
              <dd className="mt-4 text-4xl tracking-[-0.04em]">{item.value}</dd>
              <p className="mt-3 text-sm text-muted">{item.note}</p>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="recent-runs-title">
        <div>
          <p className="meta text-muted">Run registry</p>
          <h2 id="recent-runs-title" className="mt-3 text-2xl font-medium">
            Recent experiments
          </h2>
        </div>

        <div className="mt-6 overflow-x-auto border border-rule">
          <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
            <thead className="bg-sunk">
              <tr>
                {RUN_COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="meta border-b border-rule px-4 py-3 text-muted"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.length === 0 ? (
                <tr>
                  <td
                    colSpan={RUN_COLUMNS.length}
                    className="px-4 py-14 text-center"
                  >
                    <p className="font-medium">
                      No experiment runs are connected.
                    </p>
                    <p className="mt-2 text-sm text-muted">
                      Runs will appear here after the experiment API and storage
                      schema are available.
                    </p>
                  </td>
                </tr>
              ) : (
                runs.map((run) => (
                  <tr key={run.id} className="border-b border-rule last:border-0">
                    <td className="px-4 py-4 font-mono text-xs">
                      <Link
                        href={`/research/dashboard/runs/${encodeURIComponent(run.id)}`}
                        className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                      >
                        {run.name ?? run.id}
                      </Link>
                    </td>
                    <td className="max-w-xs px-4 py-4">
                      <span className="line-clamp-2">{run.prompt.text}</span>
                    </td>
                    <td className="px-4 py-4">{displayNfe(run)}</td>
                    <td className="px-4 py-4 capitalize">{run.status}</td>
                    <td className="px-4 py-4">
                      {run.generation.outputAudio ? (
                        run.generation.outputAudio.uri.startsWith("mock://") ? (
                          <span className="text-muted">Mock file</span>
                        ) : (
                          <a
                            href={run.generation.outputAudio.uri}
                            target="_blank"
                            rel="noreferrer"
                            className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                          >
                            Open
                          </a>
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      {displayMetrics(run)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4">
                      <time dateTime={run.createdAt}>
                        {run.createdAt.slice(0, 10)}
                      </time>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="review-areas-title">
        <div>
          <p className="meta text-muted">Run details</p>
          <h2 id="review-areas-title" className="mt-3 text-2xl font-medium">
            Information stored with each run
          </h2>
        </div>

        <div className="mt-6 grid border-t border-l border-rule lg:grid-cols-3">
          {REVIEW_AREAS.map((area) => (
            <article
              key={area.title}
              className="border-r border-b border-rule p-5"
            >
              <h3 className="font-medium">{area.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">
                {area.description}
              </p>
              <p className="meta mt-8 text-muted">
                {dataMode === "mock" ? "Mock examples loaded" : "Not connected"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
