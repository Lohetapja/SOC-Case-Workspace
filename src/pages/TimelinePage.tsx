import { useMemo, useState } from 'react'
import type { TimelinePhase } from '../types'
import { useCases } from '../hooks/useCases'
import { timelinePhaseLabels } from '../data/labels'
import { formatDateTime } from '../utils/format'
import { WorkspaceFilters } from '../components/WorkspaceFilters'

interface TimelinePageProps {
  onOpenCase: (id: string | null) => void
}

const phaseOptions = Object.keys(timelinePhaseLabels) as TimelinePhase[]

/** Read-only, cross-case timeline of all events, sorted chronologically. */
export function TimelinePage({ onOpenCase }: TimelinePageProps) {
  const { cases } = useCases()
  const [search, setSearch] = useState('')
  const [phase, setPhase] = useState('all')
  const [caseId, setCaseId] = useState('all')

  const items = useMemo(
    () =>
      cases
        .flatMap((socCase) => {
          const evidenceTitle = new Map(socCase.evidence.map((item) => [item.id, item.title]))
          return socCase.timeline.map((event) => ({
            ...event,
            caseId: socCase.id,
            caseTitle: socCase.title,
            evidenceTitles: (event.relatedEvidenceIds ?? [])
              .map((id) => evidenceTitle.get(id))
              .filter((title): title is string => Boolean(title)),
          }))
        })
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp)),
    [cases],
  )

  const filtered = items.filter((event) => {
    if (phase !== 'all' && event.phase !== phase) return false
    if (caseId !== 'all' && event.caseId !== caseId) return false
    if (search.trim()) {
      const haystack = `${event.title} ${event.description}`.toLowerCase()
      if (!haystack.includes(search.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Timeline</h1>
        <p className="page__subtitle">
          All timeline events across your cases, in chronological order ({items.length}{' '}
          {items.length === 1 ? 'event' : 'events'}). Read-only — edit inside a case.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p className="cases-note">
            No timeline events recorded yet. Open a case to add the alert time and key activity.
          </p>
          <button type="button" className="btn btn--secondary" onClick={() => onOpenCase(cases[0]?.id ?? null)}>
            {cases.length > 0 ? 'Open a case' : 'Go to Cases'}
          </button>
        </div>
      ) : (
        <>
          <WorkspaceFilters
            searchPlaceholder="Search timeline…"
            search={search}
            onSearch={setSearch}
            selects={[
              {
                id: 'phase',
                value: phase,
                onChange: setPhase,
                allLabel: 'All phases',
                options: phaseOptions.map((value) => ({ value, label: timelinePhaseLabels[value] })),
              },
              {
                id: 'case',
                value: caseId,
                onChange: setCaseId,
                allLabel: 'All cases',
                options: cases.map((socCase) => ({ value: socCase.id, label: socCase.title })),
              },
            ]}
          />

          {filtered.length === 0 ? (
            <p className="cases-note">No timeline events match your filters.</p>
          ) : (
            <ul className="detail-list">
              {filtered.map((event) => (
                <li key={`${event.caseId}-${event.id}`} className="detail-item">
                  <div className="detail-item__head">
                    <strong>{event.title}</strong>
                    {event.phase && <span className="chip">{timelinePhaseLabels[event.phase]}</span>}
                    <button
                      type="button"
                      className="btn-link detail-item__open"
                      onClick={() => onOpenCase(event.caseId)}
                    >
                      Open case →
                    </button>
                  </div>
                  <p className="detail-item__meta">{formatDateTime(event.timestamp)}</p>
                  <p className="detail-text">{event.description}</p>
                  {event.evidenceTitles.length > 0 && (
                    <p className="detail-item__meta">Evidence: {event.evidenceTitles.join(', ')}</p>
                  )}
                  <p className="detail-item__case">Case: {event.caseTitle}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
