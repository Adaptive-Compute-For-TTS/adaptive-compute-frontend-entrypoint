import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ResearchRunDetail } from "@/app/features/research-console/ResearchRunDetail";
import { researchRunRepository } from "@/app/features/research-console/researchRunRepository.server";

type RunPageProps = {
  params: Promise<{ runId: string }>;
};

const getResearchRun = cache((runId: string) =>
  researchRunRepository.getById(runId),
);

export async function generateStaticParams() {
  const runs = await researchRunRepository.list();
  return runs.map((run) => ({ runId: run.id }));
}

export async function generateMetadata({
  params,
}: RunPageProps): Promise<Metadata> {
  const { runId } = await params;
  const run = await getResearchRun(runId);

  return {
    title: run?.name ?? "Run not found",
    description: run
      ? `Research run detail prototype for ${run.id}.`
      : "The requested research run could not be found.",
  };
}

export default async function ResearchRunPage({ params }: RunPageProps) {
  const { runId } = await params;
  const run = await getResearchRun(runId);

  if (!run) {
    notFound();
  }

  return (
    <>
      <PageIntro label="Research console · Run detail" title={run.name ?? run.id}>
        Review the prompt, exact inference configuration, generated artifacts,
        evaluation metrics, GPU telemetry and reproducibility information for
        one experiment run.
      </PageIntro>

      <section aria-label="Research run detail" className="pb-24 lg:pb-36">
        <Container>
          <ResearchRunDetail run={run} dataMode={researchRunRepository.mode} />
        </Container>
      </section>
    </>
  );
}
