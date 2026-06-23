import { useState, type FormEvent } from 'react'
import type {
  AgentContributionStatus,
  AgentContributionType,
  Confidence,
  EvidenceItem,
} from '../types'
import type { NewAgentContributionInput } from '../data/casesStore'
import {
  agentContributionStatusLabels,
  agentContributionTypeLabels,
  confidenceLabels,
} from '../data/labels'
import { isAllowedValue } from '../utils/formValidation'

const typeOptions = Object.keys(agentContributionTypeLabels) as AgentContributionType[]
const statusOptions = Object.keys(agentContributionStatusLabels) as AgentContributionStatus[]
const confidenceOptions = Object.keys(confidenceLabels) as Confidence[]

interface AddAgentContributionFormProps {
  evidence: EvidenceItem[]
  onAdd: (input: NewAgentContributionInput) => void
  onCancel: () => void
  initialValue?: NewAgentContributionInput
}

/** Paste external analysis into a case without treating it as evidence. */
export function AddAgentContributionForm({
  evidence,
  onAdd,
  onCancel,
  initialValue,
}: AddAgentContributionFormProps) {
  const [agentName, setAgentName] = useState(initialValue?.agentName ?? '')
  const [type, setType] = useState<AgentContributionType>(initialValue?.type ?? 'other')
  const [output, setOutput] = useState(initialValue?.output ?? '')
  const [confidence, setConfidence] = useState<Confidence | ''>(initialValue?.confidence ?? '')
  const [status, setStatus] = useState<AgentContributionStatus>(initialValue?.status ?? 'unreviewed')
  const [evidenceIds, setEvidenceIds] = useState<string[]>(initialValue?.relatedEvidenceIds ?? [])
  const [error, setError] = useState<string | null>(null)

  function toggleEvidence(id: string) {
    setEvidenceIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id],
    )
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!agentName.trim() || !output.trim()) {
      setError('Agent/tool name and pasted output are required.')
      return
    }
    if (!isAllowedValue(type, typeOptions) || !isAllowedValue(status, statusOptions)) {
      setError('Choose valid contribution type and review status values.')
      return
    }
    if (confidence && !isAllowedValue(confidence, confidenceOptions)) {
      setError('Choose a valid confidence value or leave it unset.')
      return
    }
    setError(null)
    onAdd({ agentName, type, output, confidence, status, relatedEvidenceIds: evidenceIds })
  }

  return (
    <form className="form agent-form" onSubmit={handleSubmit} aria-label={initialValue ? 'Edit agent contribution' : 'Add agent contribution'}>
      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="agent-name">Agent / tool name</label>
          <input
            id="agent-name"
            className="form__input"
            value={agentName}
            onChange={(event) => setAgentName(event.target.value)}
            placeholder="e.g. Local triage script"
            autoFocus
          />
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="agent-type">Contribution type</label>
          <select
            id="agent-type"
            className="form__select"
            value={type}
            onChange={(event) => setType(event.target.value as AgentContributionType)}
          >
            {typeOptions.map((value) => (
              <option key={value} value={value}>{agentContributionTypeLabels[value]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="agent-confidence">Confidence (optional)</label>
          <select
            id="agent-confidence"
            className="form__select"
            value={confidence}
            onChange={(event) => setConfidence(event.target.value as Confidence | '')}
          >
            <option value="">Not provided</option>
            {confidenceOptions.map((value) => (
              <option key={value} value={value}>{confidenceLabels[value]}</option>
            ))}
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="agent-status">Review status</label>
          <select
            id="agent-status"
            className="form__select"
            value={status}
            onChange={(event) => setStatus(event.target.value as AgentContributionStatus)}
          >
            {statusOptions.map((value) => (
              <option key={value} value={value}>{agentContributionStatusLabels[value]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="agent-output">Pasted output / notes</label>
        <textarea
          id="agent-output"
          className="form__textarea agent-form__output"
          value={output}
          onChange={(event) => setOutput(event.target.value)}
          placeholder="Paste synthetic analysis from an external tool. Review it before use."
        />
      </div>

      {evidence.length > 0 && (
        <fieldset className="form__checks">
          <legend>Related evidence (optional)</legend>
          {evidence.map((item) => (
            <label key={item.id} className="form__check">
              <input
                type="checkbox"
                checked={evidenceIds.includes(item.id)}
                onChange={() => toggleEvidence(item.id)}
              />
              <span>{item.title}</span>
            </label>
          ))}
        </fieldset>
      )}

      {error && <p className="form__error" role="alert">{error}</p>}
      <div className="form__actions">
        <button type="submit" className="btn">{initialValue ? 'Save contribution' : 'Add contribution'}</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
