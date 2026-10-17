import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { ResearchLoginForm } from "@/app/features/research-console/ResearchLoginForm";

export const metadata: Metadata = {
  title: "Research Login",
  description: "Research console login prototype.",
};

export default function ResearchLoginPage() {
  return (
    <>
      <PageIntro
        label="Research console · Login"
        title="Internal experiment access."
      >
        Sign in to review internal dots.tts runs, generated audio, metrics,
        configurations and testing information. Authentication is not connected
        in this frontend prototype.
      </PageIntro>

      <section aria-label="Research login" className="pb-24 lg:pb-36">
        <Container>
          <div className="max-w-4xl border-t border-rule pt-10">
            <ResearchLoginForm />
          </div>
        </Container>
      </section>
    </>
  );
}
