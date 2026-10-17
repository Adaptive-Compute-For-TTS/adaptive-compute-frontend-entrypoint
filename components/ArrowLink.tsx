import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";

type ArrowLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & {
  href: string;
};

/** Secondary CTA: text plus an arrow that nudges on hover. */
export function ArrowLink({
  href,
  children,
  className = "",
  ...props
}: ArrowLinkProps) {
  const classes = `group inline-flex items-baseline gap-2 border-b border-current/25 pb-0.5 transition-colors duration-200 hover:border-current ${className}`;
  const inner = (
    <>
      <span>{children}</span>
      <Arrow />
    </>
  );

  // Anchors, placeholders and mailto links don't need client routing.
  if (!href.startsWith("/")) {
    return (
      <a href={href} className={classes} {...props}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {inner}
    </Link>
  );
}

type Tone = "paper" | "night";

const primaryClasses = (tone: Tone, className: string) => {
  const block =
    tone === "night"
      ? "bg-night-ink text-night hover:bg-night-ink/90"
      : "bg-ink text-paper hover:bg-ink/90";
  return `group inline-flex items-stretch text-[0.9375rem] tracking-[-0.01em] transition-colors duration-200 ${block} ${className}`;
};

function PrimaryInner({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const cell = tone === "night" ? "bg-night-accent text-night" : "bg-accent text-ink";
  return (
    <>
      <span className="px-5 py-3.5">{children}</span>
      <span
        aria-hidden="true"
        className={`grid w-12 place-items-center overflow-hidden ${cell}`}
      >
        <span className="inline-block transition-transform duration-300 ease-out-soft group-hover:translate-x-1">
          →
        </span>
      </span>
    </>
  );
}

/**
 * The one primary action per section: an ink block with the arrow in an
 * accent cell. `tone="night"` inverts it for the dark bands.
 */
export function PrimaryLink({
  href,
  children,
  tone = "paper",
  className = "",
  ...props
}: ArrowLinkProps & { tone?: Tone }) {
  const classes = primaryClasses(tone, className);
  const inner = <PrimaryInner tone={tone}>{children}</PrimaryInner>;

  if (!href.startsWith("/")) {
    return (
      <a href={href} className={classes} {...props}>
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} {...props}>
      {inner}
    </Link>
  );
}

/** PrimaryLink's look on a <button>, for form submits. */
export function PrimaryButton({
  children,
  tone = "paper",
  className = "",
  ...props
}: ComponentPropsWithoutRef<"button"> & { tone?: Tone }) {
  return (
    <button
      className={`cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${primaryClasses(tone, className)}`}
      {...props}
    >
      <PrimaryInner tone={tone}>{children}</PrimaryInner>
    </button>
  );
}

export function Arrow({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block transition-transform duration-300 ease-out-soft group-hover:translate-x-1 ${className}`}
    >
      →
    </span>
  );
}
