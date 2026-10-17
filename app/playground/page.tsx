import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { PageIntro } from "@/components/PageIntro";
import { PlaygroundForm } from "@/app/features/tts-playground/PlaygroundForm"

export const metadata: Metadata = {
  title: "TTS Playground",
  description: "Generate speech with dots.tts.",
};

export default function PlaygroundPage() {
  return (
    <>
      <PageIntro
        label="Playground · dots.tts"
        title="Turn text into speech."
      >
        Enter some text and optionally provide a reference recording to guide
        the generated voice. This interface is currently disconnected from the
        inference service.
      </PageIntro>

      <section aria-labelledby="playground-form-title" className="pb-24 lg:pb-36">
        <Container>
          <div className="max-w-3xl border-t border-rule pt-10">
            <h2 id="playground-form-title" className="sr-only">
              Speech generation form
            </h2>

            <PlaygroundForm />
          </div>
        </Container>
      </section>
    </>
  );
}