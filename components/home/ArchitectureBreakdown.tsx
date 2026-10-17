"use client";

import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useId, useRef, useState } from "react";
import { ARCHITECTURE, type ArchitectureModule } from "@/lib/content";
import { Container } from "../Container";
import { Kicker } from "../Kicker";
import { Section } from "../Section";
import { SectionHeader } from "../SectionHeader";

const ease = [0.22, 1, 0.36, 1] as const;
type ModuleId = ArchitectureModule["id"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Split view: a vertical tab list of the system's components on the left, a
 * detail panel on the right. Mouse hover previews a tab; click, tap and the
 * arrow keys select one. On small screens the tabs stack above the panel.
 */
export function ArchitectureBreakdown({ index }: { index?: number }) {
  const [active, setActive] = useState<ModuleId>(ARCHITECTURE[0].id);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const baseId = useId();
  const current = ARCHITECTURE.find((m) => m.id === active)!;
  const tabId = (id: ModuleId) => `${baseId}-tab-${id}`;
  const panelId = `${baseId}-panel`;

  const select = (i: number) => {
    const n = ARCHITECTURE.length;
    const next = (i + n) % n;
    setActive(ARCHITECTURE[next].id);
    tabs.current[next]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>, i: number) => {
    const moves: Record<string, number> = {
      ArrowDown: i + 1,
      ArrowRight: i + 1,
      ArrowUp: i - 1,
      ArrowLeft: i - 1,
      Home: 0,
      End: ARCHITECTURE.length - 1,
    };
    if (!(e.key in moves)) return;
    e.preventDefault();
    select(moves[e.key]);
  };

  return (
    <Section tone="night" id="architecture" aria-labelledby="architecture-title">
      <Container>
        <SectionHeader
          id="architecture-title"
          index={index}
          label="Inference architecture"
          title="Three components between the text and the audio."
          aside="Everything else is the unmodified base model. Hover or select a component to see what it does, what it costs and how it is measured."
        />

        <div className="mt-12 grid border-t border-night-rule lg:mt-16 lg:grid-cols-12">
          <LayoutGroup id="architecture">
            <div
              role="tablist"
              aria-orientation="vertical"
              aria-label="System components"
              className="flex flex-col lg:sticky lg:top-24 lg:col-span-4 lg:self-start"
            >
              {ARCHITECTURE.map((m, i) => {
                const on = m.id === active;
                return (
                  <button
                    key={m.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(m.id)}
                    aria-labelledby={`${tabId(m.id)}-label`}
                    aria-describedby={`${tabId(m.id)}-meta`}
                    aria-selected={on}
                    aria-controls={panelId}
                    tabIndex={on ? 0 : -1}
                    onClick={() => setActive(m.id)}
                    onKeyDown={(e) => onKeyDown(e, i)}
                    onPointerEnter={(e) => {
                      if (e.pointerType === "mouse") setActive(m.id);
                    }}
                    className={`relative flex w-full cursor-pointer flex-col gap-2 border-b border-night-rule py-6 pr-4 pl-6 text-left transition-colors duration-200 focus-visible:-outline-offset-4 md:pr-6 md:pl-8 lg:py-8 ${
                      on
                        ? "bg-night-raised text-night-ink"
                        : "text-night-muted hover:bg-night-raised/60 hover:text-night-ink"
                    }`}
                  >
                    {on ? (
                      <motion.span
                        layoutId="architecture-indicator"
                        aria-hidden="true"
                        className="absolute top-6 bottom-6 left-0 w-[3px] rounded-full bg-night-accent lg:top-8 lg:bottom-8"
                        transition={{ duration: 0.45, ease }}
                      />
                    ) : null}
                    <span className="meta flex items-baseline justify-between gap-4">
                      <span className="tabular-nums">{pad(i + 1)}</span>
                      <span className="opacity-70">{m.stage}</span>
                    </span>
                    <span id={`${tabId(m.id)}-label`} className="text-xl tracking-[-0.02em] md:text-2xl">
                      {m.label}
                    </span>
                    <span id={`${tabId(m.id)}-meta`} className="text-[0.875rem] leading-snug opacity-70">
                      <span className="sr-only">{m.stage} · </span>
                      {m.meta}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          <div
            role="tabpanel"
            id={panelId}
            aria-labelledby={tabId(active)}
            tabIndex={0}
            className="border-b border-night-rule focus-visible:-outline-offset-4 lg:col-span-8 lg:min-h-[46rem] lg:border-l"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease }}
              >
                <ModulePanel module={current} index={ARCHITECTURE.indexOf(current) + 1} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </Container>
    </Section>
  );
}

function ModulePanel({ module: m, index }: { module: ArchitectureModule; index: number }) {
  return (
    <div className="flex flex-col gap-12 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
      <div className="flex flex-col gap-5">
        <Kicker index={index} className="text-night-muted">
          Component
        </Kicker>
        <h3 className="max-w-[20ch] text-[1.75rem] leading-[1.08] font-medium tracking-[-0.035em] text-balance md:text-4xl">
          {m.label}
        </h3>
        <p className="max-w-measure text-night-ink/70">{m.summary}</p>
      </div>

      <dl className="grid gap-x-6 gap-y-6 sm:grid-cols-3">
        {m.stats.map((s) => (
          <div
            key={s.label}
            className="flex flex-col gap-2 border-t border-night-rule pt-4 transition-colors duration-200 hover:border-night-ink/40"
          >
            <dt className="meta text-night-muted">{s.label}</dt>
            <dd className="order-first text-4xl font-medium tracking-[-0.04em] tabular-nums lg:text-5xl">
              {s.value}
            </dd>
            <dd className="text-[0.8125rem] leading-snug text-night-muted">{s.note}</dd>
          </div>
        ))}
      </dl>

      <figure className="flex flex-col gap-4">
        <figcaption className="meta text-night-muted">{m.chart.title}</figcaption>
        <ul className="flex flex-col gap-3">
          {m.chart.rows.map((row, i) => (
            <li
              key={row.label}
              className="grid grid-cols-[minmax(0,8.5rem)_1fr_4rem] items-center gap-3 md:grid-cols-[minmax(0,11rem)_1fr_4.5rem] md:gap-4"
            >
              <span className={`truncate text-[0.875rem] ${row.key ? "text-night-ink" : "text-night-muted"}`}>
                {row.label}
              </span>
              <span aria-hidden="true" className="block h-2 bg-night-rule">
                <motion.span
                  className={`block h-full origin-left ${row.key ? "bg-night-accent" : "bg-night-ink/40"}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: Math.min(1, row.value / m.chart.max) }}
                  transition={{ duration: 0.7, ease, delay: 0.1 + i * 0.05 }}
                />
              </span>
              <span className="text-right font-mono text-[0.875rem] tabular-nums">{row.display}</span>
            </li>
          ))}
        </ul>
        <p className="max-w-measure text-[0.8125rem] leading-relaxed text-night-muted">{m.chart.note}</p>
      </figure>

      <dl className="grid border-t border-night-rule sm:grid-cols-2 sm:gap-x-6">
        {m.specs.map((s) => (
          <div
            key={s.label}
            className="grid grid-cols-[6.5rem_1fr] gap-4 border-b border-night-rule py-3"
          >
            <dt className="meta pt-px text-night-muted">{s.label}</dt>
            <dd className="text-[0.9375rem] leading-snug">{s.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
