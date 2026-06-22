import type { SocCase } from '../types'
import {
  reviewCaseQuality,
  type CaseQualityCheck,
  type QualityCheckGroup,
  type QualityCheckStatus,
} from '../utils/caseQuality'

const GROUPS: { id: QualityCheckGroup; title: string }[] = [
  { id: 'context', title: 'Case context' },
  { id: 'evidence', title: 'Evidence and timeline' },
  { id: 'reasoning', title: 'Analyst reasoning' },
  { id: 'mitre', title: 'ATT&CK mapping' },
  { id: 'closure', title: 'Closure and report readiness' },
]

const STATUS_META: Record<QualityCheckStatus, { label: string; symbol: string }> = {
  pass: { label: 'Pass', symbol: '✓' },
  warning: { label: 'Warning', symbol: '!' },
  missing: { label: 'Missing', symbol: '×' },
}

function QualityCheck({ check }: { check: CaseQualityCheck }) {
  const meta = STATUS_META[check.status]
  return (
    <li className={`quality-check quality-check--${check.status}`}>
      <span className="quality-check__symbol" aria-hidden="true">{meta.symbol}</span>
      <div className="quality-check__body">
        <div className="quality-check__head">
          <strong>{check.title}</strong>
          <span className={`quality-check__status quality-check__status--${check.status}`}>
            {meta.label}
          </span>
        </div>
        <p className="quality-check__guidance">{check.guidance}</p>
        {check.detail && <p className="quality-check__detail">{check.detail}</p>}
      </div>
    </li>
  )
}

interface CaseQualityReviewProps {
  socCase: SocCase
  onOpenReport: () => void
}

/** Advisory review of canonical analyst-reviewed case content; never blocks export. */
export function CaseQualityReview({ socCase, onOpenReport }: CaseQualityReviewProps) {
  const review = reviewCaseQuality(socCase)

  return (
    <section className="card quality-review" aria-labelledby="quality-review-title">
      <div className="quality-review__head">
        <div>
          <h2 id="quality-review-title" className="detail-section__title">Case Quality Review</h2>
          <p className="quality-review__intro">
            Advisory readiness checks for a defensible closure and report. Export remains available.
          </p>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onOpenReport}>
          Review report
        </button>
      </div>

      <div className="quality-review__summary" aria-label="Quality review summary">
        <span className="quality-summary quality-summary--pass">{review.counts.pass} passed</span>
        <span className="quality-summary quality-summary--warning">
          {review.counts.warning} warnings
        </span>
        <span className="quality-summary quality-summary--missing">
          {review.counts.missing} missing
        </span>
        <strong className="quality-review__verdict">
          {review.ready ? 'Ready for final analyst review' : 'Investigation needs attention'}
        </strong>
      </div>

      <p className="quality-review__note">
        Only information saved to the case counts. External suggestions should be reviewed and
        linked to evidence before they are treated as conclusions.
      </p>

      <div className="quality-review__groups">
        {GROUPS.map((group) => {
          const checks = review.checks.filter((check) => check.group === group.id)
          return (
            <section key={group.id} className="quality-group">
              <h3 className="quality-group__title">{group.title}</h3>
              <ul className="quality-group__list">
                {checks.map((check) => <QualityCheck key={check.id} check={check} />)}
              </ul>
            </section>
          )
        })}
      </div>
    </section>
  )
}
