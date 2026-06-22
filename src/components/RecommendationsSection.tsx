import { useState } from 'react'
import type { Recommendation } from '../types'
import type { NewRecommendationInput } from '../data/casesStore'
import { priorityLabels, recommendationCategoryLabels, recommendationStatusLabels } from '../data/labels'
import { AddRecommendationForm } from './AddRecommendationForm'

interface RecommendationsSectionProps {
  recommendations: Recommendation[]
  onAdd: (input: NewRecommendationInput) => void
  onRemove: (recommendationId: string) => void
}

export function RecommendationsSection({ recommendations, onAdd, onRemove }: RecommendationsSectionProps) {
  const [showForm, setShowForm] = useState(false)

  function handleRemove(recommendation: Recommendation) {
    if (window.confirm(`Remove recommendation "${recommendation.title}"?`)) onRemove(recommendation.id)
  }

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">Recommendations <span className="detail-section__count">{recommendations.length}</span></h2>
        {!showForm && <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShowForm(true)}>Add recommendation</button>}
      </div>
      {showForm && <AddRecommendationForm onAdd={(input) => { onAdd(input); setShowForm(false) }} onCancel={() => setShowForm(false)} />}
      {recommendations.length === 0 ? (
        <p className="detail-empty">
          No recommendations yet. Add the next containment, monitoring, or recovery action.
        </p>
      ) : (
        <ul className="detail-list">
          {recommendations.map((recommendation) => (
            <li key={recommendation.id} className="detail-item">
              <div className="detail-item__head">
                <strong>{recommendation.title}</strong>
                {recommendation.category && <span className="chip">{recommendationCategoryLabels[recommendation.category]}</span>}
                <span className="chip">{priorityLabels[recommendation.priority]} priority</span>
                {recommendation.status && <span className="chip">{recommendationStatusLabels[recommendation.status]}</span>}
                <button type="button" className="btn-link-danger detail-item__remove" onClick={() => handleRemove(recommendation)}>Remove</button>
              </div>
              {recommendation.description && <p className="detail-text">{recommendation.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
