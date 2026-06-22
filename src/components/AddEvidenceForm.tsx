import { useState, type FormEvent } from 'react'
import type { EvidenceType } from '../types'
import type { NewEvidenceInput } from '../data/casesStore'
import { evidenceTypeLabels } from '../data/labels'

const evidenceTypeOptions = Object.keys(evidenceTypeLabels) as EvidenceType[]

interface AddEvidenceFormProps {
  onAdd: (input: NewEvidenceInput) => void
  onCancel: () => void
  initialValue?: NewEvidenceInput
}

/** Small form to add or edit one evidence item. */
export function AddEvidenceForm({ onAdd, onCancel, initialValue }: AddEvidenceFormProps) {
  const [title, setTitle] = useState(initialValue?.title ?? '')
  const [type, setType] = useState<EvidenceType>(initialValue?.type ?? 'log')
  const [source, setSource] = useState(initialValue?.source ?? '')
  const [observedAt, setObservedAt] = useState(initialValue?.observedAt ?? '')
  const [detail, setDetail] = useState(initialValue?.detail ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('An evidence title is required.')
      return
    }
    onAdd({ title, type, source, observedAt, detail })
  }

  return (
    <form className="form evidence-form" onSubmit={handleSubmit} aria-label={initialValue ? 'Edit evidence' : 'Add evidence'}>
      <div className="form__field">
        <label className="form__label" htmlFor="ev-title">Title</label>
        <input
          id="ev-title"
          className="form__input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Suspicious outbound connection"
          autoFocus
        />
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="ev-type">Type</label>
          <select
            id="ev-type"
            className="form__select"
            value={type}
            onChange={(event) => setType(event.target.value as EvidenceType)}
          >
            {evidenceTypeOptions.map((value) => (
              <option key={value} value={value}>
                {evidenceTypeLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="ev-source">Source</label>
          <input
            id="ev-source"
            className="form__input"
            value={source}
            onChange={(event) => setSource(event.target.value)}
            placeholder="e.g. EDR network telemetry"
          />
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="ev-time">Observed at</label>
          <input
            id="ev-time"
            type="datetime-local"
            className="form__input"
            value={observedAt}
            onChange={(event) => setObservedAt(event.target.value)}
          />
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="ev-detail">Description / notes</label>
        <textarea
          id="ev-detail"
          className="form__textarea"
          value={detail}
          onChange={(event) => setDetail(event.target.value)}
          placeholder="What was observed (synthetic data only)."
        />
      </div>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">{initialValue ? 'Save evidence' : 'Add evidence'}</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
