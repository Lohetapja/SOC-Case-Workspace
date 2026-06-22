import { useState, type FormEvent } from 'react'
import type { EvidenceItem, TimelinePhase } from '../types'
import type { NewTimelineEventInput } from '../data/casesStore'
import { timelinePhaseLabels } from '../data/labels'

const phaseOptions = Object.keys(timelinePhaseLabels) as TimelinePhase[]

/** Current local time as a value for <input type="datetime-local">. */
function nowDateTimeLocal(): string {
  const now = new Date()
  const pad = (value: number) => String(value).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`
}

interface AddTimelineEventFormProps {
  /** The case's evidence, offered as an optional link for the event. */
  evidence: EvidenceItem[]
  onAdd: (input: NewTimelineEventInput) => void
  onCancel: () => void
  initialValue?: NewTimelineEventInput
}

/** Small form to add or edit one timeline event. */
export function AddTimelineEventForm({ evidence, onAdd, onCancel, initialValue }: AddTimelineEventFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [timestamp, setTimestamp] = useState(initialValue?.timestamp ?? nowDateTimeLocal())
  const [phase, setPhase] = useState<TimelinePhase>(initialValue?.phase ?? 'attacker_activity')
  const [description, setDescription] = useState(initialValue?.description ?? '')
  const [relatedEvidenceId, setRelatedEvidenceId] = useState(initialValue?.relatedEvidenceId ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('A title is required.')
      return
    }
    if (!timestamp) {
      setError('A timestamp is required.')
      return
    }
    onAdd({ title, timestamp, phase, description, relatedEvidenceId })
  }

  return (
    <form className="form timeline-form" onSubmit={handleSubmit} aria-label={initialValue ? 'Edit timeline event' : 'Add timeline event'}>
      <div className="form__field">
        <label className="form__label" htmlFor="tl-title">Title</label>
        <input
          id="tl-title"
          className="form__input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Outbound beacon attempt"
          autoFocus
        />
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="tl-time">Timestamp</label>
          <input
            id="tl-time"
            type="datetime-local"
            className="form__input"
            value={timestamp}
            onChange={(event) => setTimestamp(event.target.value)}
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="tl-phase">Phase</label>
          <select
            id="tl-phase"
            className="form__select"
            value={phase}
            onChange={(event) => setPhase(event.target.value as TimelinePhase)}
          >
            {phaseOptions.map((value) => (
              <option key={value} value={value}>
                {timelinePhaseLabels[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="tl-detail">Description</label>
        <textarea
          id="tl-detail"
          className="form__textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What happened at this point (synthetic data only)."
        />
      </div>

      {evidence.length > 0 && (
        <div className="form__field">
          <label className="form__label" htmlFor="tl-evidence">Related evidence (optional)</label>
          <select
            id="tl-evidence"
            className="form__select"
            value={relatedEvidenceId}
            onChange={(event) => setRelatedEvidenceId(event.target.value)}
          >
            <option value="">None</option>
            {evidence.map((item) => (
              <option key={item.id} value={item.id}>
                {item.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">{initialValue ? 'Save event' : 'Add event'}</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
