import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ExperimentAnalysis } from "@/app/features/research-console/ExperimentAnalysis";
import { experimentDatasetRepository } from "@/app/features/research-console/experimentDatasetRepository.server";

export const metadata: Metadata = {
  title: "Experiment Analysis",
  description: "Compare dots.tts quality and generation cost across fixed NFE values.",
};

export default async function ExperimentAnalysisPage() {
  const data = await experimentDatasetRepository.getAnalysisData();

  return (
    <>
      <PageIntro
        label="Research console · Analysis"
        title="See where quality and compute separate."
        status="Live data"
      >
        Compare word error rate, speaker similarity, real-time factor and latency
        across fixed NFE values. The main view uses the xvector_4090 run and 95%
        confidence intervals supplied by the evaluation pipeline.
      </PageIntro>

      <section aria-label="Experiment analysis" className="pb-24 lg:pb-36">
        <Container>
          <div className="mb-8">
            <Link
              href="/research/dashboard"
              className="text-sm underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
            >
              ← Back to experiment inventory
            </Link>
          </div>
          <ExperimentAnalysis data={data} />
        </Container>
      </section>
    </>
  );
}
