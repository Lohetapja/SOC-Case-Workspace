import { useState } from 'react'
import type { EvidenceItem } from '../types'
import type { NewEvidenceInput } from '../data/casesStore'
import { evidenceTypeLabels } from '../data/labels'
import { formatDateTime } from '../utils/format'
import { AddEvidenceForm } from './AddEvidenceForm'

interface EvidenceSectionProps {
  evidence: EvidenceItem[]
  onAdd: (input: NewEvidenceInput) => void
  onRemove: (evidenceId: string) => void
}

/** Editable Evidence section: list existing items, add new ones, remove items. */
export function EvidenceSection({ evidence, onAdd, onRemove }: EvidenceSectionProps) {
  const [showForm, setShowForm] = useState(false)

  function handleRemove(item: EvidenceItem) {
    if (window.confirm(`Remove evidence "${item.title}"?`)) {
      onRemove(item.id)
    }
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Evidence
          <span className="detail-section__count">{evidence.length}</span>
        </h2>
        {!showForm && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add evidence
          </button>
        )}
      </div>

      {showForm && (
        <AddEvidenceForm
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {evidence.length === 0 ? (
        <p className="detail-empty">None recorded yet.</p>
      ) : (
        <ul className="detail-list">
          {evidence.map((item) => (
            <li key={item.id} className="detail-item">
              <div className="detail-item__head">
                <strong>{item.title}</strong>
                <span className="chip">{evidenceTypeLabels[item.type]}</span>
                <button
                  type="button"
                  className="btn-link-danger detail-item__remove"
                  onClick={() => handleRemove(item)}
                >
                  Remove
                </button>
              </div>
              <p className="detail-text">{item.detail}</p>
              {(item.source || item.observedAt) && (
                <p className="detail-item__meta">
                  {[item.source, item.observedAt && formatDateTime(item.observedAt)]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
              {item.analystNote && <p className="detail-item__note">Note: {item.analystNote}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
