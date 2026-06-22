import { useMemo, useState } from 'react'
import type { EvidenceType } from '../types'
import { useCases } from '../hooks/useCases'
import { evidenceTypeLabels } from '../data/labels'
import { formatDateTime } from '../utils/format'
import { WorkspaceFilters } from '../components/WorkspaceFilters'

interface EvidencePageProps {
  onOpenCase: (id: string) => void
}

const evidenceTypeOptions = Object.keys(evidenceTypeLabels) as EvidenceType[]

/** Read-only, cross-case view of all evidence, with search/filters. */
export function EvidencePage({ onOpenCase }: EvidencePageProps) {
  const { cases } = useCases()
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [caseId, setCaseId] = useState('all')

  const items = useMemo(
    () =>
      cases.flatMap((socCase) =>
        socCase.evidence.map((item) => ({ ...item, caseId: socCase.id, caseTitle: socCase.title })),
      ),
    [cases],
  )

  const filtered = items.filter((item) => {
    if (type !== 'all' && item.type !== type) return false
    if (caseId !== 'all' && item.caseId !== caseId) return false
    if (search.trim()) {
      const haystack = `${item.title} ${item.detail} ${item.source ?? ''} ${item.analystNote ?? ''}`.toLowerCase()
      if (!haystack.includes(search.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Evidence</h1>
        <p className="page__subtitle">
          All evidence across your cases ({items.length} {items.length === 1 ? 'item' : 'items'}).
          Read-only — edit evidence inside a case.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="cases-note">No evidence recorded yet. Open a case to add evidence.</p>
      ) : (
        <>
          <WorkspaceFilters
            searchPlaceholder="Search evidence…"
            search={search}
            onSearch={setSearch}
            selects={[
              {
                id: 'type',
                value: type,
                onChange: setType,
                allLabel: 'All types',
                options: evidenceTypeOptions.map((value) => ({ value, label: evidenceTypeLabels[value] })),
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
            <p className="cases-note">No evidence matches your filters.</p>
          ) : (
            <ul className="detail-list">
              {filtered.map((item) => (
                <li key={`${item.caseId}-${item.id}`} className="detail-item">
                  <div className="detail-item__head">
                    <strong>{item.title}</strong>
                    <span className="chip">{evidenceTypeLabels[item.type]}</span>
                    <button
                      type="button"
                      className="btn-link detail-item__open"
                      onClick={() => onOpenCase(item.caseId)}
                    >
                      Open case →
                    </button>
                  </div>
                  <p className="detail-text">{item.detail}</p>
                  {(item.source || item.observedAt) && (
                    <p className="detail-item__meta">
                      {[item.source, item.observedAt && formatDateTime(item.observedAt)]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  )}
                  {item.analystNote && <p className="detail-item__note">Note: {item.analystNote}</p>}
                  <p className="detail-item__case">Case: {item.caseTitle}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
