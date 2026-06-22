import { useState, type FormEvent } from 'react'
import type { EntityType } from '../types'
import type { NewEntityInput } from '../data/casesStore'
import { entityTypeLabels } from '../data/labels'

const entityTypes = Object.keys(entityTypeLabels) as EntityType[]

interface AddEntityFormProps {
  onAdd: (input: NewEntityInput) => void
  onCancel: () => void
}

export function AddEntityForm({ onAdd, onCancel }: AddEntityFormProps) {
  const [type, setType] = useState<EntityType>('user')
  const [value, setValue] = useState('')
  const [role, setRole] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!value.trim()) {
      setError('An entity name or value is required.')
      return
    }
    onAdd({ type, value, role, description })
  }

  return (
    <form className="form entity-form" onSubmit={handleSubmit} aria-label="Add affected entity">
      <div className="form__row--inline">
        <div className="form__field">
          <label className="form__label" htmlFor="entity-type">Entity type</label>
          <select id="entity-type" className="form__select" value={type} onChange={(event) => setType(event.target.value as EntityType)}>
            {entityTypes.map((option) => <option key={option} value={option}>{entityTypeLabels[option]}</option>)}
          </select>
        </div>
        <div className="form__field">
          <label className="form__label" htmlFor="entity-value">Name / value</label>
          <input id="entity-value" className="form__input" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Synthetic value only" autoFocus />
        </div>
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor="entity-role">Role / description</label>
        <input id="entity-role" className="form__input" value={role} onChange={(event) => setRole(event.target.value)} placeholder="e.g. Affected workstation" />
      </div>
      <div className="form__field">
        <label className="form__label" htmlFor="entity-notes">Notes (optional)</label>
        <textarea id="entity-notes" className="form__textarea" value={description} onChange={(event) => setDescription(event.target.value)} />
      </div>
      {error && <p className="form__error">{error}</p>}
      <div className="form__actions">
        <button type="submit" className="btn">Add entity</button>
        <button type="button" className="btn btn--secondary" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
