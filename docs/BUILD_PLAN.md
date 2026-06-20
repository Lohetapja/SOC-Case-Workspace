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

## Milestone 2 — Case detail workspace  ☐
**Goal:** Open a single case and edit its core fields.
**Deliverables:**
- Routing (or view-switching) into a case detail page.
- Display + edit of case metadata.
- Section placeholders for evidence, timeline, journal, ATT&CK, closure.
**Acceptance:** Can navigate from list → detail → back; edits persist.

---

## Milestone 3 — Evidence board  ☐
**Goal:** Attach evidence to a case.
**Deliverables:** Add / edit / remove evidence items (type, value, source, note).
**Acceptance:** Evidence persists per-case and survives reload.

---

## Milestone 4 — Timeline builder  ☐
**Goal:** Reconstruct the sequence of events.
**Deliverables:** Add timeline events (timestamp, description, optional evidence
link); display sorted chronologically.
**Acceptance:** Events render in time order and persist.

---

## Milestone 5 — Analyst questions / decision journal  ☐
**Goal:** Capture reasoning.
**Deliverables:** Add questions and decisions (with rationale); list per case.
**Acceptance:** Entries persist and are clearly distinguished (question vs decision).

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

## Post-MVP (not scheduled — parking lot)
- Seed / demo synthetic cases for first-run experience.
- Import/export cases as JSON (backup/sharing).
- Search & filter across cases.
- Richer ATT&CK coverage and tactic grouping.
- Only after the frontend workflow is proven: optional backend/database.

> Anything in the parking lot is **out of scope** until the MVP (M1–M8) is
> complete and reviewed.
