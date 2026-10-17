"use client";

import { MotionConfig } from "motion/react";

/** Motion respects the OS reduced-motion setting site-wide. */
export function Providers({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
