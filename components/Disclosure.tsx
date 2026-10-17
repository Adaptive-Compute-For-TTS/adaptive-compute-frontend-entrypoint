"use client";

import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Animated height panel. Render it unconditionally and drive it with `open`. */
export function Collapse({
  open,
  id,
  children,
  className = "",
}: {
  open: boolean;
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          id={id}
          key="panel"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{
            height: { duration: 0.5, ease },
            opacity: { duration: 0.3, ease: "linear" },
          }}
          className={`overflow-hidden ${className}`}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** Plus that rotates into a minus. Inherits text color. */
export function PlusMinus({ open, className = "" }: { open: boolean; className?: string }) {
  return (
    <span aria-hidden="true" className={`relative inline-block size-3 shrink-0 ${className}`}>
      <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
      <span
        className={`absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current transition-transform duration-500 ease-out-soft ${
          open ? "rotate-0" : "rotate-90"
        }`}
      />
    </span>
  );
}

/**
 * One row of an accordion. The whole header is the button; the summary
 * stays visible when collapsed so a closed list still reads as content.
 */
export function Disclosure({
  header,
  children,
  defaultOpen = false,
  headingLevel = "h3",
  tone = "paper",
  rule = "bottom",
  className = "",
}: {
  /** Receives `open` so the header can change with state. */
  header: (open: boolean) => React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  headingLevel?: "h2" | "h3" | "h4";
  /** "night" for the dark band. */
  tone?: "paper" | "night";
  /** Which edge carries the divider. */
  rule?: "top" | "bottom";
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const Heading = headingLevel;

  return (
    <div
      className={`${rule === "top" ? "border-t" : "border-b"} ${
        tone === "night" ? "border-night-rule" : "border-rule"
      } ${className}`}
    >
      <Heading className="font-normal">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className={`${tone === "night" ? "row-glide-night" : "row-glide"} group w-full cursor-pointer text-left`}
        >
          {header(open)}
        </button>
      </Heading>
      <Collapse open={open} id={panelId}>
        {children}
      </Collapse>
    </div>
  );
}
