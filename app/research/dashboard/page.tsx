import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ResearchDashboard } from "@/app/features/research-console/ResearchDashboard";
import { researchRunRepository } from "@/app/features/research-console/researchRunRepository.server";

export const metadata: Metadata = {
  title: "Research Dashboard",
  description: "Internal experiment review dashboard prototype.",
};

export default async function ResearchDashboardPage() {
  const runs = await researchRunRepository.list();

  return (
    <>
      <PageIntro
        label="Research console · Dashboard"
        title="Review every experiment in context."
      >
        A workspace for reproducible runs, generated audio, evaluation metrics,
        exact configurations and testing notes. The current rows are clearly
        labeled mock data for frontend testing.
      </PageIntro>

      <section aria-label="Research dashboard" className="pb-24 lg:pb-36">
        <Container>
          <ResearchDashboard runs={runs} dataMode={researchRunRepository.mode} />
        </Container>
      </section>
    </>
  );
}
