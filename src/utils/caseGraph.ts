import type { SocCase } from '../types'
import { confidenceLabels, entityTypeLabels, priorityLabels } from '../data/labels'

/**
 * Transforms a single SocCase into a read-only graph of nodes and links for the
 * Case Graph view. Pure function, no side effects — easy to test and reason
 * about. Operates on one case only (no global/cross-case graph).
 */

export type GraphNodeType =
  | 'case'
  | 'entity'
  | 'evidence'
  | 'timeline'
  | 'finding'
  | 'mitre'
  | 'recommendation'

export interface NodeTypeMeta {
  type: GraphNodeType
  label: string
  color: string
}

/**
 * Dark, Obsidian-inspired palette. Drives the Case Graph node colours and the
 * page legend. Kept here (free of the heavy force-graph import) so the page can
 * reference it without pulling react-force-graph into the main bundle.
 */
export const NODE_TYPE_META: NodeTypeMeta[] = [
  { type: 'case', label: 'Case', color: '#f5c542' },
  { type: 'entity', label: 'Entity', color: '#5aa9e6' },
  { type: 'evidence', label: 'Evidence', color: '#4ade80' },
  { type: 'timeline', label: 'Timeline', color: '#b794f6' },
  { type: 'finding', label: 'Finding', color: '#f472b6' },
  { type: 'mitre', label: 'ATT&CK', color: '#fb7185' },
  { type: 'recommendation', label: 'Recommendation', color: '#38bdf8' },
]

export interface CaseGraphNode {
  id: string
  type: GraphNodeType
  /** Short label drawn on the canvas and shown on hover. */
  label: string
  /** Human-readable type, e.g. "Timeline event". */
  typeLabel: string
  /** Longer summary shown in the detail panel on click. */
  detail: string
  /** Number of links touching this node (precomputed for the detail panel). */
  degree?: number
  /** Position fields populated by the force-graph engine at render time. */
  x?: number
  y?: number
  /** Fixed/pinned position — set on drag-end and when restoring a saved layout. */
  fx?: number
  fy?: number
}

export interface CaseGraphLink {
  source: string
  target: string
}

export interface CaseGraphData {
  nodes: CaseGraphNode[]
  links: CaseGraphLink[]
}

/** "2026-06-18T09:14:00Z" -> "2026-06-18 09:14 UTC" */
function shortTime(iso: string): string {
  const match = iso.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/)
  return match ? `${match[1]} ${match[2]} UTC` : iso
}

export function buildCaseGraph(socCase: SocCase): CaseGraphData {
  const nodes: CaseGraphNode[] = []
  const links: CaseGraphLink[] = []
  const linkKeys = new Set<string>()

  const addLink = (source: string, target: string) => {
    if (source === target) return
    const key = `${source}>>${target}`
    if (linkKeys.has(key)) return
    linkKeys.add(key)
    links.push({ source, target })
  }

  const caseNodeId = `case:${socCase.id}`
  nodes.push({
    id: caseNodeId,
    type: 'case',
    label: socCase.title,
    typeLabel: 'Case',
    detail: socCase.summary,
  })

  // Affected entities — hang off the case, and off any evidence that cites them.
  for (const entity of socCase.affectedEntities) {
    const id = `entity:${entity.id}`
    const detail = [entityTypeLabels[entity.type], entity.role].filter(Boolean).join(' · ')
    nodes.push({ id, type: 'entity', label: entity.value, typeLabel: 'Entity', detail })
    addLink(caseNodeId, id)
  }

  // Evidence — hangs off the case; links out to the entities it references.
  for (const item of socCase.evidence) {
    const id = `evidence:${item.id}`
    nodes.push({ id, type: 'evidence', label: item.title, typeLabel: 'Evidence', detail: item.detail })
    addLink(caseNodeId, id)
    for (const entityId of item.relatedEntityIds ?? []) {
      addLink(id, `entity:${entityId}`)
    }
  }

  // Timeline events — hang off the case; link to the evidence supporting them.
  for (const event of socCase.timeline) {
    const id = `timeline:${event.id}`
    nodes.push({
      id,
      type: 'timeline',
      label: event.title,
      typeLabel: 'Timeline event',
      detail: `${shortTime(event.timestamp)} — ${event.description}`,
    })
    addLink(caseNodeId, id)
    for (const evidenceId of event.relatedEvidenceIds ?? []) {
      addLink(id, `evidence:${evidenceId}`)
    }
  }

  // Findings — connect to their supporting evidence (evidence -> finding).
  for (const finding of socCase.findings) {
    const id = `finding:${finding.id}`
    nodes.push({
      id,
      type: 'finding',
      label: finding.title,
      typeLabel: 'Finding',
      detail: `${confidenceLabels[finding.confidence]} confidence · ${finding.description}`,
    })
    const evidenceIds = finding.relatedEvidenceIds ?? []
    if (evidenceIds.length === 0) {
      addLink(caseNodeId, id) // fallback so the finding is never orphaned
    } else {
      for (const evidenceId of evidenceIds) addLink(`evidence:${evidenceId}`, id)
    }
  }

  // MITRE mappings — link from findings that share evidence (finding -> MITRE),
  // and from the evidence itself; fall back to the case if neither applies.
  for (const mapping of socCase.mitreMappings) {
    const id = `mitre:${mapping.id}`
    nodes.push({
      id,
      type: 'mitre',
      label: `${mapping.techniqueId} ${mapping.techniqueName}`,
      typeLabel: 'ATT&CK technique',
      detail: `${mapping.tactic} · ${mapping.confidence} confidence · ${mapping.rationale}`,
    })
    const mappingEvidence = mapping.relatedEvidenceIds ?? []
    let linked = false
    for (const finding of socCase.findings) {
      const shared = (finding.relatedEvidenceIds ?? []).some((evId) => mappingEvidence.includes(evId))
      if (shared) {
        addLink(`finding:${finding.id}`, id)
        linked = true
      }
    }
    for (const evidenceId of mappingEvidence) {
      addLink(`evidence:${evidenceId}`, id)
      linked = true
    }
    if (!linked) addLink(caseNodeId, id)
  }

  // Recommendations — hang off the case.
  for (const rec of socCase.recommendations) {
    const id = `rec:${rec.id}`
    nodes.push({
      id,
      type: 'recommendation',
      label: rec.title,
      typeLabel: 'Recommendation',
      detail: `${priorityLabels[rec.priority]} priority · ${rec.description}`,
    })
    addLink(caseNodeId, id)
  }

  // Precompute degree for the detail panel (before the engine mutates links).
  const degree: Record<string, number> = {}
  for (const link of links) {
    degree[link.source] = (degree[link.source] ?? 0) + 1
    degree[link.target] = (degree[link.target] ?? 0) + 1
  }
  for (const node of nodes) node.degree = degree[node.id] ?? 0

  return { nodes, links }
}
