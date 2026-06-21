import { useState, type FormEvent } from 'react'
import type { CaseSource, Severity } from '../types'
import type { NewCaseInput } from '../data/casesStore'
import { severityLabels, sourceLabels } from '../data/labels'
import { caseTemplates, getCaseTemplate } from '../data/caseTemplates'

interface CreateCaseFormProps {
  onCreate: (input: NewCaseInput) => void
  onCancel: () => void
}

const severityOptions = Object.keys(severityLabels) as Severity[]
const sourceOptions = Object.keys(sourceLabels) as CaseSource[]

/** Form to intake an alert as a new case, optionally seeded from a template. */
export function CreateCaseForm({ onCreate, onCancel }: CreateCaseFormProps) {
  const [title, setTitle] = useState('')
  const [summary, setSummary] = useState('')
  const [source, setSource] = useState<CaseSource>('edr')
  const [severity, setSeverity] = useState<Severity>('medium')
  const [owner, setOwner] = useState('')
  const [templateId, setTemplateId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const selectedTemplate = templateId ? getCaseTemplate(templateId) : undefined

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('A case title is required.')
      return
    }
    onCreate({ title, summary, source, severity, owner, templateId: templateId || undefined })
  }

  return (
    <form className="card form" onSubmit={handleSubmit} aria-label="Create case">
      <div className="form__field">
        <label className="form__label" htmlFor="case-template">Template</label>
        <select
          id="case-template"
          className="form__select"
          value={templateId}
          onChange={(event) => setTemplateId(event.target.value)}
        >
          <option value="">Blank case</option>
          {caseTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
        {selectedTemplate && (
          <p className="form__hint">
            {selectedTemplate.description} Prefills starter questions, draft ATT&CK mappings, and an
            investigation checklist — all editable.
          </p>
        )}
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="case-title">Title</label>
        <input
          id="case-title"
          className="form__input"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="e.g. Suspicious sign-in from a new device"
          autoFocus
        />
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="case-summary">Summary</label>
        <textarea
          id="case-summary"
          className="form__textarea"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          placeholder="What was alerted and why it matters (synthetic data only)."
        />
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="case-source">Source</label>
          <select
            id="case-source"
            className="form__select"
            value={source}
            onChange={(event) => setSource(event.target.value as CaseSource)}
          >
            {sourceOptions.map((value) => (
              <option key={value} value={value}>
                {sourceLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="case-severity">Severity</label>
          <select
            id="case-severity"
            className="form__select"
            value={severity}
            onChange={(event) => setSeverity(event.target.value as Severity)}
          >
            {severityOptions.map((value) => (
              <option key={value} value={value}>
                {severityLabels[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="form__field">
          <label className="form__label" htmlFor="case-owner">Owner</label>
          <input
            id="case-owner"
            className="form__input"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="analyst handle"
          />
        </div>
      </div>

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">Create case</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
