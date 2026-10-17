import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ResearchIndex } from "@/components/ResearchIndex";

export const metadata: Metadata = { title: "Research" };

export default function ResearchPage() {
  return (
    <>
      <PageIntro label="Research · Writing" title="Notes, papers and negative results.">
        Writing on adaptive inference for text-to-speech: where fixed step
        schedules waste compute, how to predict step counts per frame, and how
        to turn fewer steps into real speedup. Full posts are on the way; the
        index below shows what&rsquo;s coming.
      </PageIntro>
      <section aria-label="Posts" className="pb-24 lg:pb-36">
        <Container>
          <ResearchIndex headingLevel="h2" />
        </Container>
      </section>
    </>
  );
}
