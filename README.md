# SOC Case Workspace

> Turn messy alerts into structured SOC cases.

SOC Case Workspace is an educational, frontend-only investigation workspace that
models how a SOC analyst turns a raw alert into a structured, evidence-backed
case — and finally into a defensible Markdown report.

## Live demo

**[Open SOC Case Workspace »](https://lohetapja.github.io/SOC-Case-Workspace/)**

The app is deployed to GitHub Pages from `main` via GitHub Actions. It runs
**entirely in your browser** and stores all workspace data in **localStorage** —
no install, no account, no server. Loading a synthetic sample case is the fastest
way to see it in action (see the [walkthrough](#suggested-demo-walkthrough) below).

## What this project is

- An educational, **frontend-only** workspace for practising SOC investigation
  structure end to end.
- A demonstration of how an analyst separates **evidence** from **assumptions**
  from **findings**, and ties each conclusion back to what supports it.
- A portfolio piece showing a typed, local-first React app built around real SOC
  domain vocabulary (evidence, timeline, ATT&CK mapping, closure, quality review).
- A way to produce a clean, reviewable **Markdown investigation report** from a
  messy starting alert.

## What this project is not

- **Not a SIEM, EDR, SOAR, or case-management product.** It does not ingest logs,
  detect threats, or orchestrate response.
- **Not connected to anything.** It makes no investigation API calls, performs no
  threat-intelligence lookups, and sends no telemetry.
- **Not a multi-user or production system.** There is no authentication, no
  backend, no database, and no server-side storage or recovery.
- **Not a source of real data.** All bundled content is synthetic and for learning
  only; it must not be used for real customer or incident data.
- **Not automated analysis.** It does not perform containment, malware detonation,
  AI triage, or automatic ATT&CK generation — the analytical reasoning is yours.

## The problem it solves

Security alerts often begin as disconnected facts: a process event, a sign-in, an
email, an IP address, or a detection rule. The difficult part is explaining what
happened, which evidence supports that conclusion, what remains unknown, and why
the case was classified the way it was.

SOC Case Workspace makes that reasoning visible and reviewable. It keeps facts,
questions, conclusions, ATT&CK mappings, response actions, and closure rationale
inside one case instead of leaving them as scattered notes.

## Who it is for

- SOC Analyst, Blue Team, and DFIR learners practising investigation structure.
- Junior analysts learning to separate evidence from assumptions and findings.
- Portfolio reviewers who want to see practical security-analysis thinking.
- Developers exploring a typed, local-first React workflow without backend
  infrastructure.

## Core workflow

A case moves through nine stages, and the app is organised around them:

**alert intake → evidence → timeline → analyst decisions → findings → MITRE
ATT&CK mapping → closure → quality review → Markdown report**

1. **Alert intake** — capture the alert context, affected entities, and metadata
   (optionally from a scenario template/checklist).
2. **Evidence** — record the concrete artifacts that were collected.
3. **Timeline** — reconstruct what happened, in order.
4. **Analyst decisions** — log open questions and the reasoning behind each call.
5. **Findings** — state conclusions, each linked to the evidence that supports it.
6. **MITRE ATT&CK mapping** — map analyst-authored techniques to the activity.
7. **Closure** — classify the case, summarise impact, and record the rationale.
8. **Quality review** — check the case for gaps before it is considered done.
9. **Report** — export a clean Markdown report another analyst can review.

## Key features

- Structured case intake with editable metadata, affected entities, and case
  templates.
- Investigation checklists for common scenarios such as phishing, suspicious
  PowerShell, impossible travel, malware alerts, and brute-force activity.
- Editable evidence, chronological timeline events, analyst questions, findings,
  and analyst-authored MITRE ATT&CK mappings.
- Evidence and timeline links that show what supports each analytical conclusion.
- Recommendations, response actions, closure classification, impact summary, and
  closure rationale.
- Case Quality Review with pass, warning, and missing checks for investigation
  readiness.
- Case Graph and structured Artifact Map views for exploring relationships and
  investigation flow, with relationship highlighting on hover/selection.
- Workspace-level Evidence, Timeline, Decision Journal, and MITRE views across all
  cases.
- Human-reviewed Agent Contributions for pasted external analysis; agent output
  remains separate from evidence.
- Live Markdown report preview with copy and `.md` download.
- Synthetic sample-case library, JSON backup/import, and demo-data reset controls.
- Responsive layout with a collapsible mobile navigation drawer.
- Browser localStorage persistence with no accounts or server.

## Suggested demo walkthrough

A focused ~60-second tour of the full analyst workflow:

1. [Open the live demo](https://lohetapja.github.io/SOC-Case-Workspace/).
2. Select **Sample Cases** and open a populated synthetic case.
3. Review the case’s **Evidence** — the raw artifacts that were collected.
4. Follow the reconstructed **Timeline** to see the sequence of events.
5. Read the **Analyst questions / Decision Journal** to see the reasoning and the
   open questions.
6. Inspect the evidence-backed **Findings** and the analyst-authored **MITRE
   mapping**.
7. Check **Case Quality Review** for unresolved gaps and report readiness.
8. Open **Case Graph**, then switch to the **Artifact Map** — hover or select an
   artifact to highlight what it relates to while unrelated context dims.
9. Open **Reports** and export the Markdown investigation report.

Tip: everything lives in your browser, so you can freely edit a sample case and
use **Settings → reset demo data** to return to a clean state.

## Screenshots

> _Screenshots are not yet included. The recommended set is listed below; add the
> images under `docs/screenshots/` and replace the placeholders to render them._

Recommended captures for a portfolio review:

- **Case workspace** — a populated case showing evidence, timeline, and findings.
- **Artifact Map** — a selected artifact with its related artifacts and connectors
  highlighted.
- **Case Quality Review** — pass / warning / missing readiness checks.
- **Markdown report** — the live report preview ready to export.
- **Mobile navigation** — the collapsible drawer on a small screen.

<!--
![Case workspace](docs/screenshots/case-workspace.png)
![Artifact Map](docs/screenshots/artifact-map.png)
![Case Quality Review](docs/screenshots/quality-review.png)
![Markdown report](docs/screenshots/report-export.png)
![Mobile navigation](docs/screenshots/mobile-nav.png)
-->

## Safety / synthetic data note

- All bundled cases, entities, evidence, identities, hostnames, indicators, and
  incident narratives are **synthetic**.
- The app makes no investigation API calls and sends no telemetry; it works fully
  offline once loaded.
- There is no authentication, account system, backend, or database.
- External agent/tool text is treated as an unverified suggestion, never as
  evidence or an automatic conclusion.
- This is an educational portfolio project, not a production incident-management
  system, and should not be used for real customer or incident data.

## Roadmap

Recently shipped polish:

- Artifact Map relationship highlighting and clearer, flowing connector styling.
- Responsive app shell with a collapsible mobile navigation drawer.

Possible next steps (not committed, in rough priority order):

- Search and filter across cases.
- Richer ATT&CK coverage with tactic grouping.
- Screenshots and a short recorded demo in this README.
- Only after the frontend workflow is proven: an optional backend/database for
  sync and collaboration.

The frontend-only, local-first design is intentional and remains the default; a
backend would only be added if the workflow clearly needs it.

## Current limitations

- Data is stored per browser in localStorage; there is no device sync,
  collaboration, or server-side recovery.
- Navigation uses local React state, so sections and cases do not have shareable
  deep links or browser-history routing.
- ATT&CK mappings are manually authored against a small educational workflow, not
  generated or validated by a live MITRE service.
- Integrations with SIEM, EDR, email, identity, and threat-intelligence platforms
  are intentionally out of scope.
- The app does not perform automated containment, malware analysis, AI
  investigation, or PDF export.

## Tech stack

| Concern | Implementation |
| --- | --- |
| Build tool | Vite |
| UI | React |
| Language | TypeScript |
| Persistence | Browser localStorage |
| Graph | `react-force-graph-2d` |
| Tests | Vitest |
| Deployment | GitHub Pages + GitHub Actions |
| Backend / APIs | None |

## Run locally

Requires Node.js 18+ with npm.

```bash
npm install
npm run dev
npm test
npm run build
npm run preview
```

## Project documentation

- [Product specification](docs/PRODUCT_SPEC.md)
- [Build plan](docs/BUILD_PLAN.md)
- [Architecture decisions](docs/DECISIONS.md)
- [AI-assisted development guidance](AGENTS.md)

## Author

Built by **Riivo Maadla**.

- [LinkedIn](https://www.linkedin.com/in/riivo-m-43530a154/)
- [GitHub](https://github.com/Lohetapja)

## License and attribution

Educational portfolio project. Not affiliated with MITRE. “MITRE ATT&CK®” is a
registered trademark of The MITRE Corporation; this project references the
framework for educational mapping only.
