import type { SocCase } from '../types'
import {
  closureStatusLabels,
  confidenceLabels,
  entityTypeLabels,
  evidenceTypeLabels,
  findingCategoryLabels,
  findingStatusLabels,
  priorityLabels,
  questionStatusLabels,
  recommendationCategoryLabels,
  recommendationStatusLabels,
  timelinePhaseLabels,
  verdictLabels,
} from '../data/labels'

/**
 * Local, dependency-free case search. Pure substring matching over the canonical
 * `SocCase` records already held in memory (sourced from localStorage). No
 * network, no index, no external service — synthetic data stays in the browser.
 */

export type SearchResultType =
  | 'case'
  | 'entity'
  | 'evidence'
  | 'timeline'
  | 'question'
  | 'finding'
  | 'mitre'
  | 'closure'
  | 'recommendation'
  | 'lab'

export interface SearchResult {
  /** Stable key for React lists. */
  id: string
  type: SearchResultType
  caseId: string
  caseTitle: string
  /** Title/label of the matching item. */
  itemTitle: string
  /** Which field/section the match was found in. */
  section: string
  /** Short preview around the matched text. */
  snippet: string
}

/** Display order + labels for the result groups. */
export const SEARCH_GROUPS: { type: SearchResultType; label: string }[] = [
  { type: 'case', label: 'Case' },
  { type: 'entity', label: 'Affected Entity' },
  { type: 'evidence', label: 'Evidence' },
  { type: 'timeline', label: 'Timeline' },
  { type: 'question', label: 'Decision Journal' },
  { type: 'finding', label: 'Finding' },
  { type: 'mitre', label: 'MITRE Mapping' },
  { type: 'closure', label: 'Closure' },
  { type: 'recommendation', label: 'Recommendation' },
  { type: 'lab', label: 'Lab Notes' },
]

/** Ignore very short queries to keep results meaningful. */
export const MIN_QUERY_LENGTH = 2

const SNIPPET_RADIUS = 48

/** Build a short preview window centered on the first match. */
function buildSnippet(text: string, query: string): string {
  const index = text.toLowerCase().indexOf(query)
  if (index === -1) return text.length > 120 ? `${text.slice(0, 119)}…` : text
  const start = Math.max(0, index - SNIPPET_RADIUS)
  const end = Math.min(text.length, index + query.length + SNIPPET_RADIUS)
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`
}

interface SearchField {
  label: string
  value?: string | null
}

/** First field whose value contains the (already lowercased) query. */
function firstMatch(fields: SearchField[], query: string): { label: string; snippet: string } | null {
  for (const field of fields) {
    const value = field.value?.trim()
    if (value && value.toLowerCase().includes(query)) {
      return { label: field.label, snippet: buildSnippet(value, query) }
    }
  }
  return null
}

/**
 * Search local cases for `rawQuery`. Case-insensitive substring match across the
 * fields listed below. Returns a flat, ordered list of results (grouped in the UI
 * via {@link SEARCH_GROUPS}). Empty/too-short queries return no results.
 */
export function searchCases(cases: SocCase[], rawQuery: string): SearchResult[] {
  const query = rawQuery.trim().toLowerCase()
  if (query.length < MIN_QUERY_LENGTH) return []

  const results: SearchResult[] = []

  for (const socCase of cases) {
    const push = (
      type: SearchResultType,
      itemTitle: string,
      match: { label: string; snippet: string } | null,
      idSuffix: string,
    ) => {
      if (!match) return
      results.push({
        id: `${socCase.id}:${type}:${idSuffix}`,
        type,
        caseId: socCase.id,
        caseTitle: socCase.title,
        itemTitle,
        section: match.label,
        snippet: match.snippet,
      })
    }

    push(
      'case',
      socCase.title,
      firstMatch(
        [
          { label: 'Case title', value: socCase.title },
          { label: 'Case summary', value: socCase.summary },
        ],
        query,
      ),
      'meta',
    )

    socCase.affectedEntities.forEach((entity) => {
      push(
        'entity',
        entity.value,
        firstMatch(
          [
            { label: 'Entity value', value: entity.value },
            { label: 'Entity type', value: entityTypeLabels[entity.type] },
            { label: 'Entity role', value: entity.role },
            { label: 'Entity description', value: entity.description },
          ],
          query,
        ),
        entity.id,
      )
    })

    socCase.evidence.forEach((item) => {
      push(
        'evidence',
        item.title,
        firstMatch(
          [
            { label: 'Evidence title', value: item.title },
            { label: 'Evidence detail', value: item.detail },
            { label: 'Evidence source', value: item.source },
            { label: 'Evidence type', value: evidenceTypeLabels[item.type] },
            { label: 'Analyst note', value: item.analystNote },
          ],
          query,
        ),
        item.id,
      )
    })

    socCase.timeline.forEach((event) => {
      push(
        'timeline',
        event.title,
        firstMatch(
          [
            { label: 'Timeline title', value: event.title },
            { label: 'Timeline description', value: event.description },
            { label: 'Timeline phase', value: event.phase ? timelinePhaseLabels[event.phase] : undefined },
          ],
          query,
        ),
        event.id,
      )
    })

    socCase.analystQuestions.forEach((question) => {
      push(
        'question',
        question.question,
        firstMatch(
          [
            { label: 'Question', value: question.question },
            { label: 'Answer', value: question.answer },
            { label: 'Rationale', value: question.rationale },
            { label: 'Status', value: questionStatusLabels[question.status] },
          ],
          query,
        ),
        question.id,
      )
    })

    socCase.findings.forEach((finding) => {
      push(
        'finding',
        finding.title,
        firstMatch(
          [
            { label: 'Finding title', value: finding.title },
            { label: 'Finding description', value: finding.description },
            { label: 'Confidence', value: confidenceLabels[finding.confidence] },
            { label: 'Status', value: finding.status ? findingStatusLabels[finding.status] : undefined },
            { label: 'Category', value: finding.category ? findingCategoryLabels[finding.category] : undefined },
          ],
          query,
        ),
        finding.id,
      )
    })

    socCase.mitreMappings.forEach((mapping) => {
      push(
        'mitre',
        `${mapping.techniqueId} ${mapping.techniqueName}`,
        firstMatch(
          [
            { label: 'Technique ID', value: mapping.techniqueId },
            { label: 'Technique name', value: mapping.techniqueName },
            { label: 'Tactic', value: mapping.tactic },
            { label: 'Rationale', value: mapping.rationale },
            { label: 'Confidence', value: confidenceLabels[mapping.confidence] },
          ],
          query,
        ),
        mapping.id,
      )
    })

    const closure = socCase.closure
    if (closure) {
      push(
        'closure',
        'Closure decision',
        firstMatch(
          [
            { label: 'Classification', value: closure.verdict ? verdictLabels[closure.verdict] : undefined },
            { label: 'Closure status', value: closure.closureStatus ? closureStatusLabels[closure.closureStatus] : undefined },
            { label: 'Closure rationale', value: closure.rationale },
            { label: 'Recommended action', value: closure.recommendedAction },
            { label: 'Impact summary', value: closure.impactSummary },
          ],
          query,
        ),
        'closure',
      )
    }

    socCase.recommendations.forEach((recommendation) => {
      push(
        'recommendation',
        recommendation.title,
        firstMatch(
          [
            { label: 'Recommendation', value: recommendation.title },
            { label: 'Description', value: recommendation.description },
            { label: 'Priority', value: priorityLabels[recommendation.priority] },
            { label: 'Category', value: recommendation.category ? recommendationCategoryLabels[recommendation.category] : undefined },
            { label: 'Status', value: recommendation.status ? recommendationStatusLabels[recommendation.status] : undefined },
          ],
          query,
        ),
        recommendation.id,
      )
    })

    const lab = socCase.lab
    if (lab?.enabled) {
      push(
        'lab',
        lab.labName || lab.platform || 'Lab notes',
        firstMatch(
          [
            { label: 'Lab platform', value: lab.platform },
            { label: 'Lab name', value: lab.labName },
            { label: 'Scenario summary', value: lab.scenarioSummary },
            { label: 'Tools used', value: lab.toolsUsed },
            { label: 'Learning notes', value: lab.learningNotes },
          ],
          query,
        ),
        'lab',
      )
    }
  }

  return results
}
