# SOC Case Workspace

> Turn messy alerts into structured SOC cases.

**SOC Case Workspace** is an educational, frontend-only investigation workspace
that models how a SOC analyst turns a raw alert into a structured,
evidence-backed case and then into a reviewable Markdown report.

## Live demo

**[Open SOC Case Workspace](https://lohetapja.github.io/SOC-Case-Workspace/)**

The app is deployed on **GitHub Pages** and runs entirely in the browser. It has
no backend, no account system, no database, no telemetry, and no external
investigation APIs. Workspace data is stored locally in browser `localStorage`.

All bundled cases, entities, evidence, indicators, hostnames, identities, and
incident narratives are **synthetic** and for learning / portfolio demonstration
only.

## What this project is

- A portfolio-friendly SOC investigation workspace for practising structured
  case analysis from alert intake to report export.
- A local-first React + TypeScript app focused on analyst workflow, not backend
  infrastructure.
- A demonstration of how evidence, timelines, decisions, findings, mappings,
  closure rationale, and report output can stay connected inside one case.
- A safe educational tool using only synthetic data.

## Who this helps

- **Junior analysts** practising how to move from alert notes to evidence-backed
  findings.
- **Senior analysts and mentors** reviewing whether a case has enough support to
  close or report.
- **Hiring managers and portfolio reviewers** looking for clear SOC / Blue Team
  reasoning, not just UI polish.
- **Lab learners** structuring sanitized BTLO / TryHackMe / CyberDefenders /
  LetsDefend-style investigations without publishing restricted answers.
- **Non-technical reviewers** who need a clean read-only case summary and
  Markdown report.

## Why local-first matters

SOC Case Workspace intentionally avoids direct SIEM, EDR, XDR, SOAR, ticketing,
cloud-sync, upload, OAuth, API-key, and automated-response integrations. The
project is about analyst reasoning and case structure, so the safer default is a
browser-only workflow with localStorage persistence.

This keeps the demo lower risk, easy to run, and suitable for synthetic data,
sanitized notes, labs, mentoring, portfolio review, and local practice.

## What this demonstrates

- **SOC case structuring** — moving from an alert summary to a case with context,
  evidence, questions, conclusions, and closure.
- **Evidence tracking** — recording artifacts and observations as concrete
  evidence rather than loose notes.
- **Timeline building** — reconstructing activity in chronological order.
- **Decision journal discipline** — documenting analyst questions, assumptions,
  answers, and rationale.
- **Findings** — writing conclusions that link back to supporting evidence and
  timeline events.
- **MITRE ATT&CK mapping** — manually mapping analyst-authored findings to a
  curated educational ATT&CK subset with rationale and confidence.
- **Closure reasoning** — recording verdict, status, impact, next action, and
  rationale.
- **Report export** — generating a clean Markdown investigation report from the
  structured case.
- **Visual investigation** — exploring relationships through Artifact Map and
  Case Graph views.
- **AI-assisted project building / documentation discipline** — the project
  includes planning docs, decision records, scoped milestones, synthetic-data
  guardrails, and a consistent build workflow.

## What this is not

- **Not a SIEM.** It does not ingest logs, run detections, or query live data.
- **Not an EDR.** It does not inspect endpoints, contain hosts, or automate
  response.
- **Not a SOAR or ticketing system.** It does not orchestrate response actions,
  assign production work, or integrate with enterprise queues.
- **Not a production incident response platform.** There is no multi-user
  workflow, authentication, backend, database, or server-side recovery.
- **Not using real incident data.** The bundled examples are synthetic and should
  not be replaced with customer, employer, or real incident material.
- **Not automated analysis.** It does not perform containment, malware
  detonation, AI triage, or automatic ATT&CK generation. The analytical reasoning
  remains human-authored.

## Suggested demo walkthrough

A focused walkthrough for a recruiter, hiring manager, or security reviewer:

1. Open **Sample Cases**.
2. Load or open a populated synthetic sample case.
3. Review **Evidence** to see the factual artifacts collected for the case.
4. Review **Timeline** to follow the reconstructed event sequence.
5. Review **Decision Journal** to see analyst questions, answers, and rationale.
6. Review **Findings** and **MITRE Mapping** to see evidence-backed conclusions
   and analyst-authored technique mapping.
7. Open **Investigation Visuals** and start with **Artifact Map** for the structured
   investigation-flow view.
8. Switch to **Case Graph** to inspect the relationship graph for the same case.
9. Open the **read-only viewer** for a clean case review format.
10. Open **Reports** and export the Markdown investigation report.

Tip: the app is local-first. You can freely edit a sample case and use
**Settings → Reset demo data** to return to a clean synthetic workspace.

## Screenshots

Screenshots are not committed yet. Recommended placeholders for the portfolio
README are below; add images under `docs/screenshots/` when captures are ready.

| View | Purpose | Placeholder |
| --- | --- | --- |
| Overview | Show the workspace landing/overview and analyst workflow framing. | `docs/screenshots/overview.png` |
| Sample Cases | Show the synthetic demo-case library. | `docs/screenshots/sample-cases.png` |
| Case Detail | Show evidence, timeline, decisions, findings, and closure in one case. | `docs/screenshots/case-detail.png` |
| Artifact Map | Show the default visual investigation flow with bottom details panel. | `docs/screenshots/artifact-map.png` |
| Case Graph | Show the relationship graph with bottom details/legend panel. | `docs/screenshots/case-graph.png` |
| Report Export | Show the live Markdown report preview/export page. | `docs/screenshots/report-export.png` |
| Settings / Export | Show JSON backup/export/import controls. | `docs/screenshots/settings-export.png` |

<!--
![Overview](docs/screenshots/overview.png)
![Sample Cases](docs/screenshots/sample-cases.png)
![Case Detail](docs/screenshots/case-detail.png)
![Artifact Map](docs/screenshots/artifact-map.png)
![Case Graph](docs/screenshots/case-graph.png)
![Report Export](docs/screenshots/report-export.png)
![Settings / Export](docs/screenshots/settings-export.png)
-->

## Key features

- Structured case intake with editable metadata, affected entities, and case
  templates.
- Synthetic sample-case library and investigation checklists for common learning
  scenarios such as phishing-to-PowerShell execution, impossible travel,
  malware / EDR alerts, suspicious admin activity, and cloud data
  sharing / exfiltration.
- Editable evidence, chronological timeline events, analyst questions, findings,
  recommendations, and analyst-authored MITRE mappings.
- Evidence and timeline references that show what supports each conclusion.
- Case Quality Review with pass, warning, and missing checks for investigation
  readiness.
- Guided Analyst Mode with static local tips for evidence, timelines, decisions,
  findings, ATT&CK mapping, closure, and reports.
- Optional lab / training mode metadata and a short local Analyst Guide for
  ethical practice investigations.
- Artifact Map and Case Graph views for exploring relationships and
  investigation flow.
- Workspace-level Evidence, Timeline, Decision Journal, and MITRE views across
  all cases.
- Optional human-reviewed Agent Contributions for pasted external analysis;
  agent output remains separate from evidence.
- Read-only case viewer for clean review.
- Live Markdown report preview with copy and `.md` download.
- JSON backup/import, documented import schema, and demo-data reset controls.
- Responsive layout with a mobile navigation drawer.
- Browser `localStorage` persistence with no accounts or server.

## Sample cases

The bundled sample cases are fully synthetic and designed to teach different
SOC / DFIR concepts:

- **Phishing to PowerShell Execution** - email delivery, Office-spawned
  PowerShell, payload uncertainty, containment.
- **Impossible Travel / Suspicious Login** - identity triage, VPN false-positive
  analysis, MFA and audit-log review.
- **Malware / EDR Alert** - endpoint execution, persistence, beaconing, scoping,
  and reimage decision.
- **Suspicious Admin Activity** - privileged-account misuse, change approval,
  mailbox discovery, and escalation.
- **Data Exfiltration / Cloud Sharing** - cloud DLP, external sharing, uncertain
  exfiltration, and limitation wording.

## Core workflow

A case moves through a structured investigation path:

**alert intake → evidence → timeline → decision journal → findings → MITRE
mapping → closure → quality review → Markdown report**

The goal is not to automate the analyst. The goal is to make the analyst's
reasoning visible, reviewable, and exportable.

## Safety / synthetic data note

- All bundled cases, entities, evidence, identities, hostnames, indicators, and
  incident narratives are synthetic.
- The app makes no investigation API calls and sends no telemetry.
- There is no authentication, account system, backend, or database.
- External agent/tool text is treated as an unverified suggestion, never as
  evidence or an automatic conclusion.
- This is an educational portfolio project, not a production
  incident-management system.

## Architecture and security boundaries

- The persisted `SocCase` object is the source of truth for evidence, timeline,
  decisions, findings, MITRE mappings, closure, recommendations, and report
  export.
- Data stays in browser `localStorage`; JSON export/import is file-based and
  user-controlled.
- Visuals, workspace pages, the read-only viewer, and Markdown reports are
  projections of the same local case data.
- The app does not collect telemetry or send investigation data to a server.
- External agent/tool text can be pasted for human review, but it is not evidence
  and never auto-closes a case.

## Roadmap

Practical next items:

- More report polish, including clearer executive-summary wording and optional
  formatting refinements.
- Accessibility pass for keyboard flow, focus states, contrast, and screen-reader
  labels.
- Optional read-only HTML export for sharing a static case summary.
- Continued Artifact Map polish for small screens, touch interaction, and
  relationship highlighting clarity.

## Current limitations

- Data is stored per browser in `localStorage`; there is no device sync,
  collaboration, or server-side recovery.
- Navigation uses local React state, so sections and cases do not have
  shareable deep links or browser-history routing.
- ATT&CK mappings are manually authored against a small educational subset, not
  generated or validated by a live MITRE service.
- Integrations with SIEM, EDR, email, identity, and threat-intelligence
  platforms are intentionally out of scope.
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
- [Import schema](docs/IMPORT_SCHEMA.md)
- [Integration guide](docs/INTEGRATION_GUIDE.md)
- [AI-assisted development guidance](AGENTS.md)

## Author

Built by **Riivo Maadla**.

- [LinkedIn](https://www.linkedin.com/in/riivo-m-43530a154/)
- [GitHub](https://github.com/Lohetapja)

## License and attribution

Educational portfolio project. Not affiliated with MITRE. "MITRE ATT&CK®" is a
registered trademark of The MITRE Corporation; this project references the
framework for educational mapping only.
