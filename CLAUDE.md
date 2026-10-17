# CLAUDE.md — Adaptive TTS Site

## The task
Build the public website for an **adaptive text-to-speech (TTS) research project**: a landing page with strong UI, plus a few inner pages. The project tests and evaluates adaptive TTS, meaning speech that changes with context, listener and content. The site should present it the way a research lab would.

**Inspiration:** https://andonlabs.com/ and https://www.proximal.ai/. Take the vibe from them without copying either one. The result must feel like *our* lab.

**Working style the user asked for:**
- Don't hand-roll UI from scratch. Source components and patterns first (Mobbin for references, 21st.dev for components), then restyle them to our tokens.
- Freedom to choose a style and have fun, but stay inside the design system below.

## Stack (default, confirm before scaffolding)
Next.js (App Router, TypeScript), Tailwind CSS, `lucide-react` (sparingly), Geist + Geist Mono via `next/font`.

---

## What the references actually look like (observed 2026-10-02)

| | Andon Labs | Proximal |
|---|---|---|
| Canvas | Warm off-white/cream, white body | Near-black `#0A0A0A`, light text `#ECECEC` / `#D6D6D6` |
| Display font | Suisse Intl, weight 400, **tight negative tracking** (h1 60px / -3px, h2 36px / -1.8px) | Neue Haas Grotesk, weight 400, h1 72px / lh 1.0 |
| Labels/nav | Sans, 12px, 50%-opacity ink | **ABC Diatype Mono, 12px, uppercase, +1.44px tracking** |
| Accent | Deep forest green (announcement bar, Pion block) | Basically none, monochrome |
| Hero | Declarative claim on the left, documentary product photo (a lamp) on the right | Huge statement only, no image, then a long prose thesis at ~39px |
| Evidence | Logo strip (Anthropic/OpenAI/DeepMind), deployments, eval cards with top model, dated publications list | Blog rows (category + read time + title + summary + "Read more →"), 10-row leaderboard (#, Model, Score) |
| Hiring | "Join the Lab" in nav | One line, "View open roles →" |

Shared DNA: regular-weight (not bold) grotesk headlines, generous whitespace, text-arrow links instead of big buttons, numbers and dates used as content.

> Note: the playbook PDF says to use an off-white canvas for both. In reality Proximal is dark. We pick one (see below) rather than mixing them.

---

## Our direction: ~65% Proximal / 35% Andon, with audio as the hero artifact
TTS is a research and evaluation topic, so lead editorially like Proximal. Andon's "real-world evidence" becomes **playable audio**: samples, A/B comparisons and listening-test results. **Listening is our documentary imagery.**

**Signature element:** a restrained, monochrome waveform/audio row component (play ▸, mono metadata such as `VOICE · CONTEXT · 0:12`, thin rules). Reuse it everywhere instead of decorative imagery.

## Design tokens (inherit, don't improvise)
- **Color:** bg `#F4F2EC` · ink `#101316` · muted `#5E656B` · rules `#D8D6CF` · **one** accent, pale green `#B8F5D4` *or* pale blue `#C9D6FF` (pick one and never both). Optional dark theme modeled on Proximal: bg `#0A0A0A`, ink `#ECECEC`.
- **Type:** Display Geist 400 with negative tracking (~-0.04em on hero). Hero 64–96px, line-height 0.95–1.02. H2 36–52px. Body 17–20px. Meta 11–13px **Geist Mono uppercase, tracked +0.1em**. Use tabular numbers in tables.
- **Spacing:** 4px base · gutters 24/48/64 · section Y 96–144px · element gap 16–32px · prose measure 620–760px.
- **Surfaces:** radius 0–10px · 1px neutral borders · shadows ~never · no nested cards · background shifts only to mark major sections.

## Hard rules
**Do:** evidence first · large headlines with narrow prose · full-width rows over card grids · one primary CTA per section, usually a text arrow link · metadata labels (`BENCHMARK`, `SAMPLE`, `PAPER`, `DATE`).
**Don't:** gradient blobs or glassmorphism · ElevenLabs-style glowing 3D waves · 3-column feature cards by default · pill badges everywhere · animating every section · AI sci-fi art.
**Litmus test:** remove the shadows, gradients, icons and animation. If the page falls apart, the composition is weak.

---

## Sitemap (proposed, confirm with user)
1. **Home:** blueprint below.
2. **Listen / Demo:** interactive adaptive-TTS playground: text in, context/listener controls, and the same sentence rendered under different conditions.
3. **Evals:** benchmark leaderboard plus listening-test (MOS / preference) results, with method notes.
4. **Research / Writing:** index of posts (category · read time · date · title · one-line summary · →) and a post template.
5. **About / Join:** thesis, team, one hiring paragraph and one link.

## Homepage blueprint
01 Nav: wordmark left, 3–5 links right (Listen · Evals · Research · Join)
02 Hero: one thesis of 8–13 words plus ≤55-word paragraph (e.g. *"Speech that adapts to who is listening."*, placeholder)
03 Proof strip: 1–3 metrics or credibility markers
04 Featured work: the A/B adaptive sample player (the flagship artifact)
05 Research index: 3–5 rows
06 Benchmark: one clean leaderboard/table. Numbers are part of the brand.
07 Field note: a spectrogram, system diagram or eval-harness screenshot
08 Join: one paragraph, one link
09 Footer: email, legal, minimal nav

---

## Tooling workflow

### Mobbin (MCP connected): references, not code
Mobbin returns **screenshots of real sites**. Use it to decide *layout and pattern* before building, then implement against our tokens. Never copy a brand's look.
- `search_sections` (web): best fit for a landing page. Good queries: "text-to-speech hero with interactive voice demo", "AI model leaderboard table", "research blog index list with categories and read time", "minimal footer with hiring line", "audio sample player list".
- `search_screens`: for app-like pages (playground controls, audio player states).
- `search_flows`: multi-step journeys (e.g. trying a demo, then signing up).
- Workflow: search, then pick 1–2 references per section, then note *what to borrow* (structure, spacing, interaction), then build with tokens. Cite via `mobbin_url`; image URLs expire after 30 days.
- Useful finds so far: ElevenLabs TTS API demo card (`https://mobbin.com/sites/sections/81b76dd7-5da7-4ac6-9292-c87381d07dc0`), a good structure for an inline demo, but restyle it flatter.

### 21st.dev (not installed yet): component quarry
Setup: `npx @21st-dev/cli init --client claude --write`. Free tier: search is free, ~2 installs/day, so spend installs on high-value pieces.
Search by visual job: "minimal editorial hero monochrome oversized typography", "minimal navbar thin border research lab", "editorial project list index rows arrow hover", "minimal leaderboard table monospace metrics", "subtle text reveal split text no gradient", "minimal lab footer hiring contact". Show 3–5 candidates before installing. Take only the interaction, normalize it to our tokens, then delete ~30% of its decoration.

## Build loop (don't accept pass one)
A Structure (wireframe, no effects) → B Direction (try 65/35 and the inverse) → C Component search (Mobbin + 21st) → D Implement (tokens global, one page end-to-end) → E Render → F Critique (what's generic, crowded, too rounded, too animated?) → G Subtract 20–30% → H Lock patterns into components.

**Visual QA:** render 1440 / 1024 / 768 / 390 in the browser pane. Check hierarchy, line length, rhythm, overflow and table usability on mobile. Iterate at least twice.

## Ship checklist
- Thesis understood in 5 seconds? Real evidence (audio, numbers) before feature claims?
- Fewer than 3 accents above the fold? Does every card need to be a card?
- Is body and meta text readable at 390px? Do tables work on mobile?
- Does motion explain something rather than decorate? Does it still look intentional with no images?
- Does it feel like our lab, not a clone?

## Open questions for the user
- Project/lab name and the one-sentence thesis
- What "adaptive" means here (listener, context, emotion, environment?) and which real samples or metrics exist
- Light (Andon-warm) vs dark (Proximal) as the default theme
- Pale green vs pale blue accent
