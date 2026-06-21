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

## Standing project rules

These are the defaults for every milestone, so prompts can stay short. Unless a
prompt explicitly overrides one of these, assume all of them apply — there is no
need to restate them in each prompt.

1. Always read `CLAUDE.md`, `README.md`, `docs/BUILD_PLAN.md`, and
   `docs/DECISIONS.md` before starting a milestone.
2. Work one milestone at a time.
3. Keep the scope small.
4. Stop after the milestone is complete and wait for the next instruction.
5. Do not commit.
6. Do not push.
7. Do not run `git commit`.
8. Do not run `git push`.
9. The user commits, pushes, and deploys manually with GitHub Desktop.
10. The app must remain frontend-only, browser-first, and localStorage-based
    unless the user explicitly says otherwise.
11. Use synthetic data only.
12. Do not add a backend, database, authentication, external APIs, or routing
    libraries unless the user explicitly asks.
13. Do not overhaul unrelated styling or unrelated features.
14. Reuse the existing `updateCase` / localStorage pattern where possible.
15. Run `npm run build` before reporting completion.
16. After each milestone, report only:
    - what changed
    - files created/edited
    - build result
    - how to test
    - next smallest logical step
17. Keep reports concise to save tokens.
18. Do not repeat the full project explanation back unless something changed or
    there is a risk.

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

The app is scaffolded and deployed (GitHub Pages). Completed milestones and the
next step are tracked in `docs/BUILD_PLAN.md` — treat it as the source of truth
and check it at the start of each milestone. Live demo:
https://lohetapja.github.io/SOC-Case-Workspace/
