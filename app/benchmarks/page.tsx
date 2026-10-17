import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Findings } from "@/components/Findings";
import { Leaderboard } from "@/components/Leaderboard";
import { MethodList } from "@/components/MethodList";
import { PageIntro } from "@/components/PageIntro";
import { SectionHeader } from "@/components/SectionHeader";

export const metadata: Metadata = { title: "Benchmarks" };

export default function BenchmarksPage() {
  return (
    <>
      <PageIntro label="Benchmarks · Evaluation" title="How we measure adaptive inference.">
        Adaptive inference compared with existing step-reduction methods on
        the same base model, trading steps and wall-clock latency against
        quality (MOS, WER). Every row and finding opens into its breakdown.
      </PageIntro>

      <section id="leaderboard" aria-labelledby="leaderboard-title" className="pb-24 lg:pb-36">
        <Container>
          <h2 id="leaderboard-title" className="meta mb-6 text-muted">
            Leaderboard · Sep 2026
          </h2>
          <Leaderboard captionId="leaderboard-title" showMethodLink={false} />
        </Container>
      </section>

      <section id="analysis" aria-labelledby="analysis-title" className="pb-24 lg:pb-36">
        <Container>
          <SectionHeader
            id="analysis-title"
            label="Analysis · 5 findings"
            title="What the numbers don’t show on their own."
            aside="Where the predictor spends steps, what listeners actually hear, what happens under batching, and where adaptive inference still loses."
          />
          <div className="mt-12 lg:mt-16">
            <Findings />
          </div>
        </Container>
      </section>

      <section id="method" aria-labelledby="method-title" className="pb-24 lg:pb-36">
        <Container>
          <SectionHeader
            id="method-title"
            label="Method"
            title="Where every number comes from."
            aside="Shared by the leaderboard, the findings and the demo. If a figure on this site doesn’t trace back to one of these, it’s a bug."
          />
          <div className="mt-12 lg:mt-16">
            <MethodList />
          </div>
        </Container>
      </section>
    </>
  );
}
