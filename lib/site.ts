export const NAV_LINKS = [
  { href: "/listen", label: "Listen" },
  { href: "/research", label: "Research" },
  {
    href: "/benchmarks",
    label: "Benchmarks",
    children: [
      { href: "/benchmarks#leaderboard", label: "Leaderboard", meta: "4 methods · 6 metrics" },
      { href: "/benchmarks#analysis", label: "Analysis", meta: "5 findings · listening tests" },
      { href: "/benchmarks#method", label: "Method", meta: "How every number is measured" },
    ],
  },
  { href: "/about", label: "About us" },
] as const;

export const CONTACT_EMAIL = "hello@adaptive-tts.example";

export const MODEL_STATUS = {
  model: "adaptive-tts v0.3",
  lastEval: "Sep 28, 2026",
};

/** Announcement bar above the nav. Points at the newest post. */
export const ANNOUNCEMENT = {
  label: "New note",
  text: "From fewer steps to faster wall-clock",
  href: "/research",
};
