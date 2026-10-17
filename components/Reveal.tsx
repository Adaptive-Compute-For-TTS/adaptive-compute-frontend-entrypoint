"use client";

import { motion } from "motion/react";

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * Fades and lifts its children once, the first time they scroll into view.
 * Used on section headers only, so the page doesn't animate everywhere.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -12% 0px" }}
      transition={{ duration: 0.8, delay, ease }}
    >
      {children}
    </motion.div>
  );
}
