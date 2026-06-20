# Decision Record — SOC Case Workspace

A lightweight architecture decision record (ADR). Newest decisions at the bottom.
Each entry: context, decision, and consequences. Decisions can be superseded
later — when they are, note it rather than deleting history.

---

## ADR-0001 — Documentation before code
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The project has clear scope and explicit non-goals. Writing code
first risks scope creep and an inconsistent mental model.

**Decision:** Milestone 0 produces the product spec, build plan, decision record,
and contributor guidance *before* any application code is scaffolded.

**Consequences:** Slightly slower start, but a shared definition of "done" and a
guardrail against scope creep. The docs become the source of truth for scope.

---

## ADR-0002 — Frontend-first, no backend for the MVP
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The valuable, novel part of the project is the *investigation
workflow*, not infrastructure. A backend adds auth, hosting, and data-modeling
overhead that would delay validating the workflow.

**Decision:** Build a frontend-only app for the MVP. Defer any backend or
database until the workflow is proven.

**Consequences:** Fast iteration and zero infra. Limitations (single device, no
sync, no auth) are accepted for the MVP and documented as non-goals.

---

## ADR-0003 — Persist to browser `localStorage`
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The MVP needs persistence across reloads without a backend.

**Decision:** Store all data as JSON in `localStorage`, behind a small
persistence helper so the storage mechanism can be swapped later.

**Consequences:** Simple and offline. Data is per-browser and lost if storage is
cleared; not suitable for real data — which is fine, since the app uses synthetic
data only. The helper abstraction keeps a future migration (IndexedDB/backend)
cheap.

---

## ADR-0004 — Vite + React + TypeScript
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** Need a fast, well-supported, type-safe frontend stack that is
familiar to reviewers.

**Decision:** Use Vite (build/dev), React (UI), TypeScript (type safety).

**Consequences:** Fast dev server, strong typing for the data model, and a
conventional stack that is easy for a portfolio reviewer to read. Adds a build
step and TypeScript overhead — accepted as worthwhile.

---

## ADR-0005 — Embedded, curated ATT&CK subset (no live API)
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** ATT&CK mapping needs technique data, but the MVP forbids external
APIs and aims to stay small.

**Decision:** Ship a small, static, curated subset of ATT&CK tactics/techniques
as local data. No network calls to MITRE.

**Consequences:** Fully offline and deterministic. Coverage is intentionally
partial for the MVP; expanding it is a parking-lot item. Keeps the educational
focus on *rationale and confidence*, not exhaustive technique lookup.

---

## ADR-0006 — Synthetic data only; no telemetry
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** This is a public-facing portfolio artifact in the security domain.
Handling real data — or appearing to — would be inappropriate and risky.

**Decision:** Use only fabricated, clearly-synthetic data. Make no outbound
network requests and collect no telemetry.

**Consequences:** Safe to publish and demo. Reviewers can trust there is no real
incident data. Reinforced by the non-goals and safety notes in the README/spec.

---

## ADR-0007 — Local state navigation, no router (for now)
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The skeleton needs to switch between a handful of sections. A router
(e.g. React Router) is the conventional choice but adds a dependency, and the MVP
brief asks to avoid complex libraries and keep dependencies minimal.

**Decision:** Navigate via simple React state (a `SectionId` union) and a `switch`
in `App.tsx`. No routing library yet.

**Consequences:** Zero extra dependencies and a tiny surface area. Trade-offs: no
URL-addressable sections, no browser back/forward, no deep links. If/when those
matter (likely once case detail views and report sharing arrive), revisit and add
a router — this decision is explicitly provisional.

---

## ADR-0008 — Embedded aggregate data model (case owns its children)
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The model needs to represent a case and its evidence, timeline,
analyst questions, findings, MITRE mappings, and recommendations. Two shapes were
possible: (a) normalized collections keyed by `caseId`, or (b) one `SocCase`
aggregate that embeds its child records as arrays.

**Decision:** Use the embedded aggregate (option b). `SocCase` is the root and
holds `affectedEntities`, `evidence`, `timeline`, `analystQuestions`, `findings`,
`mitreMappings`, `recommendations`, optional `closure`, and optional
`reportMetadata`. Child records cross-reference each other by string id (e.g.
`relatedEvidenceIds` on a timeline event). Enum-like fields are string-literal
unions (`Severity`, `CaseStatus`, `CaseSource`, `EvidenceType`, etc.), and
display labels live in `src/data/labels.ts` as exhaustive `Record<Union, string>`
maps. Types live in `src/types/domain.ts`.

**Consequences:** A case loads and saves as a single JSON object — a natural fit
for `localStorage` (ADR-0003) and for Markdown export later. Trade-offs: no shared
records across cases and no relational queries, both acceptable for a single-user
MVP. The id-based cross-references keep room to normalize later if needed.

**Synthetic-data guarantee:** The two demo cases in `src/data/demoCases.ts` use
reserved documentation IP ranges (RFC 5737 TEST-NET), the reserved `.example`
TLD with defanged indicators, the fictional "contoso" org, and placeholder file
hashes. No real IOCs or customer data are present (reinforces ADR-0006).

---

## ADR-0009 — `react-force-graph-2d` for the Case Graph view
**Date:** 2026-06-20 · **Status:** Accepted

**Context:** The Case Graph view needs a force-directed, zoom/pan, click-to-select
graph. Building this from scratch (canvas + a force simulation) is non-trivial and
easy to get subtly wrong; the project values a small, maintainable implementation.

**Decision:** Add `react-force-graph-2d` (the Canvas 2D build) rather than the
heavier 3D/VR variants or a hand-rolled engine. A single pure function,
`buildCaseGraph(socCase)` in `src/utils/caseGraph.ts`, adapts the existing domain
model into `{ nodes, links }`; the component stays a thin, read-only wrapper.

**Consequences:** First runtime dependency beyond React. It pulls in `force-graph`
and `d3-force` transitively, growing the bundle (~360 kB raw / ~118 kB gzip) — an
acceptable trade for a local, offline tool and far less code than a custom
renderer. The graph is canvas-based and client-only, consistent with the
frontend-only, no-network constraints. The 2D build (not 3D) keeps the dependency
footprint and visual complexity modest. Still no backend or external API.
