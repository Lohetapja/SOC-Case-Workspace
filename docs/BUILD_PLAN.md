# Build Plan — SOC Case Workspace

A milestone-by-milestone build order. **One milestone at a time.** After each
milestone: stop, report what changed, and confirm the next step before
continuing. The goal is steady, reviewable progress — not a big-bang build.

Legend: ☐ not started · ◐ in progress · ☑ done

---

## Current status — completed

The MVP and an extensive post-MVP layer are shipped, built, and deployed. Done:

- **Core case workflow** — case list/create, case detail workspace, editable case context.
- **Investigation sections** (all editable) — Evidence, Timeline, Decision Journal,
  Findings, MITRE Mapping, Closure classification.
- **Markdown report export** — live preview, copy, and download.
- **Visual investigation** — Artifact Map (default) and Case Graph.
- **Workspace-level pages** — cross-case Evidence, Timeline, Decision Journal, MITRE.
- **Read-only case viewer** — clean, shareable, mobile-friendly case view.
- **Sample cases + templates/checklists** — guided demo library and starter content.
- **Selective export / import + workspace snapshots** — versioned backups, per-case selection.
- **GitHub Pages deployment** — GitHub Actions build + deploy.

The detailed milestone and post-MVP entries below remain the source of truth.

---

## Milestone 0 — Documentation & planning  ☑
**Goal:** Define the product, scope, and build order before writing code.
**Deliverables:**
- `README.md`, `docs/PRODUCT_SPEC.md`, `docs/BUILD_PLAN.md`, `docs/DECISIONS.md`,
  `CLAUDE.md`, and `AGENTS.md`.
**Acceptance:** MVP, non-goals, safety/privacy, and build order are written down
and internally consistent.

---

## Milestone 1 — Project scaffold + Case list & create  ☑
**Done:** Vite/React/TS scaffold + layout; core data model
(`src/types/domain.ts`) and three synthetic sample cases (`src/data/demoCases.ts`);
typed `localStorage` helper (`src/utils/storage.ts`) and case store
(`src/data/casesStore.ts`) seeded from the demo data; `useCases` hook; case list,
create-case form, and delete. Verified: `npm run build` passes and the dev server
serves the app.
**Goal:** A running app that can create and list cases, persisted locally.
**Deliverables:**
- Vite + React + TypeScript app scaffolded.
- Basic app shell / layout with project name and "educational tool" notice.
- `localStorage` persistence helper.
- Case list view + create-case form (title, summary, source, severity, status).
**Acceptance:** Can create a case, see it in the list, reload the page, and the
case is still there. `npm run dev` works; README "Getting started" updated.

---

## Milestone 2 — Case detail workspace  ☑
**Done:** Clicking a case opens a detail workspace via shared
`activeCaseId` state in `App` (no router). Header fields (title, status, severity,
source, owner, created/updated) plus read-only sections for summary, affected
entities, evidence, timeline, analyst questions, findings, MITRE mappings, and
recommendations. "Back to Cases" returns to the list; an "Open Case Graph" link
opens the graph for the same case. Cards are clickable except the Delete button.
Core metadata, affected entities, and recommendations were made editable in a
later post-MVP milestone.
**Goal:** Open a single case and view all of its sections.

---

## Milestone 3 — Evidence board  ☑
**Done:** The Evidence section in the case detail workspace supports listing,
adding, editing, and removing items (title, type, source, observed-at,
description). Persisted through `useCases().updateCase` → localStorage; the case
detail and visual views reflect the changes. Helpers: `createEvidenceItem`,
`updateEvidenceItem`, `updateCase`.
**Goal:** Attach evidence to a case.

---

## Milestone 4 — Timeline builder  ☑
**Done:** The Timeline section in the case detail workspace is editable — events
render sorted chronologically and can be added, edited, or removed (title,
timestamp, phase, description, optional related-evidence link). Persisted through
`useCases().updateCase` → localStorage; the case detail and Case Graph reflect
the changes. Added an optional `phase` field to `TimelineEvent`. Helpers:
`createTimelineEvent`.
**Goal:** Reconstruct the sequence of events.

---

## Milestone 5 — Analyst questions / decision journal  ☑
**Done:** The Analyst questions section in the case detail workspace is editable —
list questions with status chips; add, edit, or remove entries (question, status
open/answered/not-applicable, answer/decision, rationale). Persisted
through `useCases().updateCase` → localStorage. Open questions feed the Artifact
Map's "Investigation gaps" panel (fallback list when none). Added a
`not_applicable` `QuestionStatus`. Helper: `createAnalystQuestion`.
**Goal:** Capture reasoning.

**Findings (editable):** the Findings section in the case detail workspace is also
editable — evidence-backed conclusions with title, category, severity/impact,
confidence, status (draft/confirmed/rejected), description, and selectable
supporting evidence + related timeline events. Persisted via `updateCase` →
localStorage; new findings appear in the Artifact Map. Optional `category`,
`severity`, `status`, `relatedTimelineEventIds` added to `Finding`. Helper:
`createFinding`.

---

## Milestone 6 — MITRE ATT&CK mapping  ☑
**Done:** The MITRE section in the case detail workspace is editable — list,
add, edit, or remove mappings (technique ID, name, tactic, confidence, rationale,
selectable supporting findings + evidence). Analyst-authored and
evidence-backed; persisted via `updateCase` → localStorage. New mappings appear
in the Case Graph and Artifact Map automatically. Added optional
`relatedFindingIds` to `MitreMapping`. Helper: `createMitreMapping`.
**Goal:** Map findings to techniques with rationale and confidence.

---

## Milestone 7 — Closure classification  ☑
**Done:** Editable "Classification & closure" section in the case detail
workspace — classification (true/benign-true/false positive, suspicious,
undetermined), closure status (open/monitoring/escalated/closed), rationale,
recommended next action, and impact summary. Can be filled progressively (no need
to close first); persisted via `updateCase` → localStorage. Surfaced as chips in
the detail header and in the Case Graph / Artifact Map header. Reworked
`CaseClosure` to all-optional richer fields + `ClosureStatus`. Helpers:
`buildClosure`. Recommendations were made editable in a later post-MVP milestone.
**Goal:** Reach and record a verdict.

---

## Milestone 8 — Markdown report export  ☑
**Done:** The Reports page exports a case as a clean Markdown investigation report
(title, metadata, executive summary, status & classification, entities, evidence,
timeline, decision journal, findings, MITRE mapping, recommendations, closure
rationale, limitations/missing evidence, synthetic-data disclaimer). Evidence-
backed: findings cite supporting evidence, mappings include rationale + confidence,
open questions feed the missing-evidence section (fallback list when none). Live
read-only preview, Copy Markdown, and Download `.md` (safe `soc-report-<slug>-<date>.md`
filename) — dependency-free, no external services. Pure generator in
`src/utils/caseReport.ts`; an "Export report" link in the case detail opens it.
**Goal:** Produce the deliverable.

---

## Milestone 9 — Case Graph view (read-only)  ☑
*Added ahead of the later milestones as a visualization feature.*
**Done:** An Obsidian-inspired, force-directed graph of a single case
(`react-force-graph-2d`). Nodes for the case, affected entities, evidence,
timeline events, findings, MITRE mappings, and recommendations; links reflect
investigation relationships (case→records, evidence→finding, finding/evidence→
MITRE, timeline→evidence, evidence→entity). Click-to-inspect detail panel, dark
minimal styling, zoom/pan, read-only, and a case selector that defaults to the
first stored case. Pure transform in `src/utils/caseGraph.ts`. Verified
in-browser; `npm run build` passes.
**Pinned layout:** nodes can be dragged to pin them (fx/fy on drag-end); pinned
positions persist per case in localStorage (`src/utils/graphLayout.ts`) and are
restored on reopen, with a "Reset layout" button to clear a case's positions and
re-run the layout.

---

## Milestone 10 — Artifact Map (read-only)  ☑
*Second visual mode, alongside the Case Graph (tabs in the same section).*
**Done:** A structured, investigation-flow view grouping a case's artifacts into
lanes (Identity → Delivery → Execution → Network → Detection → Response). Plain
React/CSS layout with a light SVG edge layer (no graph library). Artifact cards by
type (user, host, email, file, process, destination, detection, finding, MITRE,
response); clickable cards (details: type, title, description, timestamp, related
evidence, connections) and clickable relationship edges (label, source → target,
supporting evidence); an "Investigation gaps" panel sourced from open analyst
questions, with a synthetic fallback list. Pure transform in
`src/utils/artifactMap.ts`; reuses the active case + selector; read-only. Verified
in-browser; `npm run build` passes.

---

## Post-MVP

- ☑ **Data management (Settings)** — Export cases as a versioned JSON backup,
  Import (validate + replace, with confirmation), Reset demo data, and Clear local
  data. `src/pages/SettingsPage.tsx` + helpers in `src/data/casesStore.ts`.
- ☑ **Case templates / investigation checklists** — five built-in synthetic
  templates (`src/data/caseTemplates.ts`). Creating a case from a template prefills
  starter analyst questions, draft (low-confidence) MITRE mappings, and a grouped
  investigation checklist (evidence / timeline / findings / closure). Checklist
  state persists on the case (`ChecklistItem` on `SocCase`); `ChecklistSection`
  shows it in the detail workspace.
- ☑ **Sample case library / guided demo** — `src/pages/SampleCasesPage.tsx` with a
  "How to explore this demo" walkthrough and three fully-populated synthetic
  samples (Phishing → PowerShell, Impossible Travel, Malware / EDR Alert). Each can
  be added to the workspace (duplicate-safe via `useCases().addSampleCase`) and
  opened. The three samples also seed the workspace on first run.
- ☑ **Cross-case workspace pages** — the Evidence, Timeline, Decision Journal, and
  MITRE Mapping sidebar pages are real read-only views across all cases (search +
  filters + an "Open case" action), replacing the old placeholders. Timeline is
  chronological; Decision Journal lists open questions first; MITRE is framed as
  analyst-authored (not automatic detections) with technique/tactic/confidence/
  rationale + supporting findings & evidence. Shared `WorkspaceFilters` component;
  reuses case data + `openCaseDetail` navigation (no new storage).
- ☑ **Case context navigation repair** — Case Graph / Artifact Map and Reports
  expose an "Open selected case" action. Case-selector changes update the shared
  active case, the action returns to that case's detail workspace, and an empty
  workspace falls back safely to the Cases list (no routing dependency).
- ☑ **Case Quality Review / investigation readiness** — advisory pass, warning,
  and missing checks in the case detail workspace cover context, evidence and
  timeline/reference integrity, unresolved questions, evidence-backed findings,
  ATT&CK rationale/references, agent-review state, closure reasoning, next actions,
  and report availability. The review evaluates canonical case data and never
  blocks report export.
- ☑ **Agent Contributions / external analysis import** — optional pasted analysis
  is stored on the case with source/tool, contribution type, optional confidence,
  human review status, and evidence links. Agent output is explicitly not evidence,
  never auto-promotes into canonical findings/mappings/recommendations/reports or
  closure. Quality Review only flags unreviewed/unevidenced contributions; accepted
  text can be copied for manual analyst entry and validation.
- ☑ **Editable case context, affected entities, and recommendations** — core
  metadata can be revised in the case workspace; affected entities and response
  recommendations can be added/removed and persist through the existing case
  aggregate. New records feed quality checks, visual maps, and report export.
- ☑ **Focused tests and CI hardening** — Vitest protects quality review, Markdown
  reports, reference cleanup, graph/map transforms, import/export validation, and
  bundled sample-case shape. GitHub Pages CI runs tests before the production build.
- ☑ **UX rough-edge cleanup** — navigation copy, actionable empty states, form and
  data-management feedback, destructive confirmations, reference-safe deletion,
  and small action-alignment inconsistencies were polished without changing scope.
- ☑ **Value clarity pass** — the Overview now explains the alert-to-report workflow,
  provides a direct 60-second demo path, and uses clearer analyst guidance. Markdown
  reports now read as investigation summaries and only list gaps actually recorded
  on the case.
- ☑ **Mobile layout + read-only case viewer** — the app shell now has a mobile
  menu/drawer with responsive header/sidebar/footer behavior. Case detail can
  open a clean, read-only, mobile-friendly case view with metadata, entities,
  evidence, timeline, decisions, findings, MITRE mappings, recommendations,
  closure rationale, and Markdown copy/download actions generated from local
  browser data.
- ☑ **Default Artifact Map + workspace snapshots** — the visual investigation
  area now opens Artifact Map first, with Case Graph second and pinned layouts
  preserved. Settings can export/import replayable workspace snapshots containing
  cases, graph layout positions, and app-level settings placeholders, while still
  accepting older case-only backups.
- ☑ **Responsive Artifact Map + selective workspace export** — Artifact Map keeps
  the lane flow readable on smaller screens by moving details/gaps below the map,
  while hover/selection highlighting clarifies relationships. Settings can export
  the full workspace, one selected case, or multiple selected cases, with optional
  graph-layout and sample-case inclusion.
- ☑ **Artifact Map bottom details panel** — Artifact Map now uses the full
  available width for the lane map, with artifact/relationship details, helper
  text, and Investigation Gaps in a bottom panel across desktop and mobile.
- ☑ Seed / demo synthetic cases for first-run experience (loadCases seeds demo).

---

## Next — prioritized milestones

These refine already-shipped features; do them in order, one at a time.

1. ☐ **Artifact Map mobile layout & relationship highlighting polish** — refine the
   Artifact Map on small screens (lane readability, touch interaction) and sharpen
   hover/selection highlighting so a selected artifact plus its related artifacts and
   connectors stand out while unrelated context is dimmed.
2. ☐ **Mobile sidebar / responsive app shell** — polish the responsive shell: the
   sidebar drawer behaviour, header/menu, and overall breakpoints on phones/tablets.
3. ☐ **README screenshots & demo walkthrough polish** — add screenshots and a tighter
   guided walkthrough so visitors understand the app at a glance.

### Parking lot (not scheduled)
- Search & filter across cases.
- Richer ATT&CK coverage and tactic grouping.
- Only after the frontend workflow is proven: optional backend/database.
