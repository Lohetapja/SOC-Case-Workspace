import { useState } from 'react'
import type { EvidenceItem, TimelineEvent } from '../types'
import type { NewTimelineEventInput } from '../data/casesStore'
import { timelinePhaseLabels } from '../data/labels'
import { formatDateTime } from '../utils/format'
import { AddTimelineEventForm } from './AddTimelineEventForm'

interface TimelineSectionProps {
  timeline: TimelineEvent[]
  /** The case's evidence, used to label linked evidence and feed the form. */
  evidence: EvidenceItem[]
  onAdd: (input: NewTimelineEventInput) => void
  onRemove: (eventId: string) => void
}

/** Editable Timeline section: chronological list, add, and remove. */
export function TimelineSection({ timeline, evidence, onAdd, onRemove }: TimelineSectionProps) {
  const [showForm, setShowForm] = useState(false)

  const sorted = [...timeline].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const evidenceTitleById = new Map(evidence.map((item) => [item.id, item.title]))

  function handleRemove(event: TimelineEvent) {
    if (window.confirm(`Remove timeline event "${event.title}"?`)) {
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
        {!showForm && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add event
          </button>
        )}
      </div>

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
        <p className="detail-empty">None recorded yet.</p>
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
                    <button
                      type="button"
                      className="btn-link-danger detail-item__remove"
                      onClick={() => handleRemove(event)}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="detail-text">{event.description}</p>
                  {linkedEvidence.length > 0 && (
                    <p className="detail-item__meta">Evidence: {linkedEvidence.join(', ')}</p>
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
