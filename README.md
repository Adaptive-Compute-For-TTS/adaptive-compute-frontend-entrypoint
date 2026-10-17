# Adaptive TTS: adaptive inference for text-to-speech (template)

Next.js 16 (App Router, TypeScript), Tailwind v4, Motion, Geist. Everything is placeholder content; the demo mocks playback (no audio, no backend).

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
```

- Design tokens: `app/globals.css` (from `CLAUDE.md`)
- Placeholder copy and data: `lib/content.ts`, `lib/site.ts`
- Mock model (word timings and per-frame step schedules): `lib/speech.ts`
- Headline numbers shared by the metrics strip, leaderboard and demo: `STEP_BUDGET` in `lib/content.ts`
- Layout references: `docs/references.md`
