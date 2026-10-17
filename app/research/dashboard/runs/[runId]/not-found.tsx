import Link from "next/link";
import { Container } from "@/components/Container";

export default function RunNotFound() {
  return (
    <section className="py-24 lg:py-36">
      <Container>
        <p className="meta text-muted">Research console · 404</p>
        <h1 className="mt-6 text-h2 font-medium">Run not found.</h1>
        <p className="mt-6 max-w-measure text-muted">
          The requested experiment run is not part of the current mock dataset.
        </p>
        <Link
          href="/research/dashboard"
          className="mt-8 inline-block border-b border-ink/30 pb-1 text-sm hover:border-ink"
        >
          Return to the research dashboard
        </Link>
      </Container>
    </section>
  );
}
