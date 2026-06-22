import { useState, type FormEvent } from 'react'
import type { Confidence, EvidenceItem, Finding } from '../types'
import type { NewMitreInput } from '../data/casesStore'
import { confidenceLabels } from '../data/labels'

const confidenceOptions = Object.keys(confidenceLabels) as Confidence[]

interface AddMitreMappingFormProps {
  findings: Finding[]
  evidence: EvidenceItem[]
  onAdd: (input: NewMitreInput) => void
  onCancel: () => void
  initialValue?: NewMitreInput
}

/** Form to add or edit one analyst-authored ATT&CK mapping. */
export function AddMitreMappingForm({ findings, evidence, onAdd, onCancel, initialValue }: AddMitreMappingFormProps) {
  const [techniqueId, setTechniqueId] = useState(initialValue?.techniqueId ?? '')
  const [techniqueName, setTechniqueName] = useState(initialValue?.techniqueName ?? '')
  const [tactic, setTactic] = useState(initialValue?.tactic ?? '')
  const [confidence, setConfidence] = useState<Confidence>(initialValue?.confidence ?? 'medium')
  const [rationale, setRationale] = useState(initialValue?.rationale ?? '')
  const [findingIds, setFindingIds] = useState<string[]>(initialValue?.relatedFindingIds ?? [])
  const [evidenceIds, setEvidenceIds] = useState<string[]>(initialValue?.relatedEvidenceIds ?? [])
  const [error, setError] = useState<string | null>(null)

  function toggle(list: string[], setList: (next: string[]) => void, id: string) {
    setList(list.includes(id) ? list.filter((value) => value !== id) : [...list, id])
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!techniqueId.trim() || !techniqueName.trim()) {
      setError('Technique ID and name are required.')
      return
    }
    onAdd({
      techniqueId,
      techniqueName,
      tactic,
      confidence,
      rationale,
      relatedFindingIds: findingIds,
      relatedEvidenceIds: evidenceIds,
    })
  }

  return (
    <form className="form mitre-form" onSubmit={handleSubmit} aria-label={initialValue ? 'Edit ATT&CK mapping' : 'Add ATT&CK mapping'}>
      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="mt-id">Technique ID</label>
          <input
            id="mt-id"
            className="form__input"
            value={techniqueId}
            onChange={(event) => setTechniqueId(event.target.value)}
            placeholder="e.g. T1059.001"
            autoFocus
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="mt-name">Technique name</label>
          <input
            id="mt-name"
            className="form__input"
            value={techniqueName}
            onChange={(event) => setTechniqueName(event.target.value)}
            placeholder="e.g. Command and Scripting Interpreter: PowerShell"
          />
        </div>
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="mt-tactic">Tactic</label>
          <input
            id="mt-tactic"
            className="form__input"
            value={tactic}
            onChange={(event) => setTactic(event.target.value)}
            placeholder="e.g. Execution"
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="mt-confidence">Confidence</label>
          <select
            id="mt-confidence"
            className="form__select"
            value={confidence}
            onChange={(event) => setConfidence(event.target.value as Confidence)}
          >
            {confidenceOptions.map((value) => (
              <option key={value} value={value}>{confidenceLabels[value]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="mt-rationale">Rationale</label>
        <textarea
          id="mt-rationale"
          className="form__textarea"
          value={rationale}
          onChange={(event) => setRationale(event.target.value)}
          placeholder="Why this technique applies — the analyst's reasoning (synthetic data only)."
        />
      </div>

      {findings.length > 0 && (
        <fieldset className="form__checks">
          <legend>Supporting findings</legend>
          {findings.map((finding) => (
            <label key={finding.id} className="form__check">
              <input
                type="checkbox"
                checked={findingIds.includes(finding.id)}
                onChange={() => toggle(findingIds, setFindingIds, finding.id)}
              />
              <span>{finding.title}</span>
            </label>
          ))}
        </fieldset>
      )}

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

      {error && <p className="form__error">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">{initialValue ? 'Save mapping' : 'Add mapping'}</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
