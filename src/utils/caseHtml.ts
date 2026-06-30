import type { SocCase } from '../types'
import {
  closureStatusLabels,
  confidenceLabels,
  entityTypeLabels,
  evidenceTypeLabels,
  findingCategoryLabels,
  findingStatusLabels,
  labDisclosureStateLabels,
  labWriteupStatusLabels,
  priorityLabels,
  questionStatusLabels,
  recommendationCategoryLabels,
  recommendationStatusLabels,
  severityLabels,
  sourceLabels,
  statusLabels,
  timelinePhaseLabels,
  verdictLabels,
} from '../data/labels'
import { formatDateTime } from './format'
import { reviewCaseQuality } from './caseQuality'

/**
 * Builds a standalone, read-only HTML document for one case. Fully self-contained
 * (inline CSS, no scripts, no external references, no network calls) so it can be
 * opened locally as a portable review artifact. Synthetic data only.
 */

/** Escape user text so it cannot break out of the generated markup. */
function esc(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function section(title: string, body: string): string {
  return `<section><h2>${esc(title)}</h2>${body}</section>`
}

function titlesFor(ids: string[] | undefined, map: Map<string, string>): string[] {
  return (ids ?? []).map((id) => map.get(id)).filter((title): title is string => Boolean(title))
}

const STYLES = `
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #1e293b; background: #f1f5f9; margin: 0; padding: 24px; line-height: 1.55; }
  .wrap { max-width: 880px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 28px 32px 40px; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.01em; }
  h2 { font-size: 15px; text-transform: uppercase; letter-spacing: 0.04em; color: #334155; margin: 28px 0 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
  h3 { font-size: 14px; margin: 14px 0 2px; }
  p { margin: 6px 0; }
  ul, ol { margin: 6px 0; padding-left: 20px; }
  li { margin: 4px 0; }
  .muted { color: #64748b; }
  .meta { color: #64748b; font-size: 13px; }
  .mono { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 10px 0; }
  .chip { display: inline-block; padding: 2px 9px; border-radius: 999px; background: #f1f5f9; border: 1px solid #e2e8f0; font-size: 12px; color: #475569; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 4px 18px; font-size: 13px; }
  .disclaimer { background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 8px; padding: 12px 14px; margin: 14px 0; font-size: 13px; }
  .warn { color: #b45309; font-weight: 600; }
  footer { margin-top: 28px; padding-top: 12px; border-top: 1px solid #e2e8f0; color: #64748b; font-size: 12px; }
`

export function buildCaseHtmlDocument(socCase: SocCase): string {
  const evidenceTitle = new Map(socCase.evidence.map((item) => [item.id, item.title]))
  const timelineTitle = new Map(socCase.timeline.map((event) => [event.id, event.title]))
  const findingTitle = new Map(socCase.findings.map((finding) => [finding.id, finding.title]))
  const closure = socCase.closure
  const quality = reviewCaseQuality(socCase)
  const openQuestions = socCase.analystQuestions.filter((q) => q.status === 'open')

  const chips = [
    `Status: ${statusLabels[socCase.status]}`,
    `Severity: ${severityLabels[socCase.severity]}`,
    `Classification: ${closure?.verdict ? verdictLabels[closure.verdict] : 'Not set'}`,
    `Closure: ${closure?.closureStatus ? closureStatusLabels[closure.closureStatus] : 'Not set'}`,
    ...(socCase.lab?.enabled ? ['Lab / training case'] : []),
  ]
    .map((text) => `<span class="chip">${esc(text)}</span>`)
    .join('')

  const metadata = `<div class="grid">
    <span><strong>Case ID:</strong> <span class="mono">${esc(socCase.id)}</span></span>
    <span><strong>Source:</strong> ${esc(sourceLabels[socCase.source])}${socCase.sourceDetail ? ` (${esc(socCase.sourceDetail)})` : ''}</span>
    <span><strong>Severity:</strong> ${esc(severityLabels[socCase.severity])}</span>
    <span><strong>Status:</strong> ${esc(statusLabels[socCase.status])}</span>
    <span><strong>Owner:</strong> ${esc(socCase.owner)}</span>
    <span><strong>Created:</strong> ${esc(formatDateTime(socCase.createdAt))}</span>
    <span><strong>Updated:</strong> ${esc(formatDateTime(socCase.updatedAt))}</span>
  </div>`

  const entities = socCase.affectedEntities.length
    ? `<ul>${socCase.affectedEntities
        .map((entity) => {
          const context = [entity.role, entity.description].filter(Boolean).map(esc).join(' — ')
          return `<li><strong>${esc(entityTypeLabels[entity.type])}:</strong> <span class="mono">${esc(entity.value)}</span>${context ? ` — ${context}` : ''}</li>`
        })
        .join('')}</ul>`
    : '<p class="muted">No affected entities recorded.</p>'

  const findings = socCase.findings.length
    ? socCase.findings
        .map((finding) => {
          const tags = [
            finding.category && findingCategoryLabels[finding.category],
            `${confidenceLabels[finding.confidence]} confidence`,
            finding.status && findingStatusLabels[finding.status],
          ]
            .filter(Boolean)
            .map((tag) => `<span class="chip">${esc(String(tag))}</span>`)
            .join('')
          const evidence = titlesFor(finding.relatedEvidenceIds, evidenceTitle)
          const events = titlesFor(finding.relatedTimelineEventIds, timelineTitle)
          return `<div><h3>${esc(finding.title)}</h3><div class="chips">${tags}</div><p>${esc(finding.description)}</p>${
            evidence.length ? `<p class="meta">Supporting evidence: ${esc(evidence.join(', '))}</p>` : ''
          }${events.length ? `<p class="meta">Related timeline: ${esc(events.join(', '))}</p>` : ''}</div>`
        })
        .join('')
    : '<p class="muted">No analytical findings recorded.</p>'

  const timeline = socCase.timeline.length
    ? `<ol>${[...socCase.timeline]
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
        .map((event) => {
          const evidence = titlesFor(event.relatedEvidenceIds, evidenceTitle)
          return `<li><strong>${esc(formatDateTime(event.timestamp))}</strong> — ${esc(event.title)}${
            event.phase ? ` <span class="chip">${esc(timelinePhaseLabels[event.phase])}</span>` : ''
          }<br/><span>${esc(event.description)}</span>${
            evidence.length ? `<br/><span class="meta">Evidence: ${esc(evidence.join(', '))}</span>` : ''
          }</li>`
        })
        .join('')}</ol>`
    : '<p class="muted">No timeline events recorded.</p>'

  const evidence = socCase.evidence.length
    ? `<ul>${socCase.evidence
        .map((item) => {
          const meta = [evidenceTypeLabels[item.type], item.source, item.observedAt && formatDateTime(item.observedAt)]
            .filter(Boolean)
            .map(esc)
            .join(' · ')
          return `<li><strong>${esc(item.title)}</strong> <span class="meta">(${meta})</span><br/><span>${esc(item.detail)}</span>${
            item.analystNote ? `<br/><span class="meta">Analyst note: ${esc(item.analystNote)}</span>` : ''
          }</li>`
        })
        .join('')}</ul>`
    : '<p class="muted">No evidence recorded.</p>'

  const questions = socCase.analystQuestions.length
    ? `<ul>${socCase.analystQuestions
        .map((q) => {
          return `<li><strong>${esc(q.question)}</strong> <span class="meta">(${esc(questionStatusLabels[q.status])})</span>${
            q.answer ? `<br/>Answer: ${esc(q.answer)}` : ''
          }${q.rationale ? `<br/>Rationale: ${esc(q.rationale)}` : ''}</li>`
        })
        .join('')}</ul>${
        openQuestions.length
          ? `<p class="warn">${openQuestions.length} open question(s) remain unresolved before final closure.</p>`
          : ''
      }`
    : '<p class="muted">No analyst questions recorded.</p>'

  const mitre = socCase.mitreMappings.length
    ? socCase.mitreMappings
        .map((mapping) => {
          const findingsSupport = titlesFor(mapping.relatedFindingIds, findingTitle)
          const evidenceSupport = titlesFor(mapping.relatedEvidenceIds, evidenceTitle)
          return `<div><h3>${esc(mapping.techniqueId)} — ${esc(mapping.techniqueName)}</h3><div class="chips">${
            mapping.tactic ? `<span class="chip">${esc(mapping.tactic)}</span>` : ''
          }<span class="chip">${esc(confidenceLabels[mapping.confidence])} confidence</span></div><p>${
            mapping.rationale ? esc(mapping.rationale) : '<span class="muted">No analyst rationale recorded.</span>'
          }</p>${findingsSupport.length ? `<p class="meta">Supporting findings: ${esc(findingsSupport.join(', '))}</p>` : ''}${
            evidenceSupport.length ? `<p class="meta">Supporting evidence: ${esc(evidenceSupport.join(', '))}</p>` : ''
          }</div>`
        })
        .join('')
    : '<p class="muted">No analyst-authored ATT&amp;CK mappings recorded.</p>'

  const closureBlock =
    closure && (closure.rationale || closure.recommendedAction || closure.impactSummary)
      ? `<div class="chips"><span class="chip">Classification: ${esc(closure.verdict ? verdictLabels[closure.verdict] : 'Not set')}</span><span class="chip">Closure: ${esc(closure.closureStatus ? closureStatusLabels[closure.closureStatus] : 'Not set')}</span></div>${
          closure.rationale ? `<p><strong>Rationale:</strong> ${esc(closure.rationale)}</p>` : ''
        }${closure.recommendedAction ? `<p><strong>Recommended action:</strong> ${esc(closure.recommendedAction)}</p>` : ''}${
          closure.impactSummary ? `<p><strong>Impact:</strong> ${esc(closure.impactSummary)}</p>` : ''
        }`
      : '<p class="muted">No closure rationale recorded.</p>'

  const recommendations = socCase.recommendations.length
    ? `<ul>${socCase.recommendations
        .map((rec) => {
          const meta = [priorityLabels[rec.priority] + ' priority', rec.category && recommendationCategoryLabels[rec.category], rec.status && recommendationStatusLabels[rec.status]]
            .filter(Boolean)
            .map(esc)
            .join(' · ')
          return `<li><strong>${esc(rec.title)}</strong> <span class="meta">(${meta})</span>${rec.description ? `<br/>${esc(rec.description)}` : ''}</li>`
        })
        .join('')}</ul>`
    : '<p class="muted">No recommendations recorded.</p>'

  const qualityBlock = `<div class="chips"><span class="chip">${quality.completion.complete} / ${quality.completion.total} checks complete</span><span class="chip">${quality.counts.warning} needs attention</span><span class="chip">${quality.counts.missing} missing</span><span class="chip">${esc(quality.completion.label)}</span></div>${
    quality.coachSuggestions.length
      ? `<ul>${quality.coachSuggestions.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>`
      : '<p class="muted">No major quality gaps were flagged. Final review should still confirm wording and evidence links.</p>'
  }`

  const labBlock = socCase.lab?.enabled
    ? section(
        'Lab / training disclaimer',
        `<div class="chips">${[
          socCase.lab.platform,
          socCase.lab.labName,
          `Writeup: ${labWriteupStatusLabels[socCase.lab.writeupStatus ?? 'not_started']}`,
          `Public writeup: ${labDisclosureStateLabels[socCase.lab.publicWriteupAllowed ?? 'unknown']}`,
          `Spoiler-sensitive: ${labDisclosureStateLabels[socCase.lab.spoilerSensitive ?? 'unknown']}`,
        ]
          .filter(Boolean)
          .map((text) => `<span class="chip">${esc(String(text))}</span>`)
          .join('')}</div>${socCase.lab.scenarioSummary ? `<p>${esc(socCase.lab.scenarioSummary)}</p>` : ''}${
          socCase.lab.learningNotes ? `<p class="meta">Learning notes: ${esc(socCase.lab.learningNotes)}</p>` : ''
        }<p class="muted">Do not publish restricted lab answers, copyrighted material, or spoiler-sensitive content without permission.</p>`,
      )
    : ''

  const body = `<div class="wrap">
    <h1>${esc(socCase.title)}</h1>
    <div class="chips">${chips}</div>
    <div class="disclaimer">This is a static read-only export. It does not connect to SOC Case Workspace or any external system. All data is synthetic / sanitized for learning and review only.</div>
    ${section('Executive summary', `<p>${esc(socCase.summary) || '<span class="muted">No executive summary has been recorded.</span>'}</p>`)}
    ${section('Case metadata', metadata)}
    ${section('Affected entities', entities)}
    ${section('Key findings', findings)}
    ${section('Timeline of activity', timeline)}
    ${section('Evidence reviewed', evidence)}
    ${section('Decision journal / open questions', questions)}
    ${section('MITRE ATT&CK mappings', mitre)}
    ${section('Closure decision and rationale', closureBlock)}
    ${section('Recommendations', recommendations)}
    ${section('Case quality / limitations', qualityBlock)}
    ${labBlock}
    ${section('Synthetic / sanitized data disclaimer', '<p>This export was generated by SOC Case Workspace, an educational portfolio tool. All data is synthetic and sanitized for learning; this is not a real security incident. The file is static — it has no editing, upload, or network behavior.</p>')}
    <footer>Generated locally by SOC Case Workspace · ${esc(formatDateTime(new Date().toISOString()))} · static read-only export</footer>
  </div>`

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>SOC Case Export: ${esc(socCase.title)}</title>
<style>${STYLES}</style>
</head>
<body>
${body}
</body>
</html>
`
}

/** Safe download filename for the HTML export. */
export function caseHtmlFilename(socCase: SocCase): string {
  const slug =
    socCase.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 60) || 'case'
  const date = new Date().toISOString().slice(0, 10)
  return `soc-case-${slug}-${date}.html`
}
