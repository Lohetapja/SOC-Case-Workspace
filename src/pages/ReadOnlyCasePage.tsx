import { useMemo, useRef, useState } from 'react'
import type { SocCase } from '../types'
import { useCases } from '../hooks/useCases'
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
import { buildCaseReport, reportFilename } from '../utils/caseReport'
import { reviewCaseQuality } from '../utils/caseQuality'
import { formatDateTime } from '../utils/format'

interface ReadOnlyCasePageProps {
  activeCaseId: string | null
  onBackToWorkspace: (id: string | null) => void
  onOpenCases: () => void
}

function EmptySection({ children }: { children: string }) {
  return <p className="viewer-empty">{children}</p>
}

function sectionCount(count: number) {
  return <span className="detail-section__count">{count}</span>
}

function joinTitles(ids: string[] | undefined, titlesById: Map<string, string>): string {
  return (ids ?? [])
    .map((id) => titlesById.get(id))
    .filter((title): title is string => Boolean(title))
    .join(', ')
}

/** Clean read-only case summary for reviewers and mobile inspection. */
export function ReadOnlyCasePage({
  activeCaseId,
  onBackToWorkspace,
  onOpenCases,
}: ReadOnlyCasePageProps) {
  const { cases } = useCases()
  const socCase = activeCaseId ? cases.find((item) => item.id === activeCaseId) : undefined
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const evidenceTitleById = useMemo(
    () => new Map((socCase?.evidence ?? []).map((item) => [item.id, item.title])),
    [socCase],
  )
  const timelineTitleById = useMemo(
    () => new Map((socCase?.timeline ?? []).map((event) => [event.id, event.title])),
    [socCase],
  )
  const findingTitleById = useMemo(
    () => new Map((socCase?.findings ?? []).map((finding) => [finding.id, finding.title])),
    [socCase],
  )

  async function handleCopyReport(caseToExport: SocCase) {
    const markdown = buildCaseReport(caseToExport)
    try {
      await navigator.clipboard.writeText(markdown)
      setFeedback('Markdown report copied.')
    } catch {
      textareaRef.current?.focus()
      textareaRef.current?.select()
      setFeedback('Clipboard unavailable. The hidden report text is selected for manual copying.')
    }
    window.setTimeout(() => setFeedback(null), 3000)
  }

  function handleDownloadReport(caseToExport: SocCase) {
    const markdown = buildCaseReport(caseToExport)
    const filename = reportFilename(caseToExport)
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setFeedback(`Download started: ${filename}`)
    window.setTimeout(() => setFeedback(null), 3000)
  }

  if (!socCase) {
    return (
      <div className="page viewer-page">
        <header className="page__header">
          <h1 className="page__title">Read-only case view</h1>
          <p className="page__subtitle">
            Select a case first, then open its read-only view from the case workspace.
          </p>
        </header>
        <div className="empty-state">
          <p className="cases-note">No selected case is available for read-only viewing.</p>
          <button type="button" className="btn" onClick={onOpenCases}>
            Go to Cases
          </button>
        </div>
      </div>
    )
  }

  const quality = reviewCaseQuality(socCase)
  const openQuestions = socCase.analystQuestions.filter((question) => question.status === 'open')
  const markdown = buildCaseReport(socCase)
  const closure = socCase.closure

  return (
    <div className="page viewer-page">
      <div className="viewer-toolbar">
        <button type="button" className="btn btn--secondary" onClick={() => onBackToWorkspace(socCase.id)}>
          Back to workspace
        </button>
      </div>

      <header className="card viewer-hero">
        <div className="viewer-hero__top">
          <div>
            <p className="viewer-kicker">Read-only case review</p>
            <h1 className="viewer-title">{socCase.title}</h1>
          </div>
          <span className={`sev sev--${socCase.severity}`}>{severityLabels[socCase.severity]}</span>
        </div>
        <div className="viewer-chips">
          <span className="chip">Status: {statusLabels[socCase.status]}</span>
          <span className="chip">
            Classification: {closure?.verdict ? verdictLabels[closure.verdict] : 'Not set'}
          </span>
          <span className="chip">
            Closure: {closure?.closureStatus ? closureStatusLabels[closure.closureStatus] : 'Not set'}
          </span>
          {socCase.lab?.enabled && <span className="chip chip--open">Lab / training case</span>}
        </div>
        <h2 className="viewer-section-label">Executive summary</h2>
        <p className="viewer-summary">{socCase.summary || 'No executive summary has been recorded.'}</p>
        <p className="viewer-share-note">
          Read-only view is generated from local browser data for review by a mentor, senior
          analyst, hiring manager, or non-technical stakeholder. Export Markdown or JSON to share
          outside this browser.
        </p>
        <div className="viewer-actions">
          <button type="button" className="btn" onClick={() => handleCopyReport(socCase)}>
            Copy Markdown
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleDownloadReport(socCase)}>
            Download .md
          </button>
        </div>
        {feedback && <p className="action-feedback" role="status">{feedback}</p>}
        <textarea
          ref={textareaRef}
          className="viewer-hidden-report"
          value={markdown}
          readOnly
          tabIndex={-1}
          aria-hidden="true"
        />
      </header>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Case metadata</h2>
        <div className="viewer-metadata-grid">
          <span><strong>Case ID:</strong> {socCase.id}</span>
          <span><strong>Source:</strong> {sourceLabels[socCase.source]}{socCase.sourceDetail ? ` (${socCase.sourceDetail})` : ''}</span>
          <span><strong>Severity:</strong> {severityLabels[socCase.severity]}</span>
          <span><strong>Status:</strong> {statusLabels[socCase.status]}</span>
          <span><strong>Owner:</strong> {socCase.owner}</span>
          <span><strong>Created:</strong> {formatDateTime(socCase.createdAt)}</span>
          <span><strong>Updated:</strong> {formatDateTime(socCase.updatedAt)}</span>
        </div>
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Affected entities {sectionCount(socCase.affectedEntities.length)}</h2>
        {socCase.affectedEntities.length === 0 ? (
          <EmptySection>No affected entities recorded. Add the user, host, account, IP, file, or system in scope.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.affectedEntities.map((entity) => (
              <li key={entity.id}>
                <strong>{entity.value}</strong>
                <span className="viewer-meta">
                  {entityTypeLabels[entity.type]}
                  {entity.role ? ` · ${entity.role}` : ''}
                  {entity.description ? ` · ${entity.description}` : ''}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Key findings {sectionCount(socCase.findings.length)}</h2>
        <p className="viewer-section-help">
          Findings are the analyst conclusions. They should be traceable to evidence.
        </p>
        {socCase.findings.length === 0 ? (
          <EmptySection>No analytical findings recorded.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.findings.map((finding) => {
              const evidence = joinTitles(finding.relatedEvidenceIds, evidenceTitleById)
              const events = joinTitles(finding.relatedTimelineEventIds, timelineTitleById)
              return (
                <li key={finding.id}>
                  <strong>{finding.title}</strong>
                  <span className="viewer-meta">
                    {finding.category ? `${findingCategoryLabels[finding.category]} · ` : ''}
                    {confidenceLabels[finding.confidence]} confidence
                    {finding.status ? ` · ${findingStatusLabels[finding.status]}` : ''}
                  </span>
                  <p>{finding.description}</p>
                  {evidence && <span className="viewer-meta">Supporting evidence: {evidence}</span>}
                  {events && <span className="viewer-meta">Related timeline: {events}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Timeline {sectionCount(socCase.timeline.length)}</h2>
        {socCase.timeline.length === 0 ? (
          <EmptySection>No timeline events recorded. A reviewer cannot yet follow the sequence of activity.</EmptySection>
        ) : (
          <ol className="viewer-timeline">
            {[...socCase.timeline].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).map((event) => {
              const linkedEvidence = joinTitles(event.relatedEvidenceIds, evidenceTitleById)
              return (
                <li key={event.id}>
                  <time>{formatDateTime(event.timestamp)}</time>
                  <strong>{event.title}</strong>
                  {event.phase && <span className="chip">{timelinePhaseLabels[event.phase]}</span>}
                  <p>{event.description}</p>
                  {linkedEvidence && <span className="viewer-meta">Evidence: {linkedEvidence}</span>}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Evidence reviewed {sectionCount(socCase.evidence.length)}</h2>
        {socCase.evidence.length === 0 ? (
          <EmptySection>No evidence recorded. Findings should not rely on unsupported claims.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.evidence.map((item) => (
              <li key={item.id}>
                <strong>{item.title}</strong>
                <span className="viewer-meta">
                  {evidenceTypeLabels[item.type]}
                  {item.source ? ` · ${item.source}` : ''}
                  {item.observedAt ? ` · ${formatDateTime(item.observedAt)}` : ''}
                </span>
                <p>{item.detail}</p>
                {item.analystNote && <p className="viewer-note">Analyst note: {item.analystNote}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">
          Decision journal / open questions {sectionCount(socCase.analystQuestions.length)}
        </h2>
        {socCase.analystQuestions.length === 0 ? (
          <EmptySection>No analyst questions recorded. Add decisions or uncertainties before final review.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.analystQuestions.map((question) => (
              <li key={question.id}>
                <strong>{question.question}</strong>
                <span className="viewer-meta">{questionStatusLabels[question.status]}</span>
                {question.answer && <p>Answer: {question.answer}</p>}
                {question.rationale && <p>Rationale: {question.rationale}</p>}
              </li>
            ))}
          </ul>
        )}
        {openQuestions.length > 0 && (
          <p className="viewer-warning">
            {openQuestions.length} open question(s) remain unresolved before final closure.
          </p>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">
          MITRE ATT&CK mappings {sectionCount(socCase.mitreMappings.length)}
        </h2>
        <p className="viewer-section-help">
          These mappings are analyst-authored and should explain what behavior supports each technique.
        </p>
        {socCase.mitreMappings.length === 0 ? (
          <EmptySection>No analyst-authored ATT&CK mappings recorded.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.mitreMappings.map((mapping) => {
              const findings = joinTitles(mapping.relatedFindingIds, findingTitleById)
              const evidence = joinTitles(mapping.relatedEvidenceIds, evidenceTitleById)
              return (
                <li key={mapping.id}>
                  <strong>{mapping.techniqueId} — {mapping.techniqueName}</strong>
                  <span className="viewer-meta">
                    {mapping.tactic ? `${mapping.tactic} · ` : ''}
                    {confidenceLabels[mapping.confidence]} confidence
                  </span>
                  <p>{mapping.rationale}</p>
                  {findings && <span className="viewer-meta">Supporting findings: {findings}</span>}
                  {evidence && <span className="viewer-meta">Supporting evidence: {evidence}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Closure decision and rationale</h2>
        {closure?.rationale || closure?.recommendedAction || closure?.impactSummary ? (
          <div className="viewer-copy">
            <div className="viewer-chips">
              <span className="chip">
                Classification: {closure?.verdict ? verdictLabels[closure.verdict] : 'Not set'}
              </span>
              <span className="chip">
                Closure: {closure?.closureStatus ? closureStatusLabels[closure.closureStatus] : 'Not set'}
              </span>
            </div>
            {closure?.rationale && <p><strong>Rationale:</strong> {closure.rationale}</p>}
            {closure?.recommendedAction && (
              <p><strong>Recommended action:</strong> {closure.recommendedAction}</p>
            )}
            {closure?.impactSummary && <p><strong>Impact:</strong> {closure.impactSummary}</p>}
          </div>
        ) : (
          <EmptySection>No closure rationale recorded. A reviewer cannot yet see why the case was classified.</EmptySection>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Recommendations {sectionCount(socCase.recommendations.length)}</h2>
        {socCase.recommendations.length === 0 ? (
          <EmptySection>No recommendations recorded. Add what should happen next.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <strong>{recommendation.title}</strong>
                <span className="viewer-meta">
                  {priorityLabels[recommendation.priority]} priority
                  {recommendation.category ? ` · ${recommendationCategoryLabels[recommendation.category]}` : ''}
                  {recommendation.status ? ` · ${recommendationStatusLabels[recommendation.status]}` : ''}
                </span>
                {recommendation.description && <p>{recommendation.description}</p>}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Case quality / limitations</h2>
        <p className="viewer-section-help">
          Advisory review summary only. Use it to spot weak evidence, unresolved questions,
          and report-readiness gaps before handoff.
        </p>
        <div className="viewer-chips">
          <span className="quality-summary quality-summary--pass">
            {quality.completion.complete} / {quality.completion.total} checks complete
          </span>
          <span className="quality-summary quality-summary--warning">
            {quality.counts.warning} needs attention
          </span>
          <span className="quality-summary quality-summary--missing">
            {quality.counts.missing} missing
          </span>
          <span className="chip">{quality.completion.label}</span>
        </div>
        {quality.coachSuggestions.length > 0 ? (
          <ul className="viewer-list viewer-list--compact">
            {quality.coachSuggestions.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        ) : (
          <p className="viewer-section-help">
            No major quality gaps were flagged. Final review should still confirm wording and evidence links.
          </p>
        )}
      </section>

      {socCase.lab?.enabled && (
        <section className="card viewer-section">
          <h2 className="detail-section__title">Lab / training disclaimer</h2>
          <div className="viewer-chips">
            {socCase.lab.platform && <span className="chip">{socCase.lab.platform}</span>}
            {socCase.lab.labName && <span className="chip">{socCase.lab.labName}</span>}
            <span className="chip">
              Writeup: {labWriteupStatusLabels[socCase.lab.writeupStatus ?? 'not_started']}
            </span>
            <span className="chip">
              Public writeup: {labDisclosureStateLabels[socCase.lab.publicWriteupAllowed ?? 'unknown']}
            </span>
            <span className="chip">
              Spoiler-sensitive: {labDisclosureStateLabels[socCase.lab.spoilerSensitive ?? 'unknown']}
            </span>
          </div>
          {socCase.lab.scenarioSummary && <p className="detail-text">{socCase.lab.scenarioSummary}</p>}
          {socCase.lab.learningNotes && <p className="viewer-note">Learning notes: {socCase.lab.learningNotes}</p>}
          <p className="viewer-share-note">
            Do not publish restricted lab answers, copyrighted material, or spoiler-sensitive content
            without permission.
          </p>
        </section>
      )}

      <section className="card viewer-section">
        <h2 className="detail-section__title">Synthetic / sanitized data disclaimer</h2>
        <p className="detail-text">
          This read-only view is generated from local browser data. SOC Case Workspace is designed
          for synthetic, sanitized, or training data only. Do not use this public portfolio demo for
          real sensitive investigations.
        </p>
      </section>
    </div>
  )
}
