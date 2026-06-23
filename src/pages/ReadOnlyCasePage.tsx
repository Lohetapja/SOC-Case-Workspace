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

  const openQuestions = socCase.analystQuestions.filter((question) => question.status === 'open')
  const markdown = buildCaseReport(socCase)

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
            <p className="viewer-kicker">Read-only case view</p>
            <h1 className="viewer-title">{socCase.title}</h1>
          </div>
          <span className={`sev sev--${socCase.severity}`}>{severityLabels[socCase.severity]}</span>
        </div>
        <div className="viewer-chips">
          <span className="chip">Status: {statusLabels[socCase.status]}</span>
          <span className="chip">Source: {sourceLabels[socCase.source]}</span>
          <span className="chip">Owner: {socCase.owner}</span>
          <span className="chip">
            Classification: {socCase.closure?.verdict ? verdictLabels[socCase.closure.verdict] : 'Not set'}
          </span>
          <span className="chip">
            Closure: {socCase.closure?.closureStatus ? closureStatusLabels[socCase.closure.closureStatus] : 'Not set'}
          </span>
        </div>
        <p className="viewer-summary">{socCase.summary || 'No case summary has been recorded.'}</p>
        <p className="viewer-share-note">
          Read-only view is generated from local browser data. Export Markdown or JSON to share
          outside this browser.
        </p>
        <div className="viewer-actions">
          <button type="button" className="btn" onClick={() => handleCopyReport(socCase)}>
            Copy Markdown report
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => handleDownloadReport(socCase)}>
            Download Markdown
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
        <h2 className="detail-section__title">Affected entities {sectionCount(socCase.affectedEntities.length)}</h2>
        {socCase.affectedEntities.length === 0 ? (
          <EmptySection>No affected entities recorded.</EmptySection>
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
        <h2 className="detail-section__title">Evidence summary {sectionCount(socCase.evidence.length)}</h2>
        {socCase.evidence.length === 0 ? (
          <EmptySection>No evidence recorded.</EmptySection>
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
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Timeline {sectionCount(socCase.timeline.length)}</h2>
        {socCase.timeline.length === 0 ? (
          <EmptySection>No timeline events recorded.</EmptySection>
        ) : (
          <ol className="viewer-timeline">
            {[...socCase.timeline].sort((a, b) => a.timestamp.localeCompare(b.timestamp)).map((event) => {
              const linkedEvidence = (event.relatedEvidenceIds ?? [])
                .map((id) => evidenceTitleById.get(id))
                .filter((title): title is string => Boolean(title))
              return (
                <li key={event.id}>
                  <time>{formatDateTime(event.timestamp)}</time>
                  <strong>{event.title}</strong>
                  {event.phase && <span className="chip">{timelinePhaseLabels[event.phase]}</span>}
                  <p>{event.description}</p>
                  {linkedEvidence.length > 0 && (
                    <span className="viewer-meta">Evidence: {linkedEvidence.join(', ')}</span>
                  )}
                </li>
              )
            })}
          </ol>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">
          Decision journal {sectionCount(socCase.analystQuestions.length)}
        </h2>
        {socCase.analystQuestions.length === 0 ? (
          <EmptySection>No analyst questions recorded.</EmptySection>
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
          <p className="viewer-warning">{openQuestions.length} open question(s) remain unresolved.</p>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Findings {sectionCount(socCase.findings.length)}</h2>
        {socCase.findings.length === 0 ? (
          <EmptySection>No analytical findings recorded.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.findings.map((finding) => {
              const evidence = (finding.relatedEvidenceIds ?? [])
                .map((id) => evidenceTitleById.get(id))
                .filter((title): title is string => Boolean(title))
              const events = (finding.relatedTimelineEventIds ?? [])
                .map((id) => timelineTitleById.get(id))
                .filter((title): title is string => Boolean(title))
              return (
                <li key={finding.id}>
                  <strong>{finding.title}</strong>
                  <span className="viewer-meta">
                    {finding.category ? `${findingCategoryLabels[finding.category]} · ` : ''}
                    {confidenceLabels[finding.confidence]} confidence
                    {finding.status ? ` · ${findingStatusLabels[finding.status]}` : ''}
                  </span>
                  <p>{finding.description}</p>
                  {evidence.length > 0 && <span className="viewer-meta">Evidence: {evidence.join(', ')}</span>}
                  {events.length > 0 && <span className="viewer-meta">Timeline: {events.join(', ')}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">
          MITRE ATT&amp;CK mappings {sectionCount(socCase.mitreMappings.length)}
        </h2>
        {socCase.mitreMappings.length === 0 ? (
          <EmptySection>No analyst-authored ATT&amp;CK mappings recorded.</EmptySection>
        ) : (
          <ul className="viewer-list">
            {socCase.mitreMappings.map((mapping) => {
              const findings = (mapping.relatedFindingIds ?? [])
                .map((id) => findingTitleById.get(id))
                .filter((title): title is string => Boolean(title))
              const evidence = (mapping.relatedEvidenceIds ?? [])
                .map((id) => evidenceTitleById.get(id))
                .filter((title): title is string => Boolean(title))
              return (
                <li key={mapping.id}>
                  <strong>{mapping.techniqueId} — {mapping.techniqueName}</strong>
                  <span className="viewer-meta">
                    {mapping.tactic ? `${mapping.tactic} · ` : ''}
                    {confidenceLabels[mapping.confidence]} confidence
                  </span>
                  <p>{mapping.rationale}</p>
                  {findings.length > 0 && <span className="viewer-meta">Findings: {findings.join(', ')}</span>}
                  {evidence.length > 0 && <span className="viewer-meta">Evidence: {evidence.join(', ')}</span>}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Closure rationale</h2>
        {socCase.closure?.rationale || socCase.closure?.recommendedAction || socCase.closure?.impactSummary ? (
          <div className="viewer-copy">
            {socCase.closure.rationale && <p><strong>Rationale:</strong> {socCase.closure.rationale}</p>}
            {socCase.closure.recommendedAction && (
              <p><strong>Recommended action:</strong> {socCase.closure.recommendedAction}</p>
            )}
            {socCase.closure.impactSummary && <p><strong>Impact:</strong> {socCase.closure.impactSummary}</p>}
          </div>
        ) : (
          <EmptySection>No closure rationale recorded.</EmptySection>
        )}
      </section>

      <section className="card viewer-section">
        <h2 className="detail-section__title">Recommendations {sectionCount(socCase.recommendations.length)}</h2>
        {socCase.recommendations.length === 0 ? (
          <EmptySection>No recommendations recorded.</EmptySection>
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
    </div>
  )
}
