import type { SocCase } from '../types'
import { severityLabels, sourceLabels, statusLabels, verdictLabels } from '../data/labels'

interface CaseSummaryCardProps {
  socCase: SocCase
}

/**
 * Read-only summary of a case for the Cases preview. Presentation only — no
 * editing or persistence (that arrives with the case list & create form).
 */
export function CaseSummaryCard({ socCase }: CaseSummaryCardProps) {
  const stats = [
    { label: 'Entities', value: socCase.affectedEntities.length },
    { label: 'Evidence', value: socCase.evidence.length },
    { label: 'Timeline', value: socCase.timeline.length },
    { label: 'Questions', value: socCase.analystQuestions.length },
    { label: 'Findings', value: socCase.findings.length },
    { label: 'ATT&CK', value: socCase.mitreMappings.length },
  ]

  return (
    <article className="case-card">
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

      {socCase.closure && (
        <p className="case-card__closure">
          Closed — {verdictLabels[socCase.closure.verdict]}
        </p>
      )}
    </article>
  )
}
