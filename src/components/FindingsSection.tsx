import { useState } from 'react'
import type { EvidenceItem, Finding, TimelineEvent } from '../types'
import type { NewFindingInput } from '../data/casesStore'
import {
  confidenceLabels,
  findingCategoryLabels,
  findingStatusLabels,
  severityLabels,
} from '../data/labels'
import { AddFindingForm } from './AddFindingForm'

interface FindingsSectionProps {
  findings: Finding[]
  evidence: EvidenceItem[]
  timeline: TimelineEvent[]
  onAdd: (input: NewFindingInput) => void
  onUpdate: (findingId: string, input: NewFindingInput) => void
  onRemove: (findingId: string) => void
}

function statusChipClass(status: NonNullable<Finding['status']>): string {
  if (status === 'confirmed') return 'chip chip--ok'
  if (status === 'rejected') return 'chip chip--danger'
  return 'chip'
}

/**
 * Editable Findings section: evidence-backed conclusions. List, add (with
 * category, severity, confidence, status, and selectable supporting evidence /
 * timeline events), and remove.
 */
export function FindingsSection({ findings, evidence, timeline, onAdd, onUpdate, onRemove }: FindingsSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const evidenceTitleById = new Map(evidence.map((item) => [item.id, item.title]))
  const timelineTitleById = new Map(timeline.map((event) => [event.id, event.title]))

  function handleRemove(finding: Finding) {
    if (window.confirm(
      `Remove finding "${finding.title}"? Links from ATT&CK mappings will also be cleared.`,
    )) {
      onRemove(finding.id)
    }
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Findings
          <span className="detail-section__count">{findings.length}</span>
        </h2>
        {!showForm && !editingId && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add finding
          </button>
        )}
      </div>

      {showForm && (
        <AddFindingForm
          evidence={evidence}
          timeline={timeline}
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {findings.length === 0 ? (
        <p className="detail-empty">
          No findings yet. Add a draft conclusion and link the evidence that supports it.
        </p>
      ) : (
        <ul className="detail-list">
          {findings.map((finding) => {
            const supporting = (finding.relatedEvidenceIds ?? [])
              .map((id) => evidenceTitleById.get(id))
              .filter((title): title is string => Boolean(title))
            const relatedEvents = (finding.relatedTimelineEventIds ?? [])
              .map((id) => timelineTitleById.get(id))
              .filter((title): title is string => Boolean(title))
            return (
              <li key={finding.id} className="detail-item">
                <div className="detail-item__head">
                  <strong>{finding.title}</strong>
                  {finding.severity && (
                    <span className={`sev sev--${finding.severity}`}>{severityLabels[finding.severity]}</span>
                  )}
                  {finding.category && (
                    <span className="chip">{findingCategoryLabels[finding.category]}</span>
                  )}
                  <span className="chip">{confidenceLabels[finding.confidence]} confidence</span>
                  {finding.status && (
                    <span className={statusChipClass(finding.status)}>
                      {findingStatusLabels[finding.status]}
                    </span>
                  )}
                  <div className="detail-item__actions">
                    <button type="button" className="btn-link" onClick={() => setEditingId(finding.id)}>Edit</button>
                    <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(finding)}>Remove</button>
                  </div>
                </div>
                {editingId === finding.id ? (
                  <AddFindingForm
                    evidence={evidence}
                    timeline={timeline}
                    initialValue={{
                      title: finding.title,
                      category: finding.category ?? 'other',
                      severity: finding.severity ?? 'medium',
                      confidence: finding.confidence,
                      status: finding.status ?? 'draft',
                      description: finding.description,
                      relatedEvidenceIds: finding.relatedEvidenceIds ?? [],
                      relatedTimelineEventIds: finding.relatedTimelineEventIds ?? [],
                    }}
                    onAdd={(input) => { onUpdate(finding.id, input); setEditingId(null) }}
                    onCancel={() => setEditingId(null)}
                  />
                ) : (
                  <>
                    <p className="detail-text">{finding.description}</p>
                    {supporting.length > 0 && <p className="detail-item__meta">Supported by: {supporting.join(', ')}</p>}
                    {relatedEvents.length > 0 && <p className="detail-item__meta">Timeline: {relatedEvents.join(', ')}</p>}
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
