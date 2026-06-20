# CLAUDE.md — Working guidance for AI-assisted development

This file orients any AI assistant (and human contributor) working in this repo.
Read it before making changes.

## What this project is

**SOC Case Workspace** — an educational, frontend-first portfolio app that models
how a SOC analyst structures an investigation from alert intake to an
evidence-backed, exportable report. Core idea: **turn messy alerts into
structured SOC cases.**

Authoritative scope lives in:
- `docs/PRODUCT_SPEC.md` — what we build and why.
- `docs/BUILD_PLAN.md` — the ordered milestones (build one at a time).
- `docs/DECISIONS.md` — why the architecture is the way it is.

## How to work here (important)

1. **One milestone at a time.** Follow `docs/BUILD_PLAN.md` in order. Do not jump
   ahead or build multiple milestones at once.
2. **Stop and report after each milestone.** Always end a milestone by stating:
   (a) what changed, (b) which files were created/edited, (c) how to run/test it,
   (d) the next smallest logical step. Then wait.
3. **No scope creep.** If something isn't in the current milestone, don't build
   it. Suggest it as a parking-lot item instead.
4. **Smallest reasonable change.** Prefer the minimal implementation that meets
   the milestone's acceptance criteria.
5. **Keep the docs in sync.** When a decision changes, update `docs/DECISIONS.md`;
   when a milestone completes, mark it in `docs/BUILD_PLAN.md`.

## Hard constraints (do not violate)

- **Frontend only** for the MVP. No backend, no database, no server.
- **No external APIs / no network calls / no telemetry.** Fully offline.
- **No authentication**, no multi-user features.
- **Synthetic data only.** Never introduce real or realistic-looking customer
  data, real IPs/hostnames/credentials, or real incident content.
- **Persistence is `localStorage`** behind a small helper so it can be swapped.
- Respect every item in the README's **Non-goals** list.

## Tech stack

- Vite + React + TypeScript.
- Browser `localStorage` for persistence (MVP).
- No state-management or UI library is mandated yet; keep dependencies minimal
  and justify any new one in `docs/DECISIONS.md`.

## Conventions (to establish as code lands)

- TypeScript types for every persisted entity (see the data model in the spec).
- Keep domain logic (case/evidence/timeline models, storage) separate from UI.
- Small, focused components; clear names that match SOC domain vocabulary.
- No secrets, no env-dependent behavior — the app must run with `npm run dev`
  out of the box.

## Current status

Milestone 0 (documentation) is in progress/complete. The React app has **not**
been scaffolded yet. The next step is **Milestone 1** in `docs/BUILD_PLAN.md`.
