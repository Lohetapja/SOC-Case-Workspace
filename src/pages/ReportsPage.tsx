import { useMemo, useState } from 'react'
import type { CaseStatus, ClassificationVerdict, Severity, SocCase } from '../types'
import { useCases } from '../hooks/useCases'
import { severityLabels, statusLabels, verdictLabels, closureStatusLabels } from '../data/labels'
import { ReportSection } from '../components/ReportSection'
import { WorkspaceFilters } from '../components/WorkspaceFilters'
import { GuidedModeToggle } from '../components/GuidedModeToggle'
import { useGuidedMode } from '../hooks/useGuidedMode'
import { buildCaseReport, reportFilename } from '../utils/caseReport'
import { formatDateTime } from '../utils/format'

interface ReportsPageProps {
  /** Shared active case; falls back to the first stored case. */
  activeCaseId: string | null
  onSelectCase: (id: string) => void
  onOpenCase: (id: string | null) => void
}

const statusOptions = Object.keys(statusLabels) as CaseStatus[]
const severityOptions = Object.keys(severityLabels) as Severity[]
const classificationOptions = Object.keys(verdictLabels) as ClassificationVerdict[]

function caseMatchesSearch(socCase: SocCase, search: string): boolean {
  if (!search.trim()) return true
  const closure = socCase.closure
  const haystack = [
    socCase.title,
    socCase.summary,
    socCase.owner,
    statusLabels[socCase.status],
    severityLabels[socCase.severity],
    closure?.verdict ? verdictLabels[closure.verdict] : '',
    closure?.closureStatus ? closureStatusLabels[closure.closureStatus] : '',
    closure?.rationale ?? '',
  ].join(' ').toLowerCase()
  return haystack.includes(search.trim().toLowerCase())
}

function closureLabel(socCase: SocCase): string {
  const closure = socCase.closure
  const labels = [
    closure?.verdict ? verdictLabels[closure.verdict] : undefined,
    closure?.closureStatus ? closureStatusLabels[closure.closureStatus] : undefined,
  ].filter(Boolean)
  return labels.length > 0 ? labels.join(' / ') : 'Not classified'
}

/** Workspace report center plus Markdown preview/export for one selected case. */
export function ReportsPage({ activeCaseId, onSelectCase, onOpenCase }: ReportsPageProps) {
  const { cases } = useCases()
  const { guidedMode, setGuidedMode } = useGuidedMode()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [severity, setSeverity] = useState('all')
  const [classification, setClassification] = useState('all')
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const activeCase = cases.find((socCase) => socCase.id === activeCaseId) ?? cases[0]

  const filteredCases = useMemo(
    () =>
      cases
        .filter((socCase) => {
          if (status !== 'all' && socCase.status !== status) return false
          if (severity !== 'all' && socCase.severity !== severity) return false
          if (classification === 'unclassified' && socCase.closure?.verdict) return false
          if (
            classification !== 'all' &&
            classification !== 'unclassified' &&
            socCase.closure?.verdict !== classification
          ) {
            return false
          }
          return caseMatchesSearch(socCase, search)
        })
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)),
    [cases, classification, search, severity, status],
  )

  async function handleCopyReport(socCase: SocCase) {
    const markdown = buildCaseReport(socCase)
    try {
      await navigator.clipboard.writeText(markdown)
      setActionFeedback(`Copied Markdown report for "${socCase.title}".`)
    } catch {
      setActionFeedback('Clipboard access was unavailable. Open the report preview and copy from the text area.')
    }
    window.setTimeout(() => setActionFeedback(null), 3500)
  }

  function handleDownloadReport(socCase: SocCase) {
    const markdown = buildCaseReport(socCase)
    const filename = reportFilename(socCase)
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
    setActionFeedback(`Download started: ${filename}`)
    window.setTimeout(() => setActionFeedback(null), 3500)
  }

  if (cases.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Report Center</h1>
          <p className="page__subtitle">
            Generate Markdown investigation reports from local, synthetic case data.
          </p>
        </header>
        <div className="empty-state">
          <p className="cases-note">
            No cases available for report export. Create a case or load a guided sample first.
          </p>
          <button type="button" className="btn" onClick={() => onOpenCase(null)}>
            Go to Cases
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1 className="page__title">Report Center</h1>
          <p className="page__subtitle">
            Review report readiness across all local cases, then preview, copy, or download a
            Markdown investigation report. Reports are generated from synthetic browser data only.
          </p>
        </div>
        {activeCase && (
          <div className="page-header__actions">
            <GuidedModeToggle enabled={guidedMode} onChange={setGuidedMode} />
            <button
              type="button"
              className="btn btn--sm"
              onClick={() => onOpenCase(activeCase.id)}
            >
              Open selected case
            </button>
          </div>
        )}
      </header>

      <WorkspaceFilters
        searchPlaceholder="Search reports by case, owner, classification..."
        search={search}
        onSearch={setSearch}
        selects={[
          {
            id: 'status',
            value: status,
            onChange: setStatus,
            allLabel: 'All statuses',
            options: statusOptions.map((value) => ({ value, label: statusLabels[value] })),
          },
          {
            id: 'severity',
            value: severity,
            onChange: setSeverity,
            allLabel: 'All severities',
            options: severityOptions.map((value) => ({ value, label: severityLabels[value] })),
          },
          {
            id: 'classification',
            value: classification,
            onChange: setClassification,
            allLabel: 'All classifications',
            options: [
              { value: 'unclassified', label: 'Not classified' },
              ...classificationOptions.map((value) => ({ value, label: verdictLabels[value] })),
            ],
          },
        ]}
      />

      {actionFeedback && <p className="action-feedback" role="status">{actionFeedback}</p>}

      {filteredCases.length === 0 ? (
        <p className="cases-note">
          No cases match your report filters. Clear filters or open Cases to add more investigation
          data before exporting a report.
        </p>
      ) : (
        <div className="case-list">
          {filteredCases.map((socCase) => {
            const isSelected = activeCase?.id === socCase.id
            return (
              <article key={socCase.id} className="case-card">
                <div className="case-card__top">
                  <div>
                    <h2 className="case-card__title">{socCase.title}</h2>
                    <div className="case-card__meta">
                      <span className="chip">{statusLabels[socCase.status]}</span>
                      <span className={`sev sev--${socCase.severity}`}>
                        {severityLabels[socCase.severity]}
                      </span>
                      <span className="chip">{closureLabel(socCase)}</span>
                      {isSelected && <span className="chip chip--ok">Previewing</span>}
                    </div>
                  </div>
                  <button type="button" className="btn-link" onClick={() => onOpenCase(socCase.id)}>
                    Open case →
                  </button>
                </div>

                <div className="case-card__stats">
                  <span><strong>{socCase.evidence.length}</strong> evidence</span>
                  <span><strong>{socCase.timeline.length}</strong> timeline</span>
                  <span><strong>{socCase.findings.length}</strong> findings</span>
                  <span><strong>{socCase.mitreMappings.length}</strong> ATT&amp;CK</span>
                  <span>Updated {formatDateTime(socCase.updatedAt)}</span>
                </div>

                <div className="case-card__actions report-card__actions">
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => onSelectCase(socCase.id)}>
                    {isSelected ? 'Report preview open' : 'Open report preview'}
                  </button>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => handleCopyReport(socCase)}>
                    Copy Markdown
                  </button>
                  <button type="button" className="btn btn--secondary btn--sm" onClick={() => handleDownloadReport(socCase)}>
                    Download .md
                  </button>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {activeCase ? (
        <section className="card report-center__preview" aria-label="Selected report preview">
          <div className="detail-section__head">
            <div>
              <h2 className="detail-section__title">Markdown preview</h2>
              <p className="detail-item__meta">Selected case: {activeCase.title}</p>
            </div>
          </div>
          <ReportSection socCase={activeCase} guidedMode={guidedMode} />
        </section>
      ) : (
        <p className="cases-note">Select a case to preview its Markdown report.</p>
      )}
    </div>
  )
}
