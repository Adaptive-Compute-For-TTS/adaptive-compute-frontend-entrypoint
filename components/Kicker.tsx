import type { ComponentPropsWithoutRef } from "react";

type KickerProps = ComponentPropsWithoutRef<"span"> & {
  /** Section number, rendered as "01". Omit for an unnumbered tag. */
  index?: number;
  children: React.ReactNode;
};

/**
 * Bracketed section tag: [ 01 // INFERENCE ARCHITECTURE ].
 * Inherits text color; the brackets and number sit at reduced opacity.
 */
export function Kicker({ index, children, className = "", ...props }: KickerProps) {
  return (
    <span className={`meta inline-flex flex-wrap items-baseline gap-x-2 ${className}`} {...props}>
      <span aria-hidden="true" className="opacity-50">
        [
      </span>
      {index !== undefined ? (
        <>
          <span className="tabular-nums opacity-60">{String(index).padStart(2, "0")}</span>
          <span aria-hidden="true" className="opacity-40">
            {"//"}
          </span>
        </>
      ) : null}
      <span>{children}</span>
      <span aria-hidden="true" className="opacity-50">
        ]
      </span>
    </span>
  );
}
