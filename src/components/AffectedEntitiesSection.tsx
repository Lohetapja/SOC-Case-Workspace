import { useState } from 'react'
import type { Entity } from '../types'
import type { NewEntityInput } from '../data/casesStore'
import { entityTypeLabels } from '../data/labels'
import { AddEntityForm } from './AddEntityForm'

interface AffectedEntitiesSectionProps {
  entities: Entity[]
  onAdd: (input: NewEntityInput) => void
  onRemove: (entityId: string) => void
}

export function AffectedEntitiesSection({ entities, onAdd, onRemove }: AffectedEntitiesSectionProps) {
  const [showForm, setShowForm] = useState(false)

  function handleRemove(entity: Entity) {
    if (window.confirm(
      `Remove affected entity "${entity.value}"? Links from evidence will also be cleared.`,
    )) onRemove(entity.id)
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">Affected entities <span className="detail-section__count">{entities.length}</span></h2>
        {!showForm && <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowForm(true)}>Add entity</button>}
      </div>
      {showForm && <AddEntityForm onAdd={(input) => { onAdd(input); setShowForm(false) }} onCancel={() => setShowForm(false)} />}
      {entities.length === 0 ? (
        <p className="detail-empty">
          No affected entities yet. Add the user, host, account, or indicator under investigation.
        </p>
      ) : (
        <ul className="detail-list">
          {entities.map((entity) => (
            <li key={entity.id} className="detail-item">
              <div className="detail-item__head">
                <span className="chip">{entityTypeLabels[entity.type]}</span>
                <span className="detail-mono">{entity.value}</span>
                <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(entity)}>Remove</button>
              </div>
              {entity.role && <p className="detail-item__sub">{entity.role}</p>}
              {entity.description && <p className="detail-text">{entity.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
