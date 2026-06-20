# SOC Case Workspace

> Turn messy alerts into structured SOC cases.

**SOC Case Workspace** is an educational portfolio project that models how a
Security Operations Center (SOC) analyst structures an investigation — from
alert intake, through evidence and timeline reconstruction, to evidence-backed
findings, ATT&CK mapping, and a final exportable report.

It is **not** a SIEM, EDR, or live security tool. It is a thinking and
documentation workspace that demonstrates the *analytical workflow* of incident
triage and investigation using synthetic data only.

---

## Why this project exists

Most SOC tooling focuses on detection and data collection. The harder,
less-visible skill is **investigative reasoning**: taking a noisy alert and
turning it into a defensible, well-documented case with a clear verdict.

This project makes that reasoning process explicit and reviewable:

- How is an alert triaged into a case?
- What evidence supports or refutes the hypothesis?
- What is the order of events?
- What questions did the analyst ask, and what did they decide?
- Which ATT&CK techniques are in play, and with what confidence?
- How was the case classified at closure, and why?
- What does the final report look like?

---

## Status

**Milestone 1 — App skeleton (in progress).** The Vite + React + TypeScript app
is scaffolded with the header, sidebar navigation, main area, and placeholder
sections for every stage. No case logic is built yet. See
[docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) for the build order.

> Building/running requires [Node.js](https://nodejs.org/) 18+ (with npm).

---

## MVP scope

A **frontend-first**, single-user, local-only web app with these features, built
in order:

1. **Case list & create-case form** — intake an alert as a structured case.
2. **Case detail workspace** — the working surface for one case.
3. **Evidence board** — collect and annotate evidence items.
4. **Timeline builder** — order events into a coherent narrative.
5. **Analyst questions / decision journal** — record open questions and decisions.
6. **MITRE ATT&CK mapping** — map findings to techniques with rationale & confidence.
7. **Closure classification** — assign a final verdict (e.g. true/false positive).
8. **Markdown report export** — generate a clean, shareable case report.

See [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) for the full specification.

---

## Non-goals (explicitly out of scope for MVP)

- ❌ No SIEM clone
- ❌ No EDR integration
- ❌ No live Sentinel / Defender / Splunk APIs
- ❌ No automated containment or response actions
- ❌ No malware analysis or sandboxing
- ❌ No AI auto-investigation
- ❌ No multi-user collaboration
- ❌ No backend or database until the frontend workflow is proven

---

## Safety & privacy

- **Synthetic data only.** No real alerts, logs, hostnames, IPs, user accounts,
  or customer data of any kind. All demo content is fabricated.
- **No network calls.** The MVP makes no external API requests and sends no
  telemetry. Everything runs locally in the browser.
- **No authentication, no accounts.** This is a single-user local tool.
- **Local persistence only.** Data is stored in browser `localStorage`. Clearing
  browser storage erases all cases. This is intentional for the MVP.
- This is a **learning artifact**, not a production security product. It must not
  be used to manage real incidents.

---

## Tech stack (planned)

| Concern        | Choice                          |
| -------------- | ------------------------------- |
| Build tool     | Vite                            |
| UI framework   | React                           |
| Language       | TypeScript                      |
| Persistence    | Browser `localStorage` (MVP)    |
| Backend        | None (yet)                      |

See [docs/DECISIONS.md](docs/DECISIONS.md) for the reasoning behind these choices.

---

## Getting started

Requires **Node.js 18+** (ships with npm).

```bash
npm install      # install dependencies
npm run dev      # start the dev server (prints a http://localhost URL)
npm run build    # type-check and produce a production build in dist/
npm run preview  # preview the production build locally
```

---

## Documentation

- [docs/PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md) — what we are building and why.
- [docs/BUILD_PLAN.md](docs/BUILD_PLAN.md) — the ordered milestone plan.
- [docs/DECISIONS.md](docs/DECISIONS.md) — architecture decision record.
- [CLAUDE.md](CLAUDE.md) — working guidance for AI-assisted development.

---

## License & use

Educational portfolio project. Not affiliated with MITRE. "MITRE ATT&CK®" is a
registered trademark of The MITRE Corporation; this project references the
framework for educational mapping only.
