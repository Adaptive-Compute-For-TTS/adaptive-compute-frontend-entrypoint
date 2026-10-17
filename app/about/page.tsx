import type { Metadata } from "next";
import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { SectionHeader } from "@/components/SectionHeader";
import { TeamGrid } from "@/components/TeamGrid";
import { COMMITMENTS } from "@/lib/content";

export const metadata: Metadata = { title: "About us" };

export default function AboutPage() {
  return (
    <>
      <PageIntro label="About us" title="The people behind Adaptive TTS.">
        A small research group working on one question: how much compute does
        speech actually need? We publish what we measure, including what
        doesn&rsquo;t work.
      </PageIntro>

      <section id="team" aria-labelledby="team-title" className="pb-24 lg:pb-36">
        <Container>
          <SectionHeader
            id="team-title"
            label="Team"
            title="Who we are."
            aside="Photos and bios are placeholders until the team is public."
          />
          <div className="mt-12 lg:mt-16">
            <TeamGrid />
          </div>
        </Container>
      </section>

      <section id="commitments" aria-labelledby="commitments-title" className="pb-24 lg:pb-36">
        <Container>
          <SectionHeader
            id="commitments-title"
            label="How we work"
            title="What we’re committed to."
          />
          <ol className="mt-12 border-t border-ink lg:mt-16">
            {COMMITMENTS.map((c, i) => (
              <li
                key={c.title}
                className="grid gap-3 border-b border-rule py-7 lg:grid-cols-12 lg:items-baseline lg:gap-6 lg:py-9"
              >
                <span className="meta text-muted tabular-nums lg:col-span-3">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-2xl font-normal tracking-[-0.02em] md:text-[1.75rem] md:leading-tight lg:col-span-4">
                  {c.title}
                </h3>
                <p className="max-w-measure text-muted lg:col-span-5">{c.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section id="project" aria-labelledby="project-title" className="pb-24 lg:pb-36">
        <Container>
          <SectionHeader
            id="project-title"
            label="The project"
            title="Adaptive inference for text-to-speech."
          />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-6">
            <p className="max-w-measure md:text-xl md:leading-[1.5] lg:col-span-9 lg:col-start-4">
              Speech models that refine audio step by step spend the same compute
              on a pause as on a plosive. We predict how many steps each frame
              needs, skip the rest, and turn the savings into real speedup on the
              GPU, without listeners hearing the difference.
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-4 lg:col-span-9 lg:col-start-4">
              <ArrowLink href="/listen">Hear the samples</ArrowLink>
              <ArrowLink href="/benchmarks">See the benchmarks</ArrowLink>
              <ArrowLink href="/research">Read the notes</ArrowLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
