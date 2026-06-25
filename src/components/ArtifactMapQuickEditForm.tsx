import { useState, type FormEvent } from 'react'
import {
  confidenceLabels,
  findingStatusLabels,
  questionStatusLabels,
  recommendationStatusLabels,
  timelinePhaseLabels,
} from '../data/labels'
import type {
  Confidence,
  FindingStatus,
  QuestionStatus,
  RecommendationStatus,
  SocCase,
  TimelinePhase,
} from '../types'
import type { ArtifactNode } from '../utils/artifactMap'
import {
  isAllowedValue,
  isValidDateTimeLocal,
  isValidOptionalDateTimeLocal,
} from '../utils/formValidation'

const confidenceOptions = Object.keys(confidenceLabels) as Confidence[]
const findingStatusOptions = Object.keys(findingStatusLabels) as FindingStatus[]
const questionStatusOptions = Object.keys(questionStatusLabels) as QuestionStatus[]
const recommendationStatusOptions = Object.keys(
  recommendationStatusLabels,
) as RecommendationStatus[]
const timelinePhaseOptions = Object.keys(timelinePhaseLabels) as TimelinePhase[]

type QuickEditDraft =
  | { kind: 'entity'; value: string; role: string; description: string }
  | { kind: 'evidence'; title: string; source: string; observedAt: string; detail: string }
  | {
      kind: 'timeline'
      title: string
      timestamp: string
      phase: TimelinePhase
      description: string
      relatedEvidenceIds: string[]
    }
  | {
      kind: 'finding'
      title: string
      description: string
      confidence: Confidence
      status: FindingStatus
      relatedEvidenceIds: string[]
    }
  | {
      kind: 'mitre'
      techniqueId: string
      techniqueName: string
      tactic: string
      confidence: Confidence
      rationale: string
      relatedFindingIds: string[]
      relatedEvidenceIds: string[]
    }
  | { kind: 'recommendation'; title: string; description: string; status: RecommendationStatus }
  | { kind: 'question'; question: string; status: QuestionStatus; answer: string; rationale: string }
  | { kind: 'readOnly'; reason: string }

interface ArtifactMapQuickEditFormProps {
  socCase: SocCase
  node: ArtifactNode
  onUpdateCase: (updater: (socCase: SocCase) => SocCase) => void
  onCancel: () => void
  onSaved: () => void
}

export function ArtifactMapQuickEditForm({
  socCase,
  node,
  onUpdateCase,
  onCancel,
  onSaved,
}: ArtifactMapQuickEditFormProps) {
  const [draft, setDraft] = useState<QuickEditDraft>(() => buildDraft(socCase, node))
  const [error, setError] = useState<string | null>(null)

  function toggleEvidence(id: string) {
    if (draft.kind !== 'finding' && draft.kind !== 'mitre' && draft.kind !== 'timeline') return
    const current = draft.relatedEvidenceIds
    setDraft({
      ...draft,
      relatedEvidenceIds: current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    })
  }

  function toggleFinding(id: string) {
    if (draft.kind !== 'mitre') return
    const current = draft.relatedFindingIds
    setDraft({
      ...draft,
      relatedFindingIds: current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!node.source || draft.kind === 'readOnly') return

    const validationError = validateDraft(draft)
    if (validationError) {
      setError(validationError)
      return
    }

    const source = node.source
    onUpdateCase((current) => {
      switch (source.kind) {
        case 'entity':
          if (draft.kind !== 'entity') return current
          return {
            ...current,
            affectedEntities: current.affectedEntities.map((entity) =>
              entity.id === source.id
                ? {
                    ...entity,
                    value: draft.value.trim(),
                    role: trimOptional(draft.role),
                    description: trimOptional(draft.description),
                  }
                : entity,
            ),
          }

        case 'evidence':
          if (draft.kind !== 'evidence') return current
          return {
            ...current,
            evidence: current.evidence.map((item) =>
              item.id === source.id
                ? {
                    ...item,
                    title: draft.title.trim(),
                    source: trimOptional(draft.source),
                    observedAt: normalizeDateTimeLocal(draft.observedAt),
                    detail: draft.detail.trim(),
                  }
                : item,
            ),
          }

        case 'timeline':
          if (draft.kind !== 'timeline') return current
          return {
            ...current,
            timeline: current.timeline.map((event) =>
              event.id === source.id
                ? {
                    ...event,
                    title: draft.title.trim(),
                    timestamp: normalizeDateTimeLocal(draft.timestamp) ?? event.timestamp,
                    phase: draft.phase,
                    description: draft.description.trim(),
                    relatedEvidenceIds: draft.relatedEvidenceIds.length
                      ? draft.relatedEvidenceIds
                      : undefined,
                  }
                : event,
            ),
          }

        case 'finding':
          if (draft.kind !== 'finding') return current
          return {
            ...current,
            findings: current.findings.map((finding) =>
              finding.id === source.id
                ? {
                    ...finding,
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    confidence: draft.confidence,
                    status: draft.status,
                    relatedEvidenceIds: draft.relatedEvidenceIds.length
                      ? draft.relatedEvidenceIds
                      : undefined,
                  }
                : finding,
            ),
          }

        case 'mitre':
          if (draft.kind !== 'mitre') return current
          return {
            ...current,
            mitreMappings: current.mitreMappings.map((mapping) =>
              mapping.id === source.id
                ? {
                    ...mapping,
                    techniqueId: draft.techniqueId.trim(),
                    techniqueName: draft.techniqueName.trim(),
                    tactic: draft.tactic.trim(),
                    confidence: draft.confidence,
                    rationale: draft.rationale.trim(),
                    relatedFindingIds: draft.relatedFindingIds.length
                      ? draft.relatedFindingIds
                      : undefined,
                    relatedEvidenceIds: draft.relatedEvidenceIds.length
                      ? draft.relatedEvidenceIds
                      : undefined,
                  }
                : mapping,
            ),
          }

        case 'recommendation':
          if (draft.kind !== 'recommendation') return current
          return {
            ...current,
            recommendations: current.recommendations.map((recommendation) =>
              recommendation.id === source.id
                ? {
                    ...recommendation,
                    title: draft.title.trim(),
                    description: draft.description.trim(),
                    status: draft.status,
                  }
                : recommendation,
            ),
          }

        case 'question':
          if (draft.kind !== 'question') return current
          return {
            ...current,
            analystQuestions: current.analystQuestions.map((question) =>
              question.id === source.id
                ? {
                    ...question,
                    question: draft.question.trim(),
                    status: draft.status,
                    answer: trimOptional(draft.answer),
                    rationale: trimOptional(draft.rationale),
                    answeredAt:
                      draft.status === 'answered'
                        ? question.answeredAt ?? new Date().toISOString()
                        : undefined,
                  }
                : question,
            ),
          }
      }
    })

    setError(null)
    onSaved()
  }

  if (draft.kind === 'readOnly') {
    return (
      <div className="amap-edit amap-edit--readonly">
        <p className="graph-hint">{draft.reason}</p>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
          Back to details
        </button>
      </div>
    )
  }

  return (
    <form className="form amap-edit" onSubmit={handleSubmit} aria-label="Edit selected artifact">
      <div className="amap-edit__head">
        <span className="amap-edit__label">Quick edit selected artifact</span>
        <p className="amap-edit__hint">
          Saves update the selected case. Use the full case workspace for deeper restructuring.
        </p>
      </div>

      {draft.kind === 'entity' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-entity-value">Name / value</label>
            <input
              id="amap-entity-value"
              className="form__input"
              value={draft.value}
              onChange={(event) => setDraft({ ...draft, value: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-entity-role">Role / description</label>
            <input
              id="amap-entity-role"
              className="form__input"
              value={draft.role}
              onChange={(event) => setDraft({ ...draft, role: event.target.value })}
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-entity-notes">Notes</label>
            <textarea
              id="amap-entity-notes"
              className="form__textarea"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
        </>
      )}

      {draft.kind === 'evidence' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-evidence-title">Title</label>
            <input
              id="amap-evidence-title"
              className="form__input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="amap-evidence-source">Source</label>
              <input
                id="amap-evidence-source"
                className="form__input"
                value={draft.source}
                onChange={(event) => setDraft({ ...draft, source: event.target.value })}
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="amap-evidence-time">Timestamp</label>
              <input
                id="amap-evidence-time"
                type="datetime-local"
                className="form__input"
                value={draft.observedAt}
                onChange={(event) => setDraft({ ...draft, observedAt: event.target.value })}
              />
            </div>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-evidence-detail">Description / notes</label>
            <textarea
              id="amap-evidence-detail"
              className="form__textarea"
              value={draft.detail}
              onChange={(event) => setDraft({ ...draft, detail: event.target.value })}
            />
          </div>
        </>
      )}

      {draft.kind === 'timeline' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-timeline-title">Title</label>
            <input
              id="amap-timeline-title"
              className="form__input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="amap-timeline-time">Timestamp</label>
              <input
                id="amap-timeline-time"
                type="datetime-local"
                className="form__input"
                value={draft.timestamp}
                onChange={(event) => setDraft({ ...draft, timestamp: event.target.value })}
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="amap-timeline-phase">Phase</label>
              <select
                id="amap-timeline-phase"
                className="form__select"
                value={draft.phase}
                onChange={(event) =>
                  setDraft({ ...draft, phase: event.target.value as TimelinePhase })
                }
              >
                {timelinePhaseOptions.map((value) => (
                  <option key={value} value={value}>
                    {timelinePhaseLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-timeline-detail">Description</label>
            <textarea
              id="amap-timeline-detail"
              className="form__textarea"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
          {socCase.evidence.length > 0 && (
            <EvidenceChecks
              evidence={socCase.evidence}
              selectedIds={draft.relatedEvidenceIds}
              onToggle={toggleEvidence}
            />
          )}
        </>
      )}

      {draft.kind === 'finding' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-finding-title">Title</label>
            <input
              id="amap-finding-title"
              className="form__input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="amap-finding-confidence">Confidence</label>
              <select
                id="amap-finding-confidence"
                className="form__select"
                value={draft.confidence}
                onChange={(event) =>
                  setDraft({ ...draft, confidence: event.target.value as Confidence })
                }
              >
                {confidenceOptions.map((value) => (
                  <option key={value} value={value}>
                    {confidenceLabels[value]}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="amap-finding-status">Status</label>
              <select
                id="amap-finding-status"
                className="form__select"
                value={draft.status}
                onChange={(event) =>
                  setDraft({ ...draft, status: event.target.value as FindingStatus })
                }
              >
                {findingStatusOptions.map((value) => (
                  <option key={value} value={value}>
                    {findingStatusLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-finding-detail">Description</label>
            <textarea
              id="amap-finding-detail"
              className="form__textarea"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
          {socCase.evidence.length > 0 && (
            <EvidenceChecks
              evidence={socCase.evidence}
              selectedIds={draft.relatedEvidenceIds}
              onToggle={toggleEvidence}
            />
          )}
        </>
      )}

      {draft.kind === 'mitre' && (
        <>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="amap-mitre-id">Technique ID</label>
              <input
                id="amap-mitre-id"
                className="form__input"
                value={draft.techniqueId}
                onChange={(event) => setDraft({ ...draft, techniqueId: event.target.value })}
                autoFocus
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="amap-mitre-name">Technique name</label>
              <input
                id="amap-mitre-name"
                className="form__input"
                value={draft.techniqueName}
                onChange={(event) => setDraft({ ...draft, techniqueName: event.target.value })}
              />
            </div>
          </div>
          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="amap-mitre-tactic">Tactic</label>
              <input
                id="amap-mitre-tactic"
                className="form__input"
                value={draft.tactic}
                onChange={(event) => setDraft({ ...draft, tactic: event.target.value })}
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="amap-mitre-confidence">Confidence</label>
              <select
                id="amap-mitre-confidence"
                className="form__select"
                value={draft.confidence}
                onChange={(event) =>
                  setDraft({ ...draft, confidence: event.target.value as Confidence })
                }
              >
                {confidenceOptions.map((value) => (
                  <option key={value} value={value}>
                    {confidenceLabels[value]}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-mitre-rationale">Rationale</label>
            <textarea
              id="amap-mitre-rationale"
              className="form__textarea"
              value={draft.rationale}
              onChange={(event) => setDraft({ ...draft, rationale: event.target.value })}
            />
          </div>
          {socCase.findings.length > 0 && (
            <fieldset className="form__checks amap-edit__checks">
              <legend>Supporting findings</legend>
              {socCase.findings.map((finding) => (
                <label key={finding.id} className="form__check">
                  <input
                    type="checkbox"
                    checked={draft.relatedFindingIds.includes(finding.id)}
                    onChange={() => toggleFinding(finding.id)}
                  />
                  <span>{finding.title}</span>
                </label>
              ))}
            </fieldset>
          )}
          {socCase.evidence.length > 0 && (
            <EvidenceChecks
              evidence={socCase.evidence}
              selectedIds={draft.relatedEvidenceIds}
              onToggle={toggleEvidence}
            />
          )}
        </>
      )}

      {draft.kind === 'recommendation' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-rec-title">Action / title</label>
            <input
              id="amap-rec-title"
              className="form__input"
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-rec-status">Status</label>
            <select
              id="amap-rec-status"
              className="form__select"
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as RecommendationStatus })
              }
            >
              {recommendationStatusOptions.map((value) => (
                <option key={value} value={value}>
                  {recommendationStatusLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-rec-detail">Description / notes</label>
            <textarea
              id="amap-rec-detail"
              className="form__textarea"
              value={draft.description}
              onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            />
          </div>
        </>
      )}

      {draft.kind === 'question' && (
        <>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-question-text">Question</label>
            <input
              id="amap-question-text"
              className="form__input"
              value={draft.question}
              onChange={(event) => setDraft({ ...draft, question: event.target.value })}
              autoFocus
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-question-status">Status</label>
            <select
              id="amap-question-status"
              className="form__select"
              value={draft.status}
              onChange={(event) =>
                setDraft({ ...draft, status: event.target.value as QuestionStatus })
              }
            >
              {questionStatusOptions.map((value) => (
                <option key={value} value={value}>
                  {questionStatusLabels[value]}
                </option>
              ))}
            </select>
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-question-answer">Answer / note</label>
            <textarea
              id="amap-question-answer"
              className="form__textarea"
              value={draft.answer}
              onChange={(event) => setDraft({ ...draft, answer: event.target.value })}
            />
          </div>
          <div className="form__field">
            <label className="form__label" htmlFor="amap-question-rationale">Rationale</label>
            <textarea
              id="amap-question-rationale"
              className="form__textarea"
              value={draft.rationale}
              onChange={(event) => setDraft({ ...draft, rationale: event.target.value })}
            />
          </div>
        </>
      )}

      {error && (
        <p className="form__error" role="alert">
          {error}
        </p>
      )}

      <div className="form__actions">
        <button type="submit" className="btn btn--sm">
          Save
        </button>
        <button type="button" className="btn btn--secondary btn--sm" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function EvidenceChecks({
  evidence,
  selectedIds,
  onToggle,
}: {
  evidence: SocCase['evidence']
  selectedIds: string[]
  onToggle: (id: string) => void
}) {
  return (
    <fieldset className="form__checks amap-edit__checks">
      <legend>Supporting evidence</legend>
      {evidence.map((item) => (
        <label key={item.id} className="form__check">
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onToggle(item.id)}
          />
          <span>{item.title}</span>
        </label>
      ))}
    </fieldset>
  )
}

function buildDraft(socCase: SocCase, node: ArtifactNode): QuickEditDraft {
  const source = node.source
  if (!source) {
    return {
      kind: 'readOnly',
      reason:
        'This item is generated from case data. Open the case to edit the source section.',
    }
  }

  switch (source.kind) {
    case 'entity': {
      const entity = socCase.affectedEntities.find((item) => item.id === source.id)
      if (!entity) return missingRecordDraft()
      return {
        kind: 'entity',
        value: entity.value,
        role: entity.role ?? '',
        description: entity.description ?? '',
      }
    }

    case 'evidence': {
      const evidence = socCase.evidence.find((item) => item.id === source.id)
      if (!evidence) return missingRecordDraft()
      return {
        kind: 'evidence',
        title: evidence.title,
        source: evidence.source ?? '',
        observedAt: toDateTimeLocal(evidence.observedAt),
        detail: evidence.detail,
      }
    }

    case 'timeline': {
      const event = socCase.timeline.find((item) => item.id === source.id)
      if (!event) return missingRecordDraft()
      return {
        kind: 'timeline',
        title: event.title,
        timestamp: toDateTimeLocal(event.timestamp),
        phase: event.phase ?? 'other',
        description: event.description,
        relatedEvidenceIds: event.relatedEvidenceIds ?? [],
      }
    }

    case 'finding': {
      const finding = socCase.findings.find((item) => item.id === source.id)
      if (!finding) return missingRecordDraft()
      return {
        kind: 'finding',
        title: finding.title,
        description: finding.description,
        confidence: finding.confidence,
        status: finding.status ?? 'draft',
        relatedEvidenceIds: finding.relatedEvidenceIds ?? [],
      }
    }

    case 'mitre': {
      const mapping = socCase.mitreMappings.find((item) => item.id === source.id)
      if (!mapping) return missingRecordDraft()
      return {
        kind: 'mitre',
        techniqueId: mapping.techniqueId,
        techniqueName: mapping.techniqueName,
        tactic: mapping.tactic,
        confidence: mapping.confidence,
        rationale: mapping.rationale,
        relatedFindingIds: mapping.relatedFindingIds ?? [],
        relatedEvidenceIds: mapping.relatedEvidenceIds ?? [],
      }
    }

    case 'recommendation': {
      const recommendation = socCase.recommendations.find((item) => item.id === source.id)
      if (!recommendation) return missingRecordDraft()
      return {
        kind: 'recommendation',
        title: recommendation.title,
        description: recommendation.description,
        status: recommendation.status ?? 'proposed',
      }
    }

    case 'question': {
      const question = socCase.analystQuestions.find((item) => item.id === source.id)
      if (!question) return missingRecordDraft()
      return {
        kind: 'question',
        question: question.question,
        status: question.status,
        answer: question.answer ?? '',
        rationale: question.rationale ?? '',
      }
    }
  }
}

function validateDraft(draft: QuickEditDraft): string | null {
  switch (draft.kind) {
    case 'entity':
      return draft.value.trim() ? null : 'A name or value is required.'
    case 'evidence':
      if (!draft.title.trim()) return 'An evidence title is required.'
      if (!isValidOptionalDateTimeLocal(draft.observedAt)) {
        return 'Timestamp must be a valid date and time.'
      }
      return null
    case 'timeline':
      if (!draft.title.trim()) return 'A timeline event title is required.'
      if (!draft.timestamp.trim()) return 'A timeline timestamp is required.'
      if (!isValidDateTimeLocal(draft.timestamp)) return 'Timestamp must be a valid date and time.'
      if (!isAllowedValue(draft.phase, timelinePhaseOptions)) return 'Choose a valid timeline phase.'
      return null
    case 'finding':
      if (!draft.title.trim()) return 'A finding title is required.'
      if (
        !isAllowedValue(draft.confidence, confidenceOptions) ||
        !isAllowedValue(draft.status, findingStatusOptions)
      ) {
        return 'Choose valid finding confidence and status values.'
      }
      return null
    case 'mitre':
      if (!draft.techniqueId.trim() || !draft.techniqueName.trim()) {
        return 'Technique ID and name are required.'
      }
      if (!isAllowedValue(draft.confidence, confidenceOptions)) {
        return 'Choose a valid confidence value.'
      }
      return null
    case 'recommendation':
      if (!draft.title.trim()) return 'A recommendation title or action is required.'
      if (!isAllowedValue(draft.status, recommendationStatusOptions)) {
        return 'Choose a valid recommendation status.'
      }
      return null
    case 'question':
      if (!draft.question.trim()) return 'A question is required.'
      if (!isAllowedValue(draft.status, questionStatusOptions)) {
        return 'Choose a valid question status.'
      }
      return null
    case 'readOnly':
      return null
  }
}

function missingRecordDraft(): QuickEditDraft {
  return {
    kind: 'readOnly',
    reason:
      'This item points to a case record that no longer exists. Open the case workspace to review the source data.',
  }
}

function trimOptional(value: string): string | undefined {
  const trimmed = value.trim()
  return trimmed || undefined
}

function normalizeDateTimeLocal(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 16 ? `${trimmed}:00Z` : `${trimmed}Z`
  }
  return trimmed
}

function toDateTimeLocal(value?: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 16)
  return value.replace(/Z$/, '').slice(0, 16)
}
