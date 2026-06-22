import { useState } from 'react'
import type { AnalystQuestion } from '../types'
import type { NewQuestionInput } from '../data/casesStore'
import { questionStatusLabels } from '../data/labels'
import { AddQuestionForm } from './AddQuestionForm'

interface DecisionJournalSectionProps {
  questions: AnalystQuestion[]
  onAdd: (input: NewQuestionInput) => void
  onUpdate: (questionId: string, input: NewQuestionInput) => void
  onRemove: (questionId: string) => void
}

function statusChipClass(status: AnalystQuestion['status']): string {
  if (status === 'answered') return 'chip chip--ok'
  if (status === 'open') return 'chip chip--open'
  return 'chip'
}

/**
 * Editable Analyst questions / Decision journal section: list questions, add new
 * ones (with status, answer, rationale), and remove. Open questions also feed the
 * Artifact Map's "Investigation gaps" panel.
 */
export function DecisionJournalSection({ questions, onAdd, onUpdate, onRemove }: DecisionJournalSectionProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  function handleRemove(question: AnalystQuestion) {
    if (window.confirm(`Remove question "${question.question}"?`)) {
      onRemove(question.id)
    }
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Analyst questions
          <span className="detail-section__count">{questions.length}</span>
        </h2>
        {!showForm && !editingId && (
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setShowForm(true)}
          >
            Add question
          </button>
        )}
      </div>

      {showForm && (
        <AddQuestionForm
          onAdd={(input) => {
            onAdd(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {questions.length === 0 ? (
        <p className="detail-empty">
          No analyst questions yet. Add the first investigation question or decision point.
        </p>
      ) : (
        <ul className="detail-list">
          {questions.map((question) => (
            <li key={question.id} className="detail-item">
              <div className="detail-item__head">
                <strong>{question.question}</strong>
                <span className={statusChipClass(question.status)}>
                  {questionStatusLabels[question.status]}
                </span>
                <div className="detail-item__actions">
                  <button type="button" className="btn-link" onClick={() => setEditingId(question.id)}>Edit</button>
                  <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(question)}>Remove</button>
                </div>
              </div>
              {editingId === question.id ? (
                <AddQuestionForm
                  initialValue={{
                    question: question.question,
                    status: question.status,
                    answer: question.answer ?? '',
                    rationale: question.rationale ?? '',
                  }}
                  onAdd={(input) => { onUpdate(question.id, input); setEditingId(null) }}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <>
                  {question.answer && <p className="detail-text">{question.answer}</p>}
                  {question.rationale && <p className="detail-item__note">Rationale: {question.rationale}</p>}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
