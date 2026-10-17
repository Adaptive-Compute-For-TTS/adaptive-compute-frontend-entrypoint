import Link from "next/link";
import type {
  ArtifactReference,
  ResearchDataMode,
  ResearchRun,
} from "./contracts";

function displaySchedule(run: ResearchRun) {
  const schedule = run.configuration.schedule;

  if (schedule.kind === "fixed") {
    return `Fixed · ${schedule.nfe} NFE`;
  }

  if (schedule.kind === "adaptive") {
    const mean = schedule.meanNfe === undefined ? "—" : schedule.meanNfe.toFixed(1);
    return `Adaptive · ${schedule.minimumNfe}–${schedule.maximumNfe} NFE · ${mean} mean`;
  }

  return `Custom · ${schedule.label}`;
}

function formatBytes(bytes?: number) {
  if (bytes === undefined) return "—";
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function ArtifactValue({ artifact }: { artifact?: ArtifactReference }) {
  if (!artifact) return <span>—</span>;

  if (artifact.uri.startsWith("mock://")) {
    return <span>{artifact.filename} · Mock file</span>;
  }

  return (
    <a
      href={artifact.uri}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
    >
      {artifact.filename}
    </a>
  );
}

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="meta text-muted">{label}</dt>
      <dd className="mt-2 break-words text-sm leading-6">{children}</dd>
    </div>
  );
}

function StringList({ values }: { values?: string[] }) {
  if (!values || values.length === 0) {
    return <p className="text-sm text-muted">No data recorded.</p>;
  }

  return (
    <ul className="mt-3 grid gap-2 text-sm text-muted">
      {values.map((value) => (
        <li key={value} className="border-l border-rule pl-3">
          {value}
        </li>
      ))}
    </ul>
  );
}

export function ResearchRunDetail({
  run,
  dataMode,
}: {
  run: ResearchRun;
  dataMode: Exclude<ResearchDataMode, "empty">;
}) {
  const metrics = run.metrics;
  const telemetry = run.telemetry;

  return (
    <div className="grid gap-12">
      <div className="flex flex-col gap-5 border border-ink bg-sunk p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="meta text-ink">
            {dataMode === "mock"
              ? "Mock run · Illustrative data only"
              : "Research run · Internal data"}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
            {dataMode === "mock"
              ? "No dots.tts inference, evaluation, telemetry capture or artifact upload was performed for this record."
              : "This record was loaded through the research data repository and may contain internal experiment information."}
          </p>
        </div>
        <Link
          href="/research/dashboard"
          className="shrink-0 text-sm underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
        >
          Back to all runs
        </Link>
      </div>

      <section aria-labelledby="run-overview-title">
        <p className="meta text-muted">Run overview</p>
        <h2 id="run-overview-title" className="mt-3 text-2xl font-medium">
          {run.name ?? run.id}
        </h2>

        <dl className="mt-6 grid gap-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Run ID">{run.id}</DetailItem>
          <DetailItem label="Status">
            <span className="capitalize">{run.status}</span>
          </DetailItem>
          <DetailItem label="Created">
            <time dateTime={run.createdAt}>{run.createdAt}</time>
          </DetailItem>
          <DetailItem label="Schedule">{displaySchedule(run)}</DetailItem>
        </dl>

        <div className="mt-8 border-l-2 border-accent-strong pl-5">
          <p className="meta text-muted">Benchmark prompt</p>
          <blockquote className="mt-3 max-w-3xl text-xl leading-8">
            “{run.prompt.text}”
          </blockquote>
          <p className="mt-3 text-sm text-muted">
            {run.prompt.id} · {run.prompt.language} · {run.prompt.length} ·{" "}
            {run.prompt.categories.join(", ")}
          </p>
        </div>
      </section>

      <section aria-labelledby="run-metrics-title">
        <p className="meta text-muted">Evaluation</p>
        <h2 id="run-metrics-title" className="mt-3 text-2xl font-medium">
          Metrics
        </h2>

        <dl className="mt-6 grid border-t border-l border-rule sm:grid-cols-3">
          <div className="border-r border-b border-rule p-5">
            <dt className="meta text-muted">Latency</dt>
            <dd className="mt-4 text-3xl">
              {metrics?.latency ? `${metrics.latency.totalMs.toFixed(0)} ms` : "—"}
            </dd>
            <p className="mt-2 text-sm text-muted">
              RTF {metrics?.latency?.realTimeFactor?.toFixed(3) ?? "—"}
            </p>
          </div>
          <div className="border-r border-b border-rule p-5">
            <dt className="meta text-muted">Word error rate</dt>
            <dd className="mt-4 text-3xl">
              {metrics?.wer ? `${(metrics.wer.value * 100).toFixed(1)}%` : "—"}
            </dd>
            <p className="mt-2 text-sm text-muted">
              {metrics?.wer?.evaluator ?? "No evaluator"}
            </p>
          </div>
          <div className="border-r border-b border-rule p-5">
            <dt className="meta text-muted">Speaker similarity</dt>
            <dd className="mt-4 text-3xl">
              {metrics?.speakerSimilarity?.value.toFixed(3) ?? "—"}
            </dd>
            <p className="mt-2 text-sm text-muted">
              {metrics?.speakerSimilarity?.evaluator ?? "No evaluator"}
            </p>
          </div>
        </dl>
      </section>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="run-config-title">
          <p className="meta text-muted">Reproducibility</p>
          <h2 id="run-config-title" className="mt-3 text-2xl font-medium">
            Configuration
          </h2>
          <dl className="mt-6 grid gap-5 border-t border-rule pt-5 sm:grid-cols-2">
            <DetailItem label="Model">{run.configuration.modelName}</DetailItem>
            <DetailItem label="Revision">
              {run.configuration.modelRevision ?? "—"}
            </DetailItem>
            <DetailItem label="Seed">{run.configuration.seed}</DetailItem>
            <DetailItem label="Precision">
              {run.configuration.precision ?? "—"}
            </DetailItem>
            <DetailItem label="Output audio">
              <ArtifactValue artifact={run.generation.outputAudio} />
            </DetailItem>
            <DetailItem label="Sample rate">
              {run.generation.sampleRateHz
                ? `${run.generation.sampleRateHz.toLocaleString()} Hz`
                : "—"}
            </DetailItem>
          </dl>
          <pre className="mt-6 overflow-x-auto border border-rule bg-sunk p-4 font-mono text-xs leading-6">
            {JSON.stringify(run.configuration.parameters, null, 2)}
          </pre>
        </section>

        <section aria-labelledby="run-telemetry-title">
          <p className="meta text-muted">Execution</p>
          <h2 id="run-telemetry-title" className="mt-3 text-2xl font-medium">
            GPU telemetry
          </h2>
          <dl className="mt-6 grid gap-5 border-t border-rule pt-5 sm:grid-cols-2">
            <DetailItem label="Device">{telemetry?.deviceName ?? "—"}</DetailItem>
            <DetailItem label="CUDA">{telemetry?.cudaVersion ?? "—"}</DetailItem>
            <DetailItem label="GPU time">
              {telemetry?.totalGpuTimeMs
                ? `${telemetry.totalGpuTimeMs.toFixed(1)} ms`
                : "—"}
            </DetailItem>
            <DetailItem label="Kernel launches">
              {telemetry?.kernelLaunchCount ?? "—"}
            </DetailItem>
            <DetailItem label="Peak memory">
              {formatBytes(telemetry?.peakMemoryBytes)}
            </DetailItem>
            <DetailItem label="Per-NFE samples">
              {telemetry?.perNfe?.length ?? 0}
            </DetailItem>
          </dl>
        </section>
      </div>

      <div className="grid gap-10 lg:grid-cols-2">
        <section aria-labelledby="run-testing-title">
          <p className="meta text-muted">Verification</p>
          <h2 id="run-testing-title" className="mt-3 text-2xl font-medium">
            Testing information
          </h2>
          <dl className="mt-6 grid gap-5 border-t border-rule pt-5">
            <DetailItem label="Benchmark">
              {run.testing?.benchmarkName ?? "—"} ·{" "}
              {run.testing?.benchmarkVersion ?? "—"}
            </DetailItem>
            <DetailItem label="Expected transcript">
              {run.testing?.expectedTranscript ?? "—"}
            </DetailItem>
            <DetailItem label="Observed transcript">
              {run.testing?.observedTranscript ?? "—"}
            </DetailItem>
            <DetailItem label="Result">
              {run.testing?.passed === undefined
                ? "Not evaluated"
                : run.testing.passed
                  ? "Passed"
                  : "Failed"}
            </DetailItem>
          </dl>
        </section>

        <section aria-labelledby="run-trace-title">
          <p className="meta text-muted">Inference analysis</p>
          <h2 id="run-trace-title" className="mt-3 text-2xl font-medium">
            Trace and reusable state
          </h2>
          <div className="mt-6 grid gap-6 border-t border-rule pt-5 sm:grid-cols-2">
            <div>
              <h3 className="font-medium">Important tensors</h3>
              <StringList values={run.traceAnalysis?.importantTensors} />
            </div>
            <div>
              <h3 className="font-medium">Repeated operations</h3>
              <StringList values={run.traceAnalysis?.repeatedOperations} />
            </div>
            <div>
              <h3 className="font-medium">Invariants</h3>
              <StringList values={run.traceAnalysis?.invariants} />
            </div>
            <div>
              <h3 className="font-medium">Reusable state</h3>
              <StringList values={run.traceAnalysis?.reusableState} />
            </div>
          </div>
        </section>
      </div>

      <section aria-labelledby="run-artifacts-title">
        <p className="meta text-muted">Files and provenance</p>
        <h2 id="run-artifacts-title" className="mt-3 text-2xl font-medium">
          Artifacts
        </h2>

        <div className="mt-6 overflow-x-auto border border-rule">
          <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
            <thead className="bg-sunk">
              <tr>
                {['Type', 'Filename', 'Location'].map((column) => (
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
              {run.artifacts.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-10 text-center text-muted">
                    No artifacts recorded yet.
                  </td>
                </tr>
              ) : (
                run.artifacts.map((artifact) => (
                  <tr key={artifact.id} className="border-b border-rule last:border-0">
                    <td className="px-4 py-4 capitalize">{artifact.kind}</td>
                    <td className="px-4 py-4 font-mono text-xs">
                      {artifact.filename}
                    </td>
                    <td className="px-4 py-4">
                      <ArtifactValue artifact={artifact} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <dl className="mt-6 grid gap-5 border-t border-rule pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem label="Repository">{run.provenance.repository}</DetailItem>
          <DetailItem label="Commit">{run.provenance.commitSha}</DetailItem>
          <DetailItem label="Branch">{run.provenance.branch ?? "—"}</DetailItem>
          <DetailItem label="Created by">
            {run.provenance.createdBy ?? "—"}
          </DetailItem>
        </dl>
      </section>
    </div>
  );
}
