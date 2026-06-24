# Import Schema

SOC Case Workspace imports file-based JSON data into the existing local
workspace. It does not connect to SIEM, EDR, email, identity, or ticketing
systems directly.

The app uses `SocCase` as the single source of truth. Evidence, timeline events,
analyst questions, findings, MITRE mappings, closure/classification,
recommendations, checklist state, and optional agent contributions all belong to
the case object. Workspace pages, reports, visual maps, and exports are views of
that same case data.

## Supported import shapes

### 1. Workspace snapshot

This is the preferred replay/backup format exported by the app.

```json
{
  "format": "soc-case-workspace-snapshot",
  "exportType": "selected-case",
  "schemaVersion": 1,
  "exportedAt": "2026-06-24T12:00:00.000Z",
  "selectedCaseIds": ["case-example-001"],
  "selectedCaseTitles": ["Example Suspicious Email Review"],
  "cases": [],
  "graphLayouts": {},
  "appSettings": {}
}
```

`exportType` may be:

- `whole-workspace`
- `selected-case`
- `selected-cases`

Whole-workspace imports replace the current workspace after confirmation.
Selected-case imports merge into the current workspace and replace cases with
matching IDs.

### 2. Case export envelope

Older/simple backups may use a smaller case-only envelope:

```json
{
  "schemaVersion": 1,
  "exportedAt": "2026-06-24T12:00:00.000Z",
  "cases": []
}
```

### 3. Bare case array

```json
[
  {
    "id": "case-example-001",
    "title": "Example Suspicious Email Review",
    "summary": "Synthetic case summary...",
    "source": "email_gateway",
    "severity": "medium",
    "status": "triage",
    "owner": "analyst.training",
    "affectedEntities": [],
    "evidence": [],
    "timeline": [],
    "analystQuestions": [],
    "findings": [],
    "mitreMappings": [],
    "recommendations": [],
    "createdAt": "2026-06-24T10:00:00.000Z",
    "updatedAt": "2026-06-24T10:00:00.000Z"
  }
]
```

### 4. Single `SocCase` object

A single case object can also be imported directly. The app adds or merges it
into the current workspace after confirmation.

## Required `SocCase` fields

Each imported case must include these top-level fields:

| Field | Type / expected value |
| --- | --- |
| `id` | string |
| `title` | string |
| `summary` | string |
| `source` | one of the supported `CaseSource` values |
| `severity` | `informational`, `low`, `medium`, `high`, or `critical` |
| `status` | `new`, `triage`, `investigating`, or `closed` |
| `owner` | string |
| `affectedEntities` | array |
| `evidence` | array |
| `timeline` | array |
| `analystQuestions` | array |
| `findings` | array |
| `mitreMappings` | array |
| `recommendations` | array |
| `createdAt` | ISO 8601 timestamp string |
| `updatedAt` | ISO 8601 timestamp string |

Optional top-level fields include:

- `sourceDetail`
- `agentContributions`
- `closure`
- `lab`
- `reportMetadata`
- `templateId`
- `checklist`

The current browser import validator checks the basic case shape and required
arrays. It is intentionally lightweight; review imported cases before treating
them as complete.

## Supported enum values

### `source`

`edr`, `siem`, `email_gateway`, `identity_provider`, `firewall`, `cloud`,
`user_report`, `threat_intel`, `other`

### `severity`

`informational`, `low`, `medium`, `high`, `critical`

### `status`

`new`, `triage`, `investigating`, `closed`

### Evidence `type`

`log`, `process`, `network`, `file`, `email`, `authentication`, `registry`,
`command`, `screenshot`, `note`, `other`

### Timeline `phase`

`detection`, `attacker_activity`, `analyst_action`, `containment`, `other`

### Finding `confidence`

`low`, `medium`, `high`

### Finding `status`

`draft`, `confirmed`, `rejected`

### Closure `verdict`

`true_positive`, `benign_true_positive`, `false_positive`, `suspicious`,
`undetermined`, `inconclusive`

### Closure `closureStatus`

`open`, `monitoring`, `escalated`, `closed`

### Lab `writeupStatus`

`not_started`, `draft`, `complete`

### Lab sharing fields

`publicWriteupAllowed` and `spoilerSensitive` use `yes`, `no`, or `unknown`.

## Cross-reference fields

Child records may reference each other by ID:

- `EvidenceItem.relatedEntityIds`
- `TimelineEvent.relatedEvidenceIds`
- `Finding.relatedEvidenceIds`
- `Finding.relatedTimelineEventIds`
- `MitreMapping.relatedFindingIds`
- `MitreMapping.relatedEvidenceIds`
- `AgentContribution.relatedEvidenceIds`

Use stable IDs when normalizing external data. Stable IDs make report export,
Case Quality Review, Artifact Map, Case Graph, and reference cleanup more useful.

## Graph layout data

Workspace snapshots may include pinned Case Graph node positions:

```json
{
  "graphLayouts": {
    "case-example-001": {
      "case:case-example-001": { "x": 0, "y": 0 },
      "evidence:ev-example-001": { "x": -120, "y": 40 }
    }
  }
}
```

Graph layout positions are UI preferences, not investigation evidence. They are
safe to omit.

## CSV templates

The CSV files in `examples/import/` are normalization templates, not direct CSV
imports. Use them to prepare evidence and timeline rows, then convert them into
`SocCase.evidence` and `SocCase.timeline` arrays before importing JSON.

## Safety notes

- Use synthetic or sanitized data only.
- Do not import customer, employer, sensitive, privileged, or regulated data into
  the public portfolio demo.
- Do not store API keys, tokens, credentials, secrets, or raw phishing payloads.
- Imported data is stored only in this browser's `localStorage`.
