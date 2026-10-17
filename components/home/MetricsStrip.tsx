"use client";

import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { EVAL_SETS, METRICS } from "@/lib/content";
import { Container } from "../Container";
import { Kicker } from "../Kicker";
import { MetaLabel } from "../MetaLabel";
import { Section } from "../Section";

/** Real minus sign for negative values, fixed decimals. */
const format = (n: number, decimals: number) =>
  `${n < 0 ? "−" : ""}${Math.abs(n).toFixed(decimals)}`;

/** Counts up to `value` the first time it scrolls into view. */
function CountUp({ value, decimals }: { value: number; decimals: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView) return;
    // Reduced motion: jump straight to the value.
    const controls = animate(0, value, {
      duration: reduceMotion ? 0 : 1.4,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: setShown,
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref}>
      {/* Screen readers get the final value, not the ticking one. */}
      <span className="sr-only">{format(value, decimals)}</span>
      <span aria-hidden="true">{format(shown, decimals)}</span>
    </span>
  );
}

export function MetricsStrip() {
  return (
    <Section aria-label="Key metrics" pad="none" className="pb-24 lg:pb-32">
      <Container>
        <dl className="grid grid-cols-2 gap-px border-b border-rule bg-rule lg:grid-cols-4">
          {METRICS.map((m, i) => (
            <div
              key={m.label}
              // before: a hairline that draws in across the top of the hovered cell.
              className="group relative flex flex-col gap-3 bg-paper px-4 py-8 transition-colors duration-200 before:absolute before:inset-x-0 before:-top-px before:h-px before:origin-left before:scale-x-0 before:bg-ink before:transition-transform before:duration-300 before:ease-out-soft hover:bg-paper-hover hover:before:scale-x-100 sm:px-6 sm:py-10 lg:px-8"
            >
              <dt className="flex flex-col gap-2">
                <span className="meta text-muted tabular-nums" aria-hidden="true">
                  M.{String(i + 1).padStart(2, "0")}
                </span>
                <MetaLabel tone="ink">{m.label}</MetaLabel>
              </dt>
              <dd className="order-first text-[2.5rem] leading-none font-medium tracking-[-0.05em] tabular-nums sm:text-6xl xl:text-7xl">
                {/* Accent marks the headline figure. */}
                <span
                  aria-hidden="true"
                  className={`mb-5 block h-1 w-8 rounded-full ${i === 0 ? "bg-accent-strong" : "bg-transparent"}`}
                />
                <CountUp value={m.value} decimals={m.decimals} />
                {m.unit ? (
                  <span className="ml-0.5 text-[0.45em] tracking-[-0.02em] text-muted">{m.unit}</span>
                ) : null}
              </dd>
              <dd className="max-w-[34ch] pt-2 text-[0.875rem] leading-snug text-muted transition-colors duration-200 group-hover:text-ink/80">
                {m.detail}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-10 grid gap-6 lg:grid-cols-12 lg:items-baseline lg:gap-x-6">
          <Kicker className="text-muted lg:col-span-3">Evaluated on</Kicker>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4 lg:col-span-9">
            {EVAL_SETS.map((set) => (
              <li key={set.name} className="group flex flex-col gap-1">
                <span className="text-xl tracking-[-0.02em] text-ink/80 transition-colors duration-200 group-hover:text-ink">
                  {set.name}
                </span>
                <span className="meta text-[0.6875rem] text-muted">{set.detail}</span>
              </li>
            ))}
          </ul>
        </div>
        <MetaLabel className="mt-8 block">Placeholder values · not results</MetaLabel>
      </Container>
    </Section>
  );
}
