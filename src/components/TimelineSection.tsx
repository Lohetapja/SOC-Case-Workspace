import { useState } from 'react'
import type { EvidenceItem, TimelineEvent } from '../types'
import type { NewTimelineEventInput } from '../data/casesStore'
import { timelinePhaseLabels } from '../data/labels'
import { formatDateTime } from '../utils/format'
import { AddTimelineEventForm } from './AddTimelineEventForm'
import { GuidedTip } from './GuidedTip'

interface TimelineSectionProps {
  timeline: TimelineEvent[]
  /** The case's evidence, used to label linked evidence and feed the form. */
  evidence: EvidenceItem[]
  onAdd: (input: NewTimelineEventInput) => void
  onUpdate: (eventId: string, input: NewTimelineEventInput) => void
  onRemove: (eventId: string) => void
  guidedMode?: boolean
}

/** Editable Timeline section: chronological list, add, and remove. */
export function TimelineSection({
  timeline,
  evidence,
  onAdd,
  onUpdate,
  onRemove,
  guidedMode = false,
}: TimelineSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const sorted = [...timeline].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const evidenceTitleById = new Map(evidence.map((item) => [item.id, item.title]))

  function handleRemove(event: TimelineEvent) {
    if (window.confirm(
      `Remove timeline event "${event.title}"? Links from findings will also be cleared.`,
    )) {
      onRemove(event.id)
    }
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Timeline
          <span className="detail-section__count">{timeline.length}</span>
        </h2>
        {!showForm && !editingId && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add timeline event
          </button>
        )}
      </div>

      {guidedMode && (
        <GuidedTip>
          Timeline events show sequence: alert, activity, analyst action, response, and closure.
        </GuidedTip>
      )}

      {showForm && (
        <AddTimelineEventForm
          evidence={evidence}
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {sorted.length === 0 ? (
        <p className="detail-empty">
          No timeline events yet. Start with the alert time or earliest observed activity.
        </p>
      ) : (
        <ol className="detail-timeline">
          {sorted.map((event) => {
            const linkedEvidence = (event.relatedEvidenceIds ?? [])
              .map((id) => evidenceTitleById.get(id))
              .filter((title): title is string => Boolean(title))

            return (
              <li key={event.id} className="detail-timeline__item">
                <time className="detail-timeline__time">{formatDateTime(event.timestamp)}</time>
                <div className="detail-timeline__body">
                  <div className="detail-timeline__head">
                    <strong>{event.title}</strong>
                    {event.phase && <span className="chip">{timelinePhaseLabels[event.phase]}</span>}
                    <div className="detail-item__actions">
                      <button type="button" className="btn-link" onClick={() => setEditingId(event.id)}>Edit</button>
                      <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(event)}>Remove</button>
                    </div>
                  </div>
                  {editingId === event.id ? (
                    <AddTimelineEventForm
                      evidence={evidence}
                      initialValue={{
                        title: event.title,
                        timestamp: event.timestamp.replace(/Z$/, '').slice(0, 16),
                        phase: event.phase ?? 'other',
                        description: event.description,
                        relatedEvidenceIds: event.relatedEvidenceIds ?? [],
                      }}
                      onAdd={(input) => { onUpdate(event.id, input); setEditingId(null) }}
                      onCancel={() => setEditingId(null)}
                    />
                  ) : (
                    <>
                      <p className="detail-text">{event.description}</p>
                      {linkedEvidence.length > 0 && <p className="detail-item__meta">Evidence: {linkedEvidence.join(', ')}</p>}
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
