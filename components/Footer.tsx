import Link from "next/link";
import { POSTS } from "@/lib/content";
import { CONTACT_EMAIL, MODEL_STATUS, NAV_LINKS } from "@/lib/site";
import { Arrow } from "./ArrowLink";
import { Container } from "./Container";
import { MetaLabel } from "./MetaLabel";

const linkClass =
  "group inline-flex items-baseline gap-2 text-muted transition-colors duration-300 hover:text-ink";

export function Footer() {
  return (
    <footer className="border-t border-ink">
      <Container className="grid gap-12 pt-16 pb-10 md:grid-cols-12 md:gap-6 lg:pt-20">
        <div className="flex flex-col gap-6 md:col-span-5">
          <Link
            href="/"
            className="w-fit text-4xl tracking-[-0.04em] transition-opacity duration-300 hover:opacity-70 lg:text-5xl"
          >
            Adaptive TTS
          </Link>
          <p className="max-w-[34ch] text-[0.9375rem] leading-relaxed text-muted">
            A research project on adaptive inference for text-to-speech: spend compute where speech
            actually needs it.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group inline-flex w-fit items-baseline gap-2"
          >
            <span className="border-b border-current/30 pb-0.5 transition-colors group-hover:border-current">
              {CONTACT_EMAIL}
            </span>
            <Arrow />
          </a>
        </div>

        <nav aria-label="Footer" className="md:col-span-2 md:col-start-7">
          <MetaLabel className="mb-4 block">Site</MetaLabel>
          <ul className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className={linkClass}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4 md:col-start-9">
          <MetaLabel className="mb-4 block">Latest notes</MetaLabel>
          <ul className="flex flex-col gap-2">
            {POSTS.slice(0, 3).map((post) => (
              <li key={post.title}>
                <Link href="/research" className={linkClass}>
                  <span>{post.title}</span>
                  <Arrow />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>

      <Container>
        <div className="meta flex flex-col gap-3 border-t border-rule py-6 text-muted md:flex-row md:items-center md:justify-between">
          <p className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className="size-1.5 animate-pulse-dot rounded-full bg-accent-strong"
            />
            {MODEL_STATUS.model} · last eval {MODEL_STATUS.lastEval}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>© 2026 Adaptive TTS</span>
            <a href="#" className="transition-colors hover:text-ink">
              Privacy
            </a>
            <a href="#main" className="group inline-flex gap-2 transition-colors hover:text-ink">
              Back to top
              <span
                aria-hidden="true"
                className="inline-block transition-transform duration-300 ease-out-soft group-hover:-translate-y-0.5"
              >
                ↑
              </span>
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
