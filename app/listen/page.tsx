import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { MetaLabel } from "@/components/MetaLabel";
import { PageIntro } from "@/components/PageIntro";
import { SampleList } from "@/components/SampleList";
import { DEMO_SENTENCE } from "@/lib/content";

export const metadata: Metadata = { title: "Listen" };

export default function ListenPage() {
  return (
    <>
      <PageIntro label="Listen · Samples" title="Hear what fewer steps sound like.">
        Side-by-side samples from the full-step model, uniform step reduction,
        step distillation and our adaptive schedule, rendered from
        the same text. Real audio will be published here alongside the paper.
      </PageIntro>
      <section aria-label="Samples" className="pb-24 lg:pb-36">
        <Container>
          <div className="mb-10 flex flex-col gap-3">
            <MetaLabel>Sample text</MetaLabel>
            <p className="max-w-[40ch] text-lede">“{DEMO_SENTENCE}”</p>
          </div>
          <SampleList />
        </Container>
      </section>
    </>
  );
}
