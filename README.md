# Zana Labs

Test pages and prototypes for Zana, served at try.zana.fit. A sandbox: no pull requests, no checks. Pushes to main go live in about a minute.

- `kit/zana.css`: Zana's look (Dev Docs/Phoenix/Frontend/DESIGN_2026-10-22_look).
- `kit/labs.js`: test declaration and KPIs, tracking, the tester's saved data, the test strip with Feedback and Start over.
- `kit/config.js`: the PostHog project key. Empty means nothing is tracked.
- A test is a folder with `index.html` that calls `labs.test({ name, question, kpis })`. No KPIs, no tracking.
- `p/`: prototypes, copied as they are. Not tracked.

Nothing here touches the real app or real data.

## Links straight into a page

- A page: `/workouts/`, `/p/settings/`
- Workout Writer options, combined freely:
  - `?day=thu` (or `today`, or `2026-11-12`) opens that day
  - `&start=crossfit` (or `bodybuilding`, `yoga`, `blank`) fills that day with an example first
  - `&tab=members` opens on Members see (phone)
  - `&intro=0` skips the welcome card
  - `&t=leo` names the tester in the results
- Example: `/workouts/?day=thu&start=blank&intro=0&t=leo`

## Three ways to write (`/write/`)

- `/write/` all three with the switch, filled with an example (for review)
- `?v=day` One board per day · `?v=part` One board per part · `?v=field` One field per item: one version, no switch, blank day, the tester task
- `&start=filled` or `&start=blank` overrides the starting day; `&t=leo` names the tester

## Guided test (`/write/try/`)

The link to send coaches: `zana-labs.onrender.com/write/try/?t=leo` (or without `?t=` for anonymous).
Three rounds; each round the coach writes one part she'd really program, in her own words, a different way each round (order random per coach). After each round: "How natural did that feel?" (1 to 5) and an optional note. At the end: "Which way would you use?" with her own three parts as reminders, and "What did we miss?"
Speed is only ever compared within one coach, never across coaches. `&restart` starts over.
