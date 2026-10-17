import { ArrowLink } from "@/components/ArrowLink";
import { Container } from "@/components/Container";
import { Findings } from "@/components/Findings";
import { AdaptiveDemo } from "@/components/home/AdaptiveDemo";
import { ArchitectureBreakdown } from "@/components/home/ArchitectureBreakdown";
import { FeedbackBox } from "@/components/home/FeedbackBox";
import { Hero } from "@/components/home/Hero";
import { MetricsStrip } from "@/components/home/MetricsStrip";
import { Leaderboard } from "@/components/Leaderboard";
import { ResearchIndex } from "@/components/ResearchIndex";
import { Section } from "@/components/Section";
import { SectionHeader } from "@/components/SectionHeader";

// Light and dark bands alternate: demo and architecture are the dark ones.
export default function Home() {
  return (
    <>
      <Hero />
      <MetricsStrip />
      <AdaptiveDemo index={1} />

      <Section aria-labelledby="benchmarks-title">
        <Container>
          <SectionHeader
            id="benchmarks-title"
            index={2}
            label="Benchmark · Sep 2026"
            title="Fewer steps, measured against the alternatives."
            aside="Same base model, same test set. Each method cuts refinement steps differently; quality is checked against the full-step model. Open any row for its breakdown."
          />
          <div className="mt-12 lg:mt-16">
            <Leaderboard captionId="benchmarks-title" />
          </div>
        </Container>
      </Section>

      <ArchitectureBreakdown index={3} />

      <Section aria-labelledby="analysis-title">
        <Container>
          <SectionHeader
            id="analysis-title"
            index={4}
            label="Analysis · 5 findings"
            title="What the numbers don’t show on their own."
            aside="Where the predictor spends steps, what listeners actually hear, what happens under batching, and where adaptive inference still loses."
          />
          <div className="mt-12 lg:mt-16">
            <Findings />
          </div>
          <div className="mt-8 flex justify-end">
            <ArrowLink href="/benchmarks#analysis">All findings and method notes</ArrowLink>
          </div>
        </Container>
      </Section>

      <Section aria-labelledby="research-title">
        <Container>
          <SectionHeader
            id="research-title"
            index={5}
            label="Research · Writing"
            title="Notes from the lab."
          />
          <div className="mt-12 lg:mt-16">
            <ResearchIndex />
          </div>
        </Container>
      </Section>

      <FeedbackBox index={6} />
    </>
  );
}
