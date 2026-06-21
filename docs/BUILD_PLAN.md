# Build Plan — SOC Case Workspace

A milestone-by-milestone build order. **One milestone at a time.** After each
milestone: stop, report what changed, and confirm the next step before
continuing. The goal is steady, reviewable progress — not a big-bang build.

Legend: ☐ not started · ◐ in progress · ☑ done

---

## Milestone 0 — Documentation & planning  ☑
**Goal:** Define the product, scope, and build order before writing code.
**Deliverables:**
- `README.md`, `docs/PRODUCT_SPEC.md`, `docs/BUILD_PLAN.md`, `docs/DECISIONS.md`,
  `CLAUDE.md`.
**Acceptance:** MVP, non-goals, safety/privacy, and build order are written down
and internally consistent.

---

## Milestone 1 — Project scaffold + Case list & create  ☑
**Done:** Vite/React/TS scaffold + layout; core data model
(`src/types/domain.ts`) and two synthetic demo cases (`src/data/demoCases.ts`);
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
**Done (read-only):** Clicking a case opens a detail workspace via shared
`activeCaseId` state in `App` (no router). Header fields (title, status, severity,
source, owner, created/updated) plus read-only sections for summary, affected
entities, evidence, timeline, analyst questions, findings, MITRE mappings, and
recommendations. "Back to Cases" returns to the list; an "Open Case Graph" link
opens the graph for the same case. Cards are clickable except the Delete button.
Inline editing of fields is intentionally deferred to a later milestone.
**Goal:** Open a single case and view all of its sections.

---

## Milestone 3 — Evidence board  ☑
**Done:** The Evidence section in the case detail workspace is editable — list
existing items, add via a small form (title, type, source, observed-at,
description), and remove. Persisted through `useCases().updateCase` → localStorage;
the case detail and Case Graph reflect the changes. Inline editing of existing
items is deferred. Helpers: `createEvidenceItem`, `updateCase`.
**Goal:** Attach evidence to a case.

---

## Milestone 4 — Timeline builder  ☑
**Done:** The Timeline section in the case detail workspace is editable — events
render sorted chronologically; add via a small form (title, timestamp, phase,
description, optional related-evidence link) and remove. Persisted through
`useCases().updateCase` → localStorage; the case detail and Case Graph reflect
the changes. Added an optional `phase` field to `TimelineEvent`. Helpers:
`createTimelineEvent`.
**Goal:** Reconstruct the sequence of events.

---

## Milestone 5 — Analyst questions / decision journal  ☑
**Done:** The Analyst questions section in the case detail workspace is editable —
list questions with status chips; add via a small form (question, status
open/answered/not-applicable, answer/decision, rationale) and remove. Persisted
through `useCases().updateCase` → localStorage. Open questions feed the Artifact
Map's "Investigation gaps" panel (fallback list when none). Added a
`not_applicable` `QuestionStatus`. Helper: `createAnalystQuestion`.
**Goal:** Capture reasoning.

---

## Milestone 6 — MITRE ATT&CK mapping  ☐
**Goal:** Map findings to techniques with rationale and confidence.
**Deliverables:**
- Embedded curated subset of ATT&CK tactics/techniques (static data).
- Add mappings (technique, rationale, confidence) to a case.
**Acceptance:** Mappings persist and show technique ID + name, rationale, confidence.

---

## Milestone 7 — Closure classification  ☐
**Goal:** Reach and record a verdict.
**Deliverables:** Classification UI (verdict, closing summary, justification);
case status reflects closure.
**Acceptance:** A case can be closed with a verdict and reopened/edited.

---

## Milestone 8 — Markdown report export  ☐
**Goal:** Produce the deliverable.
**Deliverables:** Generate Markdown combining all sections; copy + download.
**Acceptance:** Exported report is coherent and includes every populated section.

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

## Post-MVP (not scheduled — parking lot)
- Seed / demo synthetic cases for first-run experience.
- Import/export cases as JSON (backup/sharing).
- Search & filter across cases.
- Richer ATT&CK coverage and tactic grouping.
- Only after the frontend workflow is proven: optional backend/database.

> Anything in the parking lot is **out of scope** until the MVP (M1–M8) is
> complete and reviewed.
