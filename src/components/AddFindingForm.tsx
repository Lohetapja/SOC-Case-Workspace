import { useState, type FormEvent } from 'react'
import type {
  Confidence,
  EvidenceItem,
  FindingCategory,
  FindingStatus,
  Severity,
  TimelineEvent,
} from '../types'
import type { NewFindingInput } from '../data/casesStore'
import {
  confidenceLabels,
  findingCategoryLabels,
  findingStatusLabels,
  severityLabels,
} from '../data/labels'

const categoryOptions = Object.keys(findingCategoryLabels) as FindingCategory[]
const severityOptions = Object.keys(severityLabels) as Severity[]
const confidenceOptions = Object.keys(confidenceLabels) as Confidence[]
const statusOptions = Object.keys(findingStatusLabels) as FindingStatus[]

interface AddFindingFormProps {
  evidence: EvidenceItem[]
  timeline: TimelineEvent[]
  onAdd: (input: NewFindingInput) => void
  onCancel: () => void
}

/** Form to add one evidence-backed finding to the active case. */
export function AddFindingForm({ evidence, timeline, onAdd, onCancel }: AddFindingFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<FindingCategory>('suspicious_activity')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [confidence, setConfidence] = useState<Confidence>('medium')
  const [status, setStatus] = useState<FindingStatus>('draft')
  const [description, setDescription] = useState('')
  const [evidenceIds, setEvidenceIds] = useState<string[]>([])
  const [timelineIds, setTimelineIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  function toggle(list: string[], setList: (next: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((value) => value !== id) : [...list, id])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('A finding title is required.')
      return
    }
    onAdd({
      title,
      category,
      severity,
      confidence,
      status,
      description,
      relatedEvidenceIds: evidenceIds,
      relatedTimelineEventIds: timelineIds,
    })
  }

  return (
    <form className="form finding-form" onSubmit={handleSubmit} aria-label="Add finding">
      <div className="form__field">
        <label className="form__label" htmlFor="f-title">Title</label>
        <input
          id="f-title"
          className="form__input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Phishing-driven macro execution"
          autoFocus
        />
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="f-category">Category</label>
          <select
            id="f-category"
            className="form__select"
            value={category}
            onChange={(event) => setCategory(event.target.value as FindingCategory)}
          >
            {categoryOptions.map((value) => (
              <option key={value} value={value}>{findingCategoryLabels[value]}</option>
            ))}
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="f-severity">Severity / impact</label>
          <select
            id="f-severity"
            className="form__select"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as Severity)}
          >
            {severityOptions.map((value) => (
              <option key={value} value={value}>{severityLabels[value]}</option>
            ))}
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="f-confidence">Confidence</label>
          <select
            id="f-confidence"
            className="form__select"
            value={confidence}
            onChange={(event) => setConfidence(event.target.value as Confidence)}
          >
            {confidenceOptions.map((value) => (
              <option key={value} value={value}>{confidenceLabels[value]}</option>
            ))}
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="f-status">Status</label>
          <select
            id="f-status"
            className="form__select"
            value={status}
            onChange={(event) => setStatus(event.target.value as FindingStatus)}
          >
            {statusOptions.map((value) => (
              <option key={value} value={value}>{findingStatusLabels[value]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="f-description">Description</label>
        <textarea
          id="f-description"
          className="form__textarea"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="The conclusion and what it means (synthetic data only)."
        />
      </div>

      {evidence.length > 0 && (
        <fieldset className="form__checks">
          <legend>Supporting evidence</legend>
          {evidence.map((item) => (
            <label key={item.id} className="form__check">
              <input
                type="checkbox"
                checked={evidenceIds.includes(item.id)}
                onChange={() => toggle(evidenceIds, setEvidenceIds, item.id)}
              />
              <span>{item.title}</span>
            </label>
          ))}
        </fieldset>
      )}

      {timeline.length > 0 && (
        <fieldset className="form__checks">
          <legend>Related timeline events</legend>
          {timeline.map((event) => (
            <label key={event.id} className="form__check">
              <input
                type="checkbox"
                checked={timelineIds.includes(event.id)}
                onChange={() => toggle(timelineIds, setTimelineIds, event.id)}
              />
              <span>{event.title}</span>
            </label>
          ))}
        </fieldset>
      )}

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">Add finding</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
