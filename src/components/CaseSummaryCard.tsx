import type { KeyboardEvent } from 'react'
import type { SocCase } from '../types'
import { severityLabels, sourceLabels, statusLabels, verdictLabels } from '../data/labels'
import { cn } from '../utils/classNames'

interface CaseSummaryCardProps {
  socCase: SocCase
  /** When provided, the card becomes clickable to open the case. */
  onOpen?: (id: string) => void
  /** When provided, a Delete action is shown. */
  onDelete?: (id: string) => void
}

/** Summary card for a case in the list. Clickable to open; delete is isolated. */
export function CaseSummaryCard({ socCase, onOpen, onDelete }: CaseSummaryCardProps) {
  const stats = [
    { label: 'Entities', value: socCase.affectedEntities.length },
    { label: 'Evidence', value: socCase.evidence.length },
    { label: 'Timeline', value: socCase.timeline.length },
    { label: 'Questions', value: socCase.analystQuestions.length },
    { label: 'Findings', value: socCase.findings.length },
    { label: 'ATT&CK', value: socCase.mitreMappings.length },
  ]

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!onOpen) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onOpen(socCase.id)
    }
  }

  return (
    <article
      className={cn('case-card', onOpen && 'case-card--clickable')}
      onClick={onOpen ? () => onOpen(socCase.id) : undefined}
      onKeyDown={onOpen ? handleKeyDown : undefined}
      role={onOpen ? 'button' : undefined}
      tabIndex={onOpen ? 0 : undefined}
      aria-label={onOpen ? `Open case: ${socCase.title}` : undefined}
    >
      <div className="case-card__top">
        <h3 className="case-card__title">{socCase.title}</h3>
        <span className={`sev sev--${socCase.severity}`}>{severityLabels[socCase.severity]}</span>
      </div>

      <div className="case-card__meta">
        <span className="chip">{statusLabels[socCase.status]}</span>
        <span className="chip">{sourceLabels[socCase.source]}</span>
        <span className="chip">Owner: {socCase.owner}</span>
      </div>

      <p className="case-card__summary">{socCase.summary}</p>

      <div className="case-card__stats">
        {stats.map((stat) => (
          <span key={stat.label} className="stat">
            <strong>{stat.value}</strong> {stat.label}
          </span>
        ))}
      </div>

      {socCase.closure?.verdict && (
        <p className="case-card__closure">{verdictLabels[socCase.closure.verdict]}</p>
      )}

      {onDelete && (
        <div className="case-card__actions">
          <button
            type="button"
            className="btn-link-danger"
            onClick={(event) => {
              event.stopPropagation()
              onDelete(socCase.id)
            }}
          >
            Delete
          </button>
        </div>
      )}
    </article>
  )
}
