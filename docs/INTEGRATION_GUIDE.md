# Integration Guide

SOC Case Workspace is integration-ready in a file-based sense: users can export
alert, log, or case data from another tool, normalize it into the documented
`SocCase` JSON shape, and import it into the browser workspace.

This is not a live SIEM, EDR, identity, email, or ticketing integration. The app
does not make network calls, store API keys, run connectors, or sync data with
external systems.

## Recommended safe workflow

1. Export alert or log data from the external system.
2. Normalize the export into the SOC Case Workspace `SocCase` format.
3. Import the JSON file through Settings / Data Management.
4. Review and edit the case as a human analyst.
5. Export the Markdown report or a workspace snapshot.

Treat imported content as a starting point, not as a final investigation. The
analyst should still validate evidence, link findings to supporting records,
review MITRE mappings, complete closure reasoning, and check Case Quality Review.

## Normalization approach

When building a small adapter script or manual conversion process:

- Create one `SocCase` per alert, incident, or investigation.
- Use stable synthetic/sanitized IDs for every child record.
- Put raw observations in `evidence`.
- Put chronological activity in `timeline`.
- Put unknowns and decisions in `analystQuestions`.
- Put analyst conclusions in `findings`, linked to supporting evidence IDs.
- Put ATT&CK mappings in `mitreMappings`, with rationale and confidence.
- Put response actions in `recommendations`.
- Put classification and closure reasoning in `closure`.
- Keep timestamps in ISO 8601 format.

The case object should be the source of truth. Do not create separate storage for
evidence, timeline rows, questions, findings, or mappings.

## Example source-to-case mapping

| External field | Suggested SocCase location |
| --- | --- |
| Alert title | `SocCase.title` |
| Alert description | `SocCase.summary` |
| Source product | `SocCase.source` and optional `sourceDetail` |
| Severity | `SocCase.severity` |
| Assigned analyst | `SocCase.owner` |
| User, host, IP, URL, file | `affectedEntities` |
| Log lines, process events, auth events | `evidence` |
| Event timestamps | `timeline` |
| Analyst unknowns | `analystQuestions` |
| Confirmed conclusions | `findings` |
| Technique candidates | `mitreMappings` |
| Response actions | `recommendations` |
| Verdict / close notes | `closure` |

## Import examples

Synthetic examples are provided under `examples/import/`:

- `generic-alert.json` - a directly importable single-case JSON example.
- `soc-case-example.json` - a directly importable selected-case workspace
  snapshot with graph layout placeholders.
- `evidence-template.csv` - a CSV normalization template for evidence rows.
- `timeline-template.csv` - a CSV normalization template for timeline rows.

The CSV files are not imported directly by the app yet. They are meant as simple
templates for preparing data before converting it into JSON.

## Validation behavior

The app validates the basic case shape before import:

- Required top-level case fields must exist.
- Required child collections must be arrays.
- Case source, severity, and status must use known values.
- Workspace snapshots must include valid graph layout and settings objects.

Invalid files show a clear error and do not modify the current workspace.

Single-case JSON files and selected-case snapshots are merged into the current
workspace after confirmation. Whole-workspace snapshots replace the current
workspace after confirmation.

## Privacy and safety guidance

Before importing data:

- Remove real customer names, usernames, hostnames, email addresses, URLs,
  domains, ticket numbers, and business context.
- Defang or replace indicators.
- Use reserved documentation IP ranges when examples need IPs.
- Replace real file hashes with clearly synthetic placeholders.
- Remove secrets, access tokens, cookies, API keys, and raw payloads.

This repository is a public portfolio project. It should stay safe for synthetic
training, demonstration, and review data only.

## Future adapter ideas

These are intentionally future ideas, not implemented live connectors:

- Microsoft Defender export adapter
- Sentinel incident export adapter
- Splunk notable event CSV adapter
- Elastic alert JSON adapter
- TheHive case export adapter

If adapters are added later, they should remain human-reviewed and file-based
unless the project scope explicitly changes. Live API connectors, credentials,
and backend sync are out of scope for the current browser-first app.

## Troubleshooting

- If import says required fields are missing, compare the file with
  `docs/IMPORT_SCHEMA.md`.
- If the case imports but looks incomplete, check that child arrays are populated
  and cross-reference IDs match.
- If visual graph positions do not restore, graph layout data may be missing or
  node IDs may not match the generated graph nodes.
- If imported content is messy, open the case workspace and use Case Quality
  Review to identify gaps before exporting a report.
