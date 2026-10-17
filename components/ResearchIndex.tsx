import Link from "next/link";
import { POSTS } from "@/lib/content";
import { Arrow } from "./ArrowLink";
import { MetaLabel } from "./MetaLabel";

/** Content glides right while the row fill sweeps in behind it. */
const slide = "transition-transform duration-500 ease-out-soft group-hover:translate-x-3";

export function ResearchIndex({ headingLevel = "h3" }: { headingLevel?: "h2" | "h3" }) {
  const Title = headingLevel;
  return (
    <ul className="border-t border-ink">
      {POSTS.map((post, i) => (
        <li key={post.title} className="border-b border-rule">
          <Link
            href="/research"
            className="row-glide group grid gap-3 py-8 lg:grid-cols-12 lg:gap-6 lg:py-10"
          >
            <div className={`flex flex-wrap gap-x-3 gap-y-1 lg:col-span-3 lg:flex-col ${slide}`}>
              <MetaLabel tone="ink" className="flex gap-3">
                <span className="text-muted tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                {post.category}
              </MetaLabel>
              <MetaLabel>
                {post.date} · {post.readTime}
              </MetaLabel>
            </div>
            <div className={`flex flex-col gap-2 lg:col-span-7 ${slide}`}>
              <Title className="text-2xl font-normal tracking-[-0.02em] md:text-[1.75rem] md:leading-tight">
                {post.title}
              </Title>
              <p className="max-w-measure text-muted">{post.summary}</p>
              <MetaLabel className="mt-1 text-[0.6875rem]">{post.authors}</MetaLabel>
            </div>
            <span className="mt-2 inline-flex items-baseline gap-2 text-[0.9375rem] whitespace-nowrap lg:col-span-2 lg:mt-1 lg:justify-self-end lg:pr-3">
              <span className="border-b border-transparent transition-colors duration-300 group-hover:border-current">
                Read note
              </span>
              <Arrow />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
