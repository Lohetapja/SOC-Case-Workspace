import { useState, type FormEvent } from 'react'
import type { CaseClosure, ClassificationVerdict, ClosureStatus } from '../types'
import type { ClosureInput } from '../data/casesStore'
import { closureStatusLabels, verdictLabels } from '../data/labels'

const verdictOptions: ClassificationVerdict[] = [
  'true_positive',
  'benign_true_positive',
  'false_positive',
  'suspicious',
  'undetermined',
]
const statusOptions: ClosureStatus[] = ['open', 'monitoring', 'escalated', 'closed']

function statusChipClass(status: ClosureStatus): string {
  if (status === 'closed') return 'chip chip--ok'
  if (status === 'escalated') return 'chip chip--danger'
  if (status === 'monitoring') return 'chip chip--open'
  return 'chip'
}

interface ClosureSectionProps {
  closure?: CaseClosure
  onSave: (input: ClosureInput) => void
}

/**
 * Editable classification & closure assessment. Can be filled progressively —
 * the case does not need to be closed to classify it.
 */
export function ClosureSection({ closure, onSave }: ClosureSectionProps) {
  const [editing, setEditing] = useState(false)
  const [verdict, setVerdict] = useState<ClassificationVerdict | ''>(closure?.verdict ?? '')
  const [status, setStatus] = useState<ClosureStatus | ''>(closure?.closureStatus ?? '')
  const [rationale, setRationale] = useState(closure?.rationale ?? '')
  const [recommendedAction, setRecommendedAction] = useState(closure?.recommendedAction ?? '')
  const [impactSummary, setImpactSummary] = useState(closure?.impactSummary ?? '')

  const hasAssessment = Boolean(
    closure?.verdict ||
      closure?.closureStatus ||
      closure?.rationale ||
      closure?.recommendedAction ||
      closure?.impactSummary,
  )

  function startEdit() {
    setVerdict(closure?.verdict ?? '')
    setStatus(closure?.closureStatus ?? '')
    setRationale(closure?.rationale ?? '')
    setRecommendedAction(closure?.recommendedAction ?? '')
    setImpactSummary(closure?.impactSummary ?? '')
    setEditing(true)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSave({ verdict, closureStatus: status, rationale, recommendedAction, impactSummary })
    setEditing(false)
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">Classification &amp; closure</h2>
        {!editing && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={startEdit}>
            {hasAssessment ? 'Edit' : 'Set classification'}
          </button>
        )}
      </div>

      {editing ? (
        <form className="form closure-form" onSubmit={handleSubmit} aria-label="Classification and closure">
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="cl-verdict">Classification</label>
              <select
                id="cl-verdict"
                className="form__select"
                value={verdict}
                onChange={(event) => setVerdict(event.target.value as ClassificationVerdict | '')}
              >
                <option value="">— not set —</option>
                {verdictOptions.map((value) => (
                  <option key={value} value={value}>{verdictLabels[value]}</option>
                ))}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="cl-status">Closure status</label>
              <select
                id="cl-status"
                className="form__select"
                value={status}
                onChange={(event) => setStatus(event.target.value as ClosureStatus | '')}
              >
                <option value="">— not set —</option>
                {statusOptions.map((value) => (
                  <option key={value} value={value}>{closureStatusLabels[value]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="cl-rationale">Closure rationale</label>
            <textarea
              id="cl-rationale"
              className="form__textarea"
              value={rationale}
              onChange={(event) => setRationale(event.target.value)}
              placeholder="Why this classification / closure (synthetic data only)."
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="cl-action">Recommended next action</label>
            <textarea
              id="cl-action"
              className="form__textarea"
              value={recommendedAction}
              onChange={(event) => setRecommendedAction(event.target.value)}
              placeholder="What should happen next."
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="cl-impact">Business / security impact</label>
            <textarea
              id="cl-impact"
              className="form__textarea"
              value={impactSummary}
              onChange={(event) => setImpactSummary(event.target.value)}
              placeholder="Summary of impact."
            />
          </div>

          <div className="form__actions">
            <button type="submit" className="btn">Save</button>
            <button type="button" className="btn btn--secondary" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </div>
        </form>
      ) : hasAssessment ? (
        <div className="closure-view">
          <div className="closure-view__chips">
            {closure?.verdict && <span className="chip">{verdictLabels[closure.verdict]}</span>}
            {closure?.closureStatus && (
              <span className={statusChipClass(closure.closureStatus)}>
                {closureStatusLabels[closure.closureStatus]}
              </span>
            )}
          </div>
          {closure?.rationale && (
            <p className="detail-text"><strong>Rationale:</strong> {closure.rationale}</p>
          )}
          {closure?.recommendedAction && (
            <p className="detail-text"><strong>Recommended action:</strong> {closure.recommendedAction}</p>
          )}
          {closure?.impactSummary && (
            <p className="detail-text"><strong>Impact:</strong> {closure.impactSummary}</p>
          )}
        </div>
      ) : (
        <p className="detail-empty">Not classified yet.</p>
      )}
    </section>
  )
}
