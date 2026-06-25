import type { SocCase } from '../types'
import {
  confidenceLabels,
  entityTypeLabels,
  priorityLabels,
  recommendationCategoryLabels,
  recommendationStatusLabels,
  sourceLabels,
} from '../data/labels'

/**
 * Transforms a single SocCase into a structured, investigation-flow "Artifact
 * Map": artifacts grouped into lanes (Identity → Delivery → Execution → Network
 * → Detection → Response) with relationships between them. Pure function,
 * read-only, synthetic data only — a companion to the free-form Case Graph.
 */

export type ArtifactLane =
  | 'identity'
  | 'delivery'
  | 'execution'
  | 'network'
  | 'detection'
  | 'response'

export type ArtifactType =
  | 'user'
  | 'host'
  | 'email'
  | 'file'
  | 'process'
  | 'destination'
  | 'detection'
  | 'finding'
  | 'mitre'
  | 'response'
  | 'question'

export type ArtifactNodeSource =
  | { kind: 'entity'; id: string }
  | { kind: 'evidence'; id: string }
  | { kind: 'timeline'; id: string }
  | { kind: 'finding'; id: string }
  | { kind: 'mitre'; id: string }
  | { kind: 'recommendation'; id: string }
  | { kind: 'question'; id: string }

export interface ArtifactNode {
  id: string
  lane: ArtifactLane
  type: ArtifactType
  title: string
  description: string
  timestamp?: string
  relatedEvidenceIds?: string[]
  /** The underlying case record that can be quick-edited, when unambiguous. */
  source?: ArtifactNodeSource
  /** Number of relationships touching this artifact (precomputed). */
  degree?: number
}

export interface ArtifactEdge {
  id: string
  source: string
  target: string
  label: string
  supportingEvidenceIds?: string[]
}

export interface ArtifactMapData {
  nodes: ArtifactNode[]
  edges: ArtifactEdge[]
}

/** Lanes in investigation-flow order (drives the columns left→right). */
export const ARTIFACT_LANES: { id: ArtifactLane; title: string }[] = [
  { id: 'identity', title: 'Identity / User' },
  { id: 'delivery', title: 'Delivery' },
  { id: 'execution', title: 'Execution' },
  { id: 'network', title: 'Network / Egress' },
  { id: 'detection', title: 'Detection' },
  { id: 'response', title: 'Response' },
]

export function buildArtifactMap(socCase: SocCase): ArtifactMapData {
  const nodes: ArtifactNode[] = []
  const edges: ArtifactEdge[] = []
  const edgeKeys = new Set<string>()

  const addEdge = (
    source: string,
    target: string,
    label: string,
    supportingEvidenceIds?: string[],
  ) => {
    if (source === target) return
    const key = `${source}>>${target}>>${label}`
    if (edgeKeys.has(key)) return
    edgeKeys.add(key)
    edges.push({ id: `edge-${edges.length}`, source, target, label, supportingEvidenceIds })
  }

  const artifactId = (originalId: string) => `art-${originalId}`

  // --- Identity / User: user-like and host entities ---
  const userIds: string[] = []
  const hostIds: string[] = []
  for (const entity of socCase.affectedEntities) {
    if (entity.type === 'user' || entity.type === 'mailbox' || entity.type === 'cloud_account') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'identity',
        type: 'user',
        title: entity.value,
        description: entity.role ?? entityTypeLabels[entity.type],
        source: { kind: 'entity', id: entity.id },
      })
      userIds.push(id)
    } else if (entity.type === 'host') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'identity',
        type: 'host',
        title: entity.value,
        description: entity.role ?? 'Host',
        source: { kind: 'entity', id: entity.id },
      })
      hostIds.push(id)
    }
  }

  // --- Delivery: email evidence + file entities ---
  const emailArtifacts: { id: string; evidenceId?: string; relatedEntityIds: string[] }[] = []
  for (const item of socCase.evidence) {
    if (item.type === 'email') {
      const id = artifactId(item.id)
      nodes.push({
        id,
        lane: 'delivery',
        type: 'email',
        title: item.title,
        description: item.detail,
        timestamp: item.observedAt,
        relatedEvidenceIds: [item.id],
        source: { kind: 'evidence', id: item.id },
      })
      emailArtifacts.push({ id, evidenceId: item.id, relatedEntityIds: item.relatedEntityIds ?? [] })
    }
  }
  for (const entity of socCase.affectedEntities) {
    if (entity.type === 'email') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'delivery',
        type: 'email',
        title: entity.value,
        description: entity.description ?? entity.role ?? entityTypeLabels[entity.type],
        source: { kind: 'entity', id: entity.id },
      })
      emailArtifacts.push({ id, relatedEntityIds: [] })
    }
  }
  const fileIds: string[] = []
  for (const entity of socCase.affectedEntities) {
    if (entity.type === 'file' || entity.type === 'file_hash') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'delivery',
        type: 'file',
        title: entity.value,
        description: entity.role ?? 'File',
        source: { kind: 'entity', id: entity.id },
      })
      fileIds.push(id)
    }
  }

  // --- Execution: process entities ---
  const processIds: string[] = []
  for (const entity of socCase.affectedEntities) {
    if (entity.type === 'process') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'execution',
        type: 'process',
        title: entity.value,
        description: entity.role ?? 'Process',
        source: { kind: 'entity', id: entity.id },
      })
      processIds.push(id)
    }
  }

  // --- Network / Egress: ip / domain / url entities ---
  const destinationIds: string[] = []
  for (const entity of socCase.affectedEntities) {
    if (entity.type === 'ip_address' || entity.type === 'domain' || entity.type === 'url') {
      const id = artifactId(entity.id)
      nodes.push({
        id,
        lane: 'network',
        type: 'destination',
        title: entity.value,
        description: entity.role ?? entityTypeLabels[entity.type],
        source: { kind: 'entity', id: entity.id },
      })
      destinationIds.push(id)
    }
  }

  // --- Detection: a synthesized alert + findings + MITRE techniques ---
  const detectionId = artifactId(`detection-${socCase.id}`)
  const alertEvent = socCase.timeline.find(
    (event) => event.phase === 'detection' || /alert|detection|flagged/i.test(event.title),
  )
  const hasDetection =
    socCase.timeline.length > 0 || socCase.findings.length > 0 || socCase.mitreMappings.length > 0
  if (hasDetection) {
    nodes.push({
      id: detectionId,
      lane: 'detection',
      type: 'detection',
      title: alertEvent ? alertEvent.title : `Alert — ${sourceLabels[socCase.source]}`,
      description: alertEvent ? alertEvent.description : socCase.summary,
      timestamp: alertEvent?.timestamp,
      relatedEvidenceIds: alertEvent?.relatedEvidenceIds,
      source: alertEvent ? { kind: 'timeline', id: alertEvent.id } : undefined,
    })
  }

  const questionArtifacts: { id: string }[] = []
  for (const question of socCase.analystQuestions) {
    const id = artifactId(question.id)
    nodes.push({
      id,
      lane: 'detection',
      type: 'question',
      title: question.question,
      description: [
        `Status: ${question.status.replace('_', ' ')}`,
        question.answer && `Answer: ${question.answer}`,
        question.rationale && `Rationale: ${question.rationale}`,
      ].filter(Boolean).join(' · '),
      source: { kind: 'question', id: question.id },
    })
    questionArtifacts.push({ id })
  }

  const findingArtifacts: { id: string; evidenceIds: string[] }[] = []
  for (const finding of socCase.findings) {
    const id = artifactId(finding.id)
    nodes.push({
      id,
      lane: 'detection',
      type: 'finding',
      title: finding.title,
      description: `${confidenceLabels[finding.confidence]} confidence · ${finding.description}`,
      relatedEvidenceIds: finding.relatedEvidenceIds,
      source: { kind: 'finding', id: finding.id },
    })
    findingArtifacts.push({ id, evidenceIds: finding.relatedEvidenceIds ?? [] })
  }
  const mitreArtifacts: { id: string; evidenceIds: string[] }[] = []
  for (const mapping of socCase.mitreMappings) {
    const id = artifactId(mapping.id)
    nodes.push({
      id,
      lane: 'detection',
      type: 'mitre',
      title: `${mapping.techniqueId} ${mapping.techniqueName}`,
      description: `${mapping.tactic} · ${mapping.rationale}`,
      relatedEvidenceIds: mapping.relatedEvidenceIds,
      source: { kind: 'mitre', id: mapping.id },
    })
    mitreArtifacts.push({ id, evidenceIds: mapping.relatedEvidenceIds ?? [] })
  }

  // --- Response: recommendations ---
  const responseIds: string[] = []
  for (const rec of socCase.recommendations) {
    const id = artifactId(rec.id)
    nodes.push({
      id,
      lane: 'response',
      type: 'response',
      title: rec.title,
      description: [
        `${priorityLabels[rec.priority]} priority`,
        rec.category && recommendationCategoryLabels[rec.category],
        rec.status && recommendationStatusLabels[rec.status],
        rec.description,
      ].filter(Boolean).join(' · '),
      source: { kind: 'recommendation', id: rec.id },
    })
    responseIds.push(id)
  }

  // ===== Relationships =====
  // Delivery chain: user received email; email carried attachment (file).
  for (const email of emailArtifacts) {
    const linkedUsers = email.relatedEntityIds.map(artifactId).filter((id) => userIds.includes(id))
    const recipients = linkedUsers.length ? linkedUsers : userIds.slice(0, 1)
    const supportingEvidence = email.evidenceId ? [email.evidenceId] : undefined
    for (const user of recipients) addEdge(user, email.id, 'received', supportingEvidence)
    for (const file of fileIds) addEdge(email.id, file, 'carried attachment', supportingEvidence)
  }

  // Execution chain: file/host led to process.
  for (const file of fileIds) for (const process of processIds) addEdge(file, process, 'led to execution')
  if (fileIds.length === 0) {
    for (const host of hostIds) for (const process of processIds) addEdge(host, process, 'executed on')
  }

  // Network chain: process connected to destination (or user authenticated from it).
  if (processIds.length) {
    for (const process of processIds) for (const dest of destinationIds) addEdge(process, dest, 'connected to')
  } else {
    for (const user of userIds) for (const dest of destinationIds) addEdge(user, dest, 'authenticated from')
  }

  // Detection: the lead activity raised the alert; the alert concluded findings.
  if (hasDetection) {
    const leadSources = destinationIds.length
      ? destinationIds
      : processIds.length
        ? processIds
        : emailArtifacts.length
          ? emailArtifacts.map((email) => email.id)
          : userIds
    for (const lead of leadSources) addEdge(lead, detectionId, 'raised alert')
    for (const question of questionArtifacts) addEdge(detectionId, question.id, 'raises question')
    for (const finding of findingArtifacts) addEdge(detectionId, finding.id, 'concluded')
  }

  // Analytical: finding maps to MITRE (shared evidence); recommendation responds.
  for (const mitre of mitreArtifacts) {
    let linked = false
    for (const finding of findingArtifacts) {
      const shared = finding.evidenceIds.filter((id) => mitre.evidenceIds.includes(id))
      if (shared.length) {
        addEdge(finding.id, mitre.id, 'maps to', shared)
        linked = true
      }
    }
    if (!linked && hasDetection) addEdge(detectionId, mitre.id, 'maps to')
  }
  for (const response of responseIds) {
    if (findingArtifacts.length) addEdge(response, findingArtifacts[0].id, 'responds to')
    else if (hasDetection) addEdge(response, detectionId, 'responds to')
  }

  // Connection counts.
  const degree: Record<string, number> = {}
  for (const edge of edges) {
    degree[edge.source] = (degree[edge.source] ?? 0) + 1
    degree[edge.target] = (degree[edge.target] ?? 0) + 1
  }
  for (const node of nodes) node.degree = degree[node.id] ?? 0

  return { nodes, edges }
}
