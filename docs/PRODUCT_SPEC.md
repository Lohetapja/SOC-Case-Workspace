# Product Spec — SOC Case Workspace

**Status:** Draft (Milestone 0)
**Owner:** Portfolio author
**Last updated:** 2026-06-20

---

## 1. Problem statement

A SOC analyst's day starts with alerts: noisy, partial, and context-poor. The
core skill is not running tools — it is **structuring an investigation**: forming
a hypothesis, gathering evidence, reconstructing a timeline, and reaching a
defensible verdict that someone else can audit.

Existing tools (SIEM/EDR) are strong at *collecting* data and weak at *capturing
the analyst's reasoning*. This project fills that gap with a focused workspace
for the reasoning layer.

## 2. Target user

- **Primary:** A SOC / detection-and-response analyst (Tier 1–2) working a case.
- **Secondary (portfolio context):** Hiring managers and peers reviewing the
  author's understanding of the SOC investigation lifecycle.

## 3. Core concept

> **Turn messy alerts into structured SOC cases.**

One **alert** becomes one **case**. A case is a container for:
evidence, a timeline, analyst questions/decisions, ATT&CK mappings, and a final
classification — all of which roll up into an exportable report.

## 4. The investigation lifecycle (the spine of the app)

```
Alert intake → Case → Evidence → Timeline → Questions/Decisions
            → ATT&CK mapping → Closure classification → Report export
```

Each stage is a feature. The stages are designed to be filled in roughly in
order, but the workspace does not force a rigid wizard — an analyst can move
between sections freely.

## 5. Features (MVP)

### 5.1 Case list & create-case form
- View all cases with key metadata (title, severity, status, created date).
- Create a new case from an alert: title, summary, source, severity, status.
- Cases persist locally and survive page reload.

### 5.2 Case detail workspace
- A single-case view that hosts all investigation sections.
- Shows case metadata and lets the analyst edit core fields.
- Acts as the navigation hub for the sections below.

### 5.3 Evidence board
- Add evidence items: type (log line, file hash, IP, URL, screenshot note, etc.),
  value, source, and an analyst note on relevance.
- List, edit, and remove evidence.
- Evidence is the factual backbone the rest of the case references.

### 5.4 Timeline builder
- Add timeline events: timestamp, description, and optional link to evidence.
- Events display in chronological order.
- The timeline turns scattered facts into a narrative of what happened, when.

### 5.5 Analyst questions / decision journal
- Capture open questions ("Was this login from a known device?").
- Record decisions and their rationale ("Escalated because MFA was bypassed").
- This is the audit trail of the analyst's thinking.

### 5.6 MITRE ATT&CK mapping
- Map case findings to ATT&CK techniques (tactic, technique ID + name).
- For each mapping, record **rationale** (why this technique applies) and a
  **confidence** level (e.g. Low / Medium / High).
- A curated, embedded subset of techniques is sufficient for the MVP — no live
  ATT&CK API.

### 5.7 Closure classification
- Assign a final verdict at close: e.g. True Positive, False Positive,
  Benign True Positive, Inconclusive.
- Record a closing summary and the primary justification.

### 5.8 Markdown report export
- Generate a clean Markdown report combining all sections: summary, evidence,
  timeline, decisions, ATT&CK mappings, and closure.
- Output is copyable / downloadable so it can live in a ticket or wiki.

## 6. Data model (initial sketch — to be refined in Milestone 1)

> Illustrative only; not final. Persisted as JSON in `localStorage`.

- **Case**: `id`, `title`, `summary`, `source`, `severity`, `status`,
  `createdAt`, `updatedAt`, `classification?`.
- **Evidence**: `id`, `caseId`, `type`, `value`, `source`, `note`, `createdAt`.
- **TimelineEvent**: `id`, `caseId`, `timestamp`, `description`, `evidenceId?`.
- **JournalEntry**: `id`, `caseId`, `kind` (`question` | `decision`), `text`,
  `rationale?`, `createdAt`.
- **AttackMapping**: `id`, `caseId`, `tacticId`, `techniqueId`, `techniqueName`,
  `rationale`, `confidence`.
- **Classification**: `verdict`, `summary`, `justification`, `closedAt`.

## 7. Non-goals (MVP)

- No SIEM clone, no log ingestion at scale.
- No EDR integration or endpoint telemetry.
- No live Sentinel / Defender / Splunk / other vendor APIs.
- No automated containment or response actions.
- No malware analysis or sandboxing.
- No AI auto-investigation.
- No multi-user collaboration, sharing, or accounts.
- No backend or database until the frontend workflow is validated.

## 8. Safety & privacy requirements

- Synthetic data only; the app ships with clearly-fake demo content.
- No outbound network requests; no telemetry.
- All data stays in the browser (`localStorage`). No server-side storage.
- The UI should make clear this is an educational tool, not for real incidents.

## 9. Success criteria

The MVP is "done" when a user can, entirely offline and locally:

1. Create a case from a synthetic alert.
2. Populate evidence, a timeline, decisions, and ATT&CK mappings.
3. Classify and close the case.
4. Export a coherent Markdown report that tells the full investigation story.

A reviewer reading only the exported report should understand what happened, what
the evidence was, and why the analyst reached their verdict.
