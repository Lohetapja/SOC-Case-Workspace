import { useMemo, useState } from 'react'
import type { Confidence } from '../types'
import { useCases } from '../hooks/useCases'
import { confidenceLabels } from '../data/labels'
import { WorkspaceFilters } from '../components/WorkspaceFilters'

interface MitreMappingPageProps {
  onOpenCase: (id: string | null) => void
}

const confidenceOptions = Object.keys(confidenceLabels) as Confidence[]

/** Read-only, cross-case view of all analyst-authored ATT&CK mappings. */
export function MitreMappingPage({ onOpenCase }: MitreMappingPageProps) {
  const { cases } = useCases()
  const [search, setSearch] = useState('')
  const [tactic, setTactic] = useState('all')
  const [confidence, setConfidence] = useState('all')
  const [caseId, setCaseId] = useState('all')

  const items = useMemo(
    () =>
      cases.flatMap((socCase) => {
        const findingTitle = new Map(socCase.findings.map((finding) => [finding.id, finding.title]))
        const evidenceTitle = new Map(socCase.evidence.map((item) => [item.id, item.title]))
        return socCase.mitreMappings.map((mapping) => ({
          ...mapping,
          caseId: socCase.id,
          caseTitle: socCase.title,
          findingTitles: (mapping.relatedFindingIds ?? [])
            .map((id) => findingTitle.get(id))
            .filter((title): title is string => Boolean(title)),
          evidenceTitles: (mapping.relatedEvidenceIds ?? [])
            .map((id) => evidenceTitle.get(id))
            .filter((title): title is string => Boolean(title)),
        }))
      }),
    [cases],
  )

  const tacticOptions = useMemo(
    () => [...new Set(items.map((mapping) => mapping.tactic).filter(Boolean))].sort(),
    [items],
  )

  const filtered = items.filter((mapping) => {
    if (tactic !== 'all' && mapping.tactic !== tactic) return false
    if (confidence !== 'all' && mapping.confidence !== confidence) return false
    if (caseId !== 'all' && mapping.caseId !== caseId) return false
    if (search.trim()) {
      const haystack =
        `${mapping.techniqueId} ${mapping.techniqueName} ${mapping.tactic} ${mapping.rationale} ${mapping.caseTitle} ${mapping.findingTitles.join(' ')} ${mapping.evidenceTitles.join(' ')}`.toLowerCase()
      if (!haystack.includes(search.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">MITRE ATT&CK mapping</h1>
        <p className="page__subtitle">
          Analyst-authored ATT&CK mappings across your cases ({items.length}{' '}
          {items.length === 1 ? 'mapping' : 'mappings'}). These are analyst conclusions, not
          automatic detections — each should explain why a technique applies, what evidence
          supports it, and how confident the analyst is. Read-only — edit inside a case.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="empty-state">
          <p className="cases-note">
            No MITRE mappings recorded yet. Open a case to add ATT&amp;CK techniques with rationale and
            confidence.
          </p>
          <button type="button" className="btn btn--secondary" onClick={() => onOpenCase(cases[0]?.id ?? null)}>
            {cases.length > 0 ? 'Open a case' : 'Go to Cases'}
          </button>
        </div>
      ) : (
        <>
          <WorkspaceFilters
            searchPlaceholder="Search technique, tactic, rationale…"
            search={search}
            onSearch={setSearch}
            selects={[
              {
                id: 'tactic',
                value: tactic,
                onChange: setTactic,
                allLabel: 'All tactics',
                options: tacticOptions.map((value) => ({ value, label: value })),
              },
              {
                id: 'confidence',
                value: confidence,
                onChange: setConfidence,
                allLabel: 'All confidence',
                options: confidenceOptions.map((value) => ({ value, label: confidenceLabels[value] })),
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
            <p className="cases-note">No mappings match your filters.</p>
          ) : (
            <ul className="detail-list">
              {filtered.map((mapping) => (
                <li key={`${mapping.caseId}-${mapping.id}`} className="detail-item">
                  <div className="detail-item__head">
                    <strong>
                      {mapping.techniqueId} — {mapping.techniqueName}
                    </strong>
                    {mapping.tactic && <span className="chip">{mapping.tactic}</span>}
                    <span className="chip">{confidenceLabels[mapping.confidence]} confidence</span>
                    <button
                      type="button"
                      className="btn-link detail-item__open"
                      onClick={() => onOpenCase(mapping.caseId)}
                    >
                      Open case →
                    </button>
                  </div>
                  {mapping.rationale && (
                    <p className="detail-text"><strong>Rationale:</strong> {mapping.rationale}</p>
                  )}
                  {mapping.findingTitles.length > 0 && (
                    <p className="detail-item__meta">
                      Supporting findings: {mapping.findingTitles.join(', ')}
                    </p>
                  )}
                  {mapping.evidenceTitles.length > 0 && (
                    <p className="detail-item__meta">
                      Supporting evidence: {mapping.evidenceTitles.join(', ')}
                    </p>
                  )}
                  <p className="detail-item__case">Case: {mapping.caseTitle}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
