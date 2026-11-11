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
