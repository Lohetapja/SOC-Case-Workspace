import { useState } from 'react'
import type {
  AgentContribution,
  AgentContributionStatus,
  EvidenceItem,
} from '../types'
import type { NewAgentContributionInput } from '../data/casesStore'
import {
  agentContributionStatusLabels,
  agentContributionTypeLabels,
  confidenceLabels,
} from '../data/labels'
import { formatDateTime } from '../utils/format'
import { AddAgentContributionForm } from './AddAgentContributionForm'

interface AgentContributionsSectionProps {
  contributions: AgentContribution[]
  evidence: EvidenceItem[]
  onAdd: (input: NewAgentContributionInput) => void
  onRemove: (contributionId: string) => void
  onUpdateStatus: (contributionId: string, status: AgentContributionStatus) => void
}

/** Human review queue for pasted external analysis; contributions are never evidence. */
export function AgentContributionsSection({
  contributions,
  evidence,
  onAdd,
  onRemove,
  onUpdateStatus,
}: AgentContributionsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [copyErrorId, setCopyErrorId] = useState<string | null>(null)
  const evidenceById = new Map(evidence.map((item) => [item.id, item.title]))

  function handleRemove(contribution: AgentContribution) {
    if (window.confirm(`Remove contribution from "${contribution.agentName}"?`)) {
      onRemove(contribution.id)
    }
  }

  async function copyOutput(contribution: AgentContribution) {
    setCopyErrorId(null)
    try {
      await navigator.clipboard.writeText(contribution.output)
      setCopiedId(contribution.id)
      window.setTimeout(() => setCopiedId(null), 1600)
    } catch {
      setCopyErrorId(contribution.id)
    }
  }

  return (
    <section className="card detail-section agent-contributions">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Agent Contributions
          <span className="detail-section__count">{contributions.length}</span>
        </h2>
        {!showForm && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowForm(true)}>
            Add contribution
          </button>
        )}
      </div>

      <p className="agent-contributions__warning" role="note">
        <strong>Agent output is not evidence.</strong> Review it and link it to supporting evidence
        before using it in findings or reports.
      </p>

      {showForm && (
        <AddAgentContributionForm
          evidence={evidence}
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {contributions.length === 0 ? (
        <p className="detail-empty">
          No agent contributions attached. Add pasted analysis only when you have external output
          to review; it will remain separate from evidence.
        </p>
      ) : (
        <ul className="detail-list agent-contributions__list">
          {contributions.map((contribution) => {
            const linkedEvidence = (contribution.relatedEvidenceIds ?? [])
              .map((id) => evidenceById.get(id))
              .filter((title): title is string => Boolean(title))
            return (
              <li key={contribution.id} className="detail-item agent-contribution">
                <div className="detail-item__head">
                  <strong>{contribution.agentName}</strong>
                  <span className="chip">{agentContributionTypeLabels[contribution.type]}</span>
                  {contribution.confidence && (
                    <span className="chip">{confidenceLabels[contribution.confidence]} confidence</span>
                  )}
                  <button
                    type="button"
                    className="btn-link-danger detail-item__remove"
                    onClick={() => handleRemove(contribution)}
                  >
                    Remove
                  </button>
                </div>

                <pre className="agent-contribution__output">{contribution.output}</pre>
                {linkedEvidence.length > 0 && (
                  <p className="detail-item__meta">Linked evidence: {linkedEvidence.join(', ')}</p>
                )}
                <p className="detail-item__meta">
                  Added {formatDateTime(contribution.createdAt)}
                  {contribution.reviewedAt ? ` • Reviewed ${formatDateTime(contribution.reviewedAt)}` : ''}
                </p>

                <div className="agent-contribution__review">
                  <label className="form__label" htmlFor={`agent-review-${contribution.id}`}>
                    Human review status
                  </label>
                  <select
                    id={`agent-review-${contribution.id}`}
                    className="form__select"
                    value={contribution.status}
                    onChange={(event) =>
                      onUpdateStatus(
                        contribution.id,
                        event.target.value as AgentContributionStatus,
                      )
                    }
                  >
                    {(Object.keys(agentContributionStatusLabels) as AgentContributionStatus[]).map(
                      (status) => (
                        <option key={status} value={status}>
                          {agentContributionStatusLabels[status]}
                        </option>
                      ),
                    )}
                  </select>
                  {contribution.status === 'accepted' && (
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => void copyOutput(contribution)}
                    >
                      {copiedId === contribution.id ? 'Copied' : 'Copy output'}
                    </button>
                  )}
                  {copyErrorId === contribution.id && (
                    <span className="inline-error" role="alert">
                      Copy failed. Select the output above and copy it manually.
                    </span>
                  )}
                </div>
                {contribution.status === 'accepted' && (
                  <p className="detail-item__note">
                    Copy this suggestion into the relevant analyst form and validate every claim;
                    acceptance does not promote it automatically.
                  </p>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
