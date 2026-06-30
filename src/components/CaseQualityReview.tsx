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
  { id: 'agents', title: 'Agent contributions' },
  { id: 'closure', title: 'Closure and report readiness' },
]

const STATUS_META: Record<QualityCheckStatus, { label: string; symbol: string }> = {
  pass: { label: 'Complete', symbol: '✓' },
  warning: { label: 'Needs attention', symbol: '!' },
  missing: { label: 'Missing', symbol: '×' },
}

/**
 * Maps each check group to the case-detail section that fixes it. Used for the
 * "Review …" jump links. Groups without a single clear target (e.g. agents) are
 * omitted and simply show no jump link.
 */
const GROUP_TARGET: Partial<Record<QualityCheckGroup, { anchorId: string; label: string }>> = {
  context: { anchorId: 'case-anchor-metadata', label: 'case context' },
  evidence: { anchorId: 'case-anchor-evidence', label: 'Evidence' },
  reasoning: { anchorId: 'case-anchor-findings', label: 'Findings & Decision Journal' },
  mitre: { anchorId: 'case-anchor-mitre', label: 'MITRE Mapping' },
  closure: { anchorId: 'case-anchor-closure', label: 'Closure & Recommendations' },
}

function scrollToAnchor(anchorId: string) {
  document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
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
            Advisory checks for evidence, reasoning, closure, and report readiness. They guide
            review but never block export.
          </p>
        </div>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onOpenReport}>
          Review report
        </button>
      </div>

      <div className="quality-review__summary" aria-label="Quality review summary">
        <span className="quality-summary quality-summary--pass">
          Case quality: {review.completion.complete} / {review.completion.total} checks complete
        </span>
        <span className="quality-summary quality-summary--warning">
          {review.counts.warning} needs attention
        </span>
        <span className="quality-summary quality-summary--missing">
          {review.counts.missing} missing
        </span>
        <strong className="quality-review__verdict">{review.completion.label}</strong>
      </div>

      <p className="quality-review__note">
        Only reviewed information saved to the case counts. External suggestions are not evidence
        until a human analyst validates and links them.
      </p>

      <div className="quality-review__coach">
        <section className="quality-coach">
          <h3 className="quality-group__title">Missing Data Coach</h3>
          {review.coachSuggestions.length > 0 ? (
            <ul className="quality-coach__list">
              {review.coachSuggestions.map((suggestion) => (
                <li key={suggestion}>{suggestion}</li>
              ))}
            </ul>
          ) : (
            <p className="quality-review__intro">
              No major gaps detected. Review the report wording before final handoff.
            </p>
          )}
        </section>

        <section className="quality-coach">
          <h3 className="quality-group__title">Senior review snapshot</h3>
          <p className="quality-review__intro">
            A quick review aid for mentors or senior analysts. It is not collaboration or approval workflow.
          </p>
          <ul className="quality-coach__list">
            <li>
              Unsupported findings:{' '}
              {review.seniorReview.unsupportedFindings.length > 0
                ? review.seniorReview.unsupportedFindings.join(', ')
                : 'none flagged'}
            </li>
            <li>
              Open questions:{' '}
              {review.seniorReview.openQuestions.length > 0
                ? review.seniorReview.openQuestions.join(', ')
                : 'none'}
            </li>
            <li>
              Evidence: {review.seniorReview.missingEvidence ? 'missing' : 'recorded'}
            </li>
            <li>
              Closure rationale:{' '}
              {review.seniorReview.missingClosureRationale ? 'missing' : 'documented'}
            </li>
            <li>
              MITRE rationale:{' '}
              {review.seniorReview.missingMitreRationale.length > 0
                ? review.seniorReview.missingMitreRationale.join(', ')
                : 'documented where mappings exist'}
            </li>
            <li>
              Recommendations: {review.seniorReview.missingRecommendations ? 'missing' : 'recorded'}
            </li>
            <li>
              Report readiness:{' '}
              {review.seniorReview.reportReady ? 'ready for final review' : 'needs analyst review'}
            </li>
          </ul>
        </section>
      </div>

      <div className="quality-review__groups">
        {GROUPS.map((group) => {
          const checks = review.checks.filter((check) => check.group === group.id)
          const target = GROUP_TARGET[group.id]
          const hasIssues = checks.some((check) => check.status !== 'pass')
          return (
            <section key={group.id} className="quality-group">
              <div className="quality-group__head">
                <h3 className="quality-group__title">{group.title}</h3>
                {target && hasIssues && (
                  <button
                    type="button"
                    className="btn-link quality-group__jump"
                    onClick={() => scrollToAnchor(target.anchorId)}
                  >
                    Review {target.label} →
                  </button>
                )}
              </div>
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
