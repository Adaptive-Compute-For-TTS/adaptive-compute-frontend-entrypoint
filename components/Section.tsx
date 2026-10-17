import type { ComponentPropsWithoutRef } from "react";

type SectionProps = ComponentPropsWithoutRef<"section"> & {
  /** "night" renders a dark, dot-textured band. */
  tone?: "paper" | "night";
  /** Vertical padding. "none" when the content sets its own. */
  pad?: "default" | "none";
};

/**
 * Full-width page section with a hairline rule on top. Registration marks
 * sit where the rule crosses the structural rails (see GridRails).
 */
export function Section({
  tone = "paper",
  pad = "default",
  className = "",
  children,
  ...props
}: SectionProps) {
  const toneClass =
    tone === "night"
      ? "border-night-rule bg-night texture-dots text-night-ink"
      : "border-rule";
  return (
    <section
      className={`relative border-t ${toneClass} ${pad === "default" ? "section-y" : ""} ${className}`}
      {...props}
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 hidden md:block">
        <div className="rail-box">
          <div
            className={`relative h-0 ${tone === "night" ? "text-night-muted" : "text-muted"}`}
          >
            <span className="crosshair absolute top-0 left-0 size-[11px] -translate-x-1/2 -translate-y-1/2" />
            <span className="crosshair absolute top-0 right-0 size-[11px] translate-x-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
      {children}
    </section>
  );
}
