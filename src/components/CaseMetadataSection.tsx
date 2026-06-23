import { useEffect, useState, type FormEvent } from 'react'
import type { SocCase } from '../types'
import type { CaseMetadataInput } from '../data/casesStore'
import { severityLabels, sourceLabels, statusLabels } from '../data/labels'
import { isAllowedValue } from '../utils/formValidation'

interface CaseMetadataSectionProps {
  socCase: SocCase
  onSave: (input: CaseMetadataInput) => void
}

const sources = Object.keys(sourceLabels) as SocCase['source'][]
const severities = Object.keys(severityLabels) as SocCase['severity'][]
const statuses = Object.keys(statusLabels) as SocCase['status'][]

/** Small edit-in-place form for the active case's core context. */
export function CaseMetadataSection({ socCase, onSave }: CaseMetadataSectionProps) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(socCase.title)
  const [summary, setSummary] = useState(socCase.summary)
  const [source, setSource] = useState(socCase.source)
  const [severity, setSeverity] = useState(socCase.severity)
  const [status, setStatus] = useState(socCase.status)
  const [owner, setOwner] = useState(socCase.owner)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(socCase.title)
    setSummary(socCase.summary)
    setSource(socCase.source)
    setSeverity(socCase.severity)
    setStatus(socCase.status)
    setOwner(socCase.owner)
  }, [socCase])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('A case title is required.')
      return
    }
    if (
      !isAllowedValue(source, sources) ||
      !isAllowedValue(severity, severities) ||
      !isAllowedValue(status, statuses)
    ) {
      setError('Choose valid source, severity, and status values.')
      return
    }
    onSave({ title, summary, source, severity, status, owner })
    setError(null)
    setEditing(false)
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">Case context</h2>
        {!editing && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing(true)}>
            Edit metadata
          </button>
        )}
      </div>

      {editing ? (
        <form className="form metadata-form" onSubmit={handleSubmit} aria-label="Edit case metadata">
          <div className="form__field">
            <label className="form__label" htmlFor="meta-title">Title</label>
            <input id="meta-title" className="form__input" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="meta-summary">Summary</label>
            <textarea id="meta-summary" className="form__textarea" value={summary} onChange={(event) => setSummary(event.target.value)} />
          </div>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="meta-source">Source</label>
              <select id="meta-source" className="form__select" value={source} onChange={(event) => setSource(event.target.value as SocCase['source'])}>
                {sources.map((value) => <option key={value} value={value}>{sourceLabels[value]}</option>)}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="meta-severity">Severity</label>
              <select id="meta-severity" className="form__select" value={severity} onChange={(event) => setSeverity(event.target.value as SocCase['severity'])}>
                {severities.map((value) => <option key={value} value={value}>{severityLabels[value]}</option>)}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="meta-status">Status</label>
              <select id="meta-status" className="form__select" value={status} onChange={(event) => setStatus(event.target.value as SocCase['status'])}>
                {statuses.map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
              </select>
            </div>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="meta-owner">Owner</label>
            <input id="meta-owner" className="form__input" value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Analyst name or unassigned" />
          </div>
          {error && <p className="form__error" role="alert">{error}</p>}
          <div className="form__actions">
            <button type="submit" className="btn">Save case context</button>
            <button type="button" className="btn btn--secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <p className="detail-text">{socCase.summary || 'No summary provided.'}</p>
      )}
    </section>
  )
}
