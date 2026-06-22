import { useState, type FormEvent } from 'react'
import type { QuestionStatus } from '../types'
import type { NewQuestionInput } from '../data/casesStore'
import { questionStatusLabels } from '../data/labels'

const statusOptions = Object.keys(questionStatusLabels) as QuestionStatus[]

interface AddQuestionFormProps {
  onAdd: (input: NewQuestionInput) => void
  onCancel: () => void
  initialValue?: NewQuestionInput
}

/** Small form to add or edit an analyst question / decision-journal entry. */
export function AddQuestionForm({ onAdd, onCancel, initialValue }: AddQuestionFormProps) {
  const [question, setQuestion] = useState(initialValue?.question ?? '')
  const [status, setStatus] = useState<QuestionStatus>(initialValue?.status ?? 'open')
  const [answer, setAnswer] = useState(initialValue?.answer ?? '')
  const [rationale, setRationale] = useState(initialValue?.rationale ?? '')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!question.trim()) {
      setError('A question is required.')
      return
    }
    onAdd({ question, status, answer, rationale })
  }

  return (
    <form className="form journal-form" onSubmit={handleSubmit} aria-label={initialValue ? 'Edit analyst question' : 'Add analyst question'}>
      <div className="form__field">
        <label className="form__label" htmlFor="q-question">Question</label>
        <input
          id="q-question"
          className="form__input"
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="e.g. Was MFA satisfied on the flagged sign-in?"
          autoFocus
        />
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="q-status">Status</label>
        <select
          id="q-status"
          className="form__select"
          value={status}
          onChange={(event) => setStatus(event.target.value as QuestionStatus)}
        >
          {statusOptions.map((value) => (
            <option key={value} value={value}>
              {questionStatusLabels[value]}
            </option>
          ))}
        </select>
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="q-answer">Answer / decision</label>
        <textarea
          id="q-answer"
          className="form__textarea"
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder="The answer or decision reached (optional)."
        />
      </div>

      <div className="form__field">
        <label className="form__label" htmlFor="q-rationale">Rationale</label>
        <textarea
          id="q-rationale"
          className="form__textarea"
          value={rationale}
          onChange={(event) => setRationale(event.target.value)}
          placeholder="Why — supporting reasoning or evidence (optional)."
        />
      </div>

      {error && <p className="form__error" role="alert">{error}</p>}

      <div className="form__actions">
        <button type="submit" className="btn">{initialValue ? 'Save question' : 'Add question'}</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}
