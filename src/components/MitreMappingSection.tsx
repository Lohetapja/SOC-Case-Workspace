import { useState } from 'react'
import type { EvidenceItem, Finding, MitreMapping } from '../types'
import type { NewMitreInput } from '../data/casesStore'
import { confidenceLabels } from '../data/labels'
import { AddMitreMappingForm } from './AddMitreMappingForm'

interface MitreMappingSectionProps {
  mappings: MitreMapping[]
  findings: Finding[]
  evidence: EvidenceItem[]
  onAdd: (input: NewMitreInput) => void
  onUpdate: (mappingId: string, input: NewMitreInput) => void
  onRemove: (mappingId: string) => void
}

/**
 * Editable MITRE ATT&CK section: analyst-authored, evidence-backed mappings.
 * List with rationale, add, and remove.
 */
export function MitreMappingSection({ mappings, findings, evidence, onAdd, onUpdate, onRemove }: MitreMappingSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const findingTitleById = new Map(findings.map((finding) => [finding.id, finding.title]))
  const evidenceTitleById = new Map(evidence.map((item) => [item.id, item.title]))

  function handleRemove(mapping: MitreMapping) {
    if (window.confirm(`Remove mapping "${mapping.techniqueId} ${mapping.techniqueName}"?`)) {
      onRemove(mapping.id)
    }
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          MITRE ATT&amp;CK mappings
          <span className="detail-section__count">{mappings.length}</span>
        </h2>
        {!showForm && !editingId && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add mapping
          </button>
        )}
      </div>

      {showForm && (
        <AddMitreMappingForm
          findings={findings}
          evidence={evidence}
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {mappings.length === 0 ? (
        <p className="detail-empty">
          No ATT&amp;CK mappings yet. Add a technique when evidence supports observed behavior.
        </p>
      ) : (
        <ul className="detail-list">
          {mappings.map((mapping) => {
            const supportingFindings = (mapping.relatedFindingIds ?? [])
              .map((id) => findingTitleById.get(id))
              .filter((title): title is string => Boolean(title))
            const supportingEvidence = (mapping.relatedEvidenceIds ?? [])
              .map((id) => evidenceTitleById.get(id))
              .filter((title): title is string => Boolean(title))
            return (
              <li key={mapping.id} className="detail-item">
                <div className="detail-item__head">
                  <strong>
                    {mapping.techniqueId} — {mapping.techniqueName}
                  </strong>
                  {mapping.tactic && <span className="chip">{mapping.tactic}</span>}
                  <span className="chip">{confidenceLabels[mapping.confidence]} confidence</span>
                  <div className="detail-item__actions">
                    <button type="button" className="btn-link" onClick={() => setEditingId(mapping.id)}>Edit</button>
                    <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(mapping)}>Remove</button>
                  </div>
                </div>
                {editingId === mapping.id ? (
                  <AddMitreMappingForm
                    findings={findings}
                    evidence={evidence}
                    initialValue={{
                      techniqueId: mapping.techniqueId,
                      techniqueName: mapping.techniqueName,
                      tactic: mapping.tactic,
                      confidence: mapping.confidence,
                      rationale: mapping.rationale,
                      relatedFindingIds: mapping.relatedFindingIds ?? [],
                      relatedEvidenceIds: mapping.relatedEvidenceIds ?? [],
                    }}
                    onAdd={(input) => { onUpdate(mapping.id, input); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    {mapping.rationale && <p className="detail-text"><strong>Rationale:</strong> {mapping.rationale}</p>}
                    {supportingFindings.length > 0 && <p className="detail-item__meta">Findings: {supportingFindings.join(', ')}</p>}
                    {supportingEvidence.length > 0 && <p className="detail-item__meta">Evidence: {supportingEvidence.join(', ')}</p>}
                  </>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
