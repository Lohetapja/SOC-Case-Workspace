import { useState, type FormEvent } from 'react'
import type { RecommendationCategory, RecommendationPriority, RecommendationStatus } from '../types'
import type { NewRecommendationInput } from '../data/casesStore'
import { priorityLabels, recommendationCategoryLabels, recommendationStatusLabels } from '../data/labels'

const categories = Object.keys(recommendationCategoryLabels) as RecommendationCategory[]
const priorities = Object.keys(priorityLabels) as RecommendationPriority[]
const statuses = Object.keys(recommendationStatusLabels) as RecommendationStatus[]

interface AddRecommendationFormProps {
  onAdd: (input: NewRecommendationInput) => void
  onCancel: () => void
}

export function AddRecommendationForm({ onAdd, onCancel }: AddRecommendationFormProps) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<RecommendationCategory>('monitoring')
  const [priority, setPriority] = useState<RecommendationPriority>('medium')
  const [status, setStatus] = useState<RecommendationStatus>('proposed')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!title.trim()) {
      setError('A recommendation title or action is required.')
      return
    }
    onAdd({ title, category, priority, status, description })
  }

  return (
    <form className="form recommendation-form" onSubmit={handleSubmit} aria-label="Add recommendation">
      <div className="form__field">
        <label className="form__label" htmlFor="rec-title">Title / action</label>
        <input id="rec-title" className="form__input" value={title} onChange={(event) => setTitle(event.target.value)} autoFocus />
      </div>
      <div className="form__row--inline">
        <div className="form__field"><label className="form__label" htmlFor="rec-category">Category</label><select id="rec-category" className="form__select" value={category} onChange={(event) => setCategory(event.target.value as RecommendationCategory)}>{categories.map((value) => <option key={value} value={value}>{recommendationCategoryLabels[value]}</option>)}</select></div>
        <div className="form__field"><label className="form__label" htmlFor="rec-priority">Priority</label><select id="rec-priority" className="form__select" value={priority} onChange={(event) => setPriority(event.target.value as RecommendationPriority)}>{priorities.map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}</select></div>
        <div className="form__field"><label className="form__label" htmlFor="rec-status">Status</label><select id="rec-status" className="form__select" value={status} onChange={(event) => setStatus(event.target.value as RecommendationStatus)}>{statuses.map((value) => <option key={value} value={value}>{recommendationStatusLabels[value]}</option>)}</select></div>
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor="rec-notes">Rationale / notes</label>
        <textarea id="rec-notes" className="form__textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      {error && <p className="form__error" role="alert">{error}</p>}
      <div className="form__actions"><button type="submit" className="btn">Add recommendation</button><button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button></div>
    </form>
  )
}
