# SOC Case Workspace

> Turn messy alerts into structured SOC cases.

## Live demo

**[Open SOC Case Workspace](https://lohetapja.github.io/SOC-Case-Workspace/)**

The app is deployed to GitHub Pages from `main` through GitHub Actions. It runs
entirely in the browser and stores workspace data in localStorage.

## What it is

SOC Case Workspace is an educational, frontend-only investigation workspace. It
models how a SOC analyst turns an alert into a structured, evidence-backed case:

**alert intake → evidence → timeline → analyst decisions → findings → MITRE
ATT&CK mapping → closure → quality review → Markdown report**

It is not a SIEM or EDR. The project focuses on the analytical work between an
alert firing and an analyst producing a defensible investigation report.

## The problem it solves

Security alerts often begin as disconnected facts: a process event, sign-in,
email, IP address, or detection rule. The difficult part is explaining what
happened, which evidence supports that conclusion, what remains unknown, and why
the case was classified a certain way.

SOC Case Workspace makes that reasoning visible and reviewable. It keeps facts,
questions, conclusions, ATT&CK mappings, response actions, and closure rationale
inside one case instead of leaving them as scattered notes.

## Who it is for

- SOC Analyst, Blue Team, and DFIR learners practicing investigation structure.
- Junior analysts learning to separate evidence from assumptions and findings.
- Portfolio reviewers who want to see practical security-analysis thinking.
- Developers exploring a typed, local-first React workflow without backend
  infrastructure.

## Current features

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
  investigation flow.
- Workspace-level Evidence, Timeline, Decision Journal, and MITRE views across
  all cases.
- Human-reviewed Agent Contributions for pasted external analysis; agent output
  remains separate from evidence.
- Live Markdown report preview with copy and `.md` download.
- Synthetic sample-case library, JSON backup/import, and demo-data reset controls.
- Browser localStorage persistence with no accounts or server.

## 60-second demo path

1. [Open the live demo](https://lohetapja.github.io/SOC-Case-Workspace/).
2. Select **Sample Cases** and open a populated synthetic case.
3. Review the case’s **Evidence**.
4. Follow the reconstructed **Timeline**.
5. Read the **Analyst questions / Decision Journal**.
6. Inspect the evidence-backed **Findings** and analyst-authored **MITRE mapping**.
7. Check **Case Quality Review** for unresolved gaps and report readiness.
8. Open **Case Graph**, then switch to **Artifact Map** to inspect relationships.
9. Open **Reports** and export the Markdown investigation report.

## Safety and educational use

- All bundled cases, entities, evidence, identities, hostnames, indicators, and
  incident narratives are synthetic.
- The app makes no investigation API calls and sends no telemetry.
- There is no authentication, account system, backend, or database.
- External agent/tool text is treated as an unverified suggestion, never as
  evidence or an automatic conclusion.
- This is an educational portfolio project, not a production incident-management
  system, and should not be used for real customer or incident data.

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
