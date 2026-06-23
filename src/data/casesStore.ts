import type {
  AgentContribution,
  AgentContributionStatus,
  AgentContributionType,
  AnalystQuestion,
  CaseClosure,
  CaseSource,
  CaseStatus,
  ChecklistGroup,
  ChecklistItem,
  ClassificationVerdict,
  ClosureStatus,
  Confidence,
  Entity,
  EntityType,
  EvidenceItem,
  EvidenceType,
  Finding,
  FindingCategory,
  FindingStatus,
  MitreMapping,
  QuestionStatus,
  Recommendation,
  RecommendationCategory,
  RecommendationPriority,
  RecommendationStatus,
  Severity,
  SocCase,
  TimelineEvent,
  TimelinePhase,
} from '../types'
import { readJSON, removeKey, writeJSON } from '../utils/storage'
import { demoCases } from './demoCases'
import { getCaseTemplate, type CaseTemplate } from './caseTemplates'

const STORAGE_KEY = 'soc-case-workspace:cases'
const STORAGE_WARNING_KEY = 'soc-case-workspace:storage-warning'
const VALID_CASE_SOURCES: CaseSource[] = [
  'edr',
  'siem',
  'email_gateway',
  'identity_provider',
  'firewall',
  'cloud',
  'user_report',
  'threat_intel',
  'other',
]
const VALID_SEVERITIES: Severity[] = ['informational', 'low', 'medium', 'high', 'critical']
const VALID_CASE_STATUSES: CaseStatus[] = ['new', 'triage', 'investigating', 'closed']

/** Bump if the persisted/exported case shape changes incompatibly. */
export const CASES_SCHEMA_VERSION = 1

export function getStorageWarning(): string | null {
  return readJSON<string | null>(STORAGE_WARNING_KEY, null)
}

export function clearStorageWarning(): void {
  removeKey(STORAGE_WARNING_KEY)
}

function setStorageWarning(message: string): void {
  writeJSON(STORAGE_WARNING_KEY, message)
}

/**
 * Load cases from localStorage. On first run (no stored value yet) the store is
 * seeded with the synthetic demo cases so the app is never empty on first open.
 * An explicitly emptied list (`[]`) is respected and not re-seeded.
 */
export function loadCases(): SocCase[] {
  let stored: unknown

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      clearStorageWarning()
      writeJSON(STORAGE_KEY, demoCases)
      return demoCases
    }
    stored = JSON.parse(raw)
  } catch {
    setStorageWarning('Saved case data could not be read safely, so the demo cases were restored.')
    writeJSON(STORAGE_KEY, demoCases)
    return demoCases
  }

  if (Array.isArray(stored) && stored.every(isValidCaseShape)) {
    clearStorageWarning()
    return stored as SocCase[]
  }

  setStorageWarning('Saved case data had an unexpected shape, so the demo cases were restored.')
  writeJSON(STORAGE_KEY, demoCases)
  return demoCases
}

export function persistCases(cases: SocCase[]): void {
  writeJSON(STORAGE_KEY, cases)
}

// ---- Backup / restore / reset (Data management) ----

export interface CasesExport {
  schemaVersion: number
  exportedAt: string
  cases: SocCase[]
}

/** Wrap the current cases in a versioned export envelope. */
export function buildCasesExport(cases: SocCase[]): CasesExport {
  return { schemaVersion: CASES_SCHEMA_VERSION, exportedAt: new Date().toISOString(), cases }
}

/** Download filename for an export, e.g. soc-case-workspace-cases-2026-06-21.json */
export function casesExportFilename(): string {
  return `soc-case-workspace-cases-${new Date().toISOString().slice(0, 10)}.json`
}

/**
 * Validate parsed JSON and extract the cases. Accepts either an export envelope
 * (`{ cases: [...] }`) or a bare array of cases. Throws a clear error otherwise.
 */
export function parseCasesImport(raw: unknown): SocCase[] {
  const cases = Array.isArray(raw)
    ? raw
    : raw && typeof raw === 'object' && Array.isArray((raw as { cases?: unknown }).cases)
      ? (raw as { cases: unknown[] }).cases
      : null
  if (!cases) {
    throw new Error('Expected a JSON array of cases, or an object with a "cases" array.')
  }
  if (!cases.every(isValidCaseShape)) {
    throw new Error('One or more cases are missing required fields (id, title, and the section arrays).')
  }
  return cases as SocCase[]
}

function isValidCaseShape(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  const requiredArrays = [
    'affectedEntities',
    'evidence',
    'timeline',
    'analystQuestions',
    'findings',
    'mitreMappings',
    'recommendations',
  ]
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.title === 'string' &&
    typeof candidate.summary === 'string' &&
    typeof candidate.owner === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.updatedAt === 'string' &&
    VALID_CASE_SOURCES.includes(candidate.source as CaseSource) &&
    VALID_SEVERITIES.includes(candidate.severity as Severity) &&
    VALID_CASE_STATUSES.includes(candidate.status as CaseStatus) &&
    requiredArrays.every((key) => Array.isArray(candidate[key]))
  )
}

/** Restore the original synthetic demo cases. */
export function resetToDemoCases(): void {
  writeJSON(STORAGE_KEY, demoCases)
}

/** Remove locally saved cases (next load re-seeds the demo cases). */
export function clearStoredCases(): void {
  removeKey(STORAGE_KEY)
}

/** Fields collected from the create-case form. */
export interface NewCaseInput {
  title: string
  summary: string
  source: CaseSource
  severity: Severity
  owner: string
  status?: CaseStatus
  /** Optional template to prefill starter content from. */
  templateId?: string
}

/**
 * Build a new case from form input. A blank case starts with empty collections;
 * if a template is chosen, starter analyst questions, draft (low-confidence)
 * MITRE mappings, and an investigation checklist are prefilled — all editable.
 */
export function createCase(input: NewCaseInput): SocCase {
  const now = new Date().toISOString()
  const base: SocCase = {
    id: generateId('case'),
    title: input.title.trim(),
    summary: input.summary.trim(),
    source: input.source,
    severity: input.severity,
    status: input.status ?? 'new',
    owner: input.owner.trim() || 'unassigned',
    affectedEntities: [],
    evidence: [],
    timeline: [],
    analystQuestions: [],
    findings: [],
    mitreMappings: [],
    recommendations: [],
    createdAt: now,
    updatedAt: now,
  }

  const template = input.templateId ? getCaseTemplate(input.templateId) : undefined
  if (!template) return base

  return {
    ...base,
    templateId: template.id,
    analystQuestions: template.analystQuestions.map((entry) =>
      createAnalystQuestion({
        question: entry.question,
        status: 'open',
        answer: '',
        rationale: entry.rationale ?? '',
      }),
    ),
    mitreMappings: template.mitreTechniques.map((technique) =>
      createMitreMapping({
        techniqueId: technique.techniqueId,
        techniqueName: technique.techniqueName,
        tactic: technique.tactic,
        confidence: 'low',
        rationale:
          technique.rationale ??
          `Possible technique from the "${template.name}" template — validate against evidence.`,
        relatedFindingIds: [],
        relatedEvidenceIds: [],
      }),
    ),
    checklist: buildChecklistFromTemplate(template),
  }
}

function buildChecklistFromTemplate(template: CaseTemplate): ChecklistItem[] {
  const items: ChecklistItem[] = []
  const add = (group: ChecklistGroup, labels: string[]) => {
    for (const label of labels) items.push({ id: generateId('chk'), group, label, done: false })
  }
  add('evidence', template.evidenceChecklist)
  add('timeline', template.timelineCheckpoints)
  add('findings', template.suggestedFindings)
  add('closure', template.closureConsiderations)
  return items
}

/** Fields collected from the add-evidence form. */
export interface NewEvidenceInput {
  title: string
  type: EvidenceType
  source: string
  /** Raw value from a datetime-local input, or empty. */
  observedAt: string
  detail: string
}

/** Build an evidence item from form input. */
export function createEvidenceItem(input: NewEvidenceInput): EvidenceItem {
  return {
    id: generateId('ev'),
    type: input.type,
    title: input.title.trim(),
    detail: input.detail.trim(),
    source: input.source.trim() || undefined,
    observedAt: normalizeTimestamp(input.observedAt),
  }
}

export function updateEvidenceItem(existing: EvidenceItem, input: NewEvidenceInput): EvidenceItem {
  return { ...existing, ...createEvidenceItem(input), id: existing.id }
}

/** Editable context fields for an existing case. */
export interface CaseMetadataInput {
  title: string
  summary: string
  source: CaseSource
  severity: Severity
  status: CaseStatus
  owner: string
}

/** Fields collected from the add-affected-entity form. */
export interface NewEntityInput {
  type: EntityType
  value: string
  role: string
  description: string
}

export function createEntity(input: NewEntityInput): Entity {
  return {
    id: generateId('entity'),
    type: input.type,
    value: input.value.trim(),
    role: input.role.trim() || undefined,
    description: input.description.trim() || undefined,
  }
}

/** Fields collected from the add-recommendation form. */
export interface NewRecommendationInput {
  title: string
  category: RecommendationCategory
  priority: RecommendationPriority
  status: RecommendationStatus
  description: string
}

export function createRecommendation(input: NewRecommendationInput): Recommendation {
  return {
    id: generateId('rec'),
    title: input.title.trim(),
    category: input.category,
    priority: input.priority,
    status: input.status,
    description: input.description.trim(),
  }
}

/** Fields collected from the add-timeline-event form. */
export interface NewTimelineEventInput {
  title: string
  /** Raw value from a datetime-local input. */
  timestamp: string
  phase: TimelinePhase
  description: string
  /** A single related evidence id, or empty for none. */
  relatedEvidenceId: string
}

/** Build a timeline event from form input. */
export function createTimelineEvent(input: NewTimelineEventInput): TimelineEvent {
  return {
    id: generateId('tl'),
    timestamp: normalizeTimestamp(input.timestamp) ?? new Date().toISOString(),
    title: input.title.trim(),
    description: input.description.trim(),
    phase: input.phase,
    relatedEvidenceIds: input.relatedEvidenceId ? [input.relatedEvidenceId] : undefined,
  }
}

export function updateTimelineEvent(
  existing: TimelineEvent,
  input: NewTimelineEventInput,
): TimelineEvent {
  return { ...existing, ...createTimelineEvent(input), id: existing.id }
}

/** Fields collected from the add-analyst-question form. */
export interface NewQuestionInput {
  question: string
  status: QuestionStatus
  answer: string
  rationale: string
}

/** Build an analyst-question / decision-journal entry from form input. */
export function createAnalystQuestion(input: NewQuestionInput): AnalystQuestion {
  const now = new Date().toISOString()
  const answer = input.answer.trim()
  const rationale = input.rationale.trim()
  return {
    id: generateId('q'),
    question: input.question.trim(),
    status: input.status,
    answer: answer || undefined,
    rationale: rationale || undefined,
    createdAt: now,
    answeredAt: input.status === 'answered' ? now : undefined,
  }
}

export function updateAnalystQuestion(
  existing: AnalystQuestion,
  input: NewQuestionInput,
): AnalystQuestion {
  const updated = createAnalystQuestion(input)
  return {
    ...existing,
    ...updated,
    id: existing.id,
    createdAt: existing.createdAt,
    answeredAt:
      input.status === 'answered' ? existing.answeredAt ?? updated.answeredAt : undefined,
  }
}

/** Fields collected from the add-finding form. */
export interface NewFindingInput {
  title: string
  category: FindingCategory
  severity: Severity
  confidence: Confidence
  status: FindingStatus
  description: string
  relatedEvidenceIds: string[]
  relatedTimelineEventIds: string[]
}

/** Build an evidence-backed finding from form input. */
export function createFinding(input: NewFindingInput): Finding {
  return {
    id: generateId('f'),
    title: input.title.trim(),
    description: input.description.trim(),
    confidence: input.confidence,
    category: input.category,
    severity: input.severity,
    status: input.status,
    relatedEvidenceIds: input.relatedEvidenceIds.length ? input.relatedEvidenceIds : undefined,
    relatedTimelineEventIds: input.relatedTimelineEventIds.length
      ? input.relatedTimelineEventIds
      : undefined,
  }
}

export function updateFinding(existing: Finding, input: NewFindingInput): Finding {
  return { ...existing, ...createFinding(input), id: existing.id }
}

/** Fields collected from the add-MITRE-mapping form. */
export interface NewMitreInput {
  techniqueId: string
  techniqueName: string
  tactic: string
  confidence: Confidence
  rationale: string
  relatedFindingIds: string[]
  relatedEvidenceIds: string[]
}

/** Build an analyst-authored ATT&CK mapping from form input. */
export function createMitreMapping(input: NewMitreInput): MitreMapping {
  return {
    id: generateId('mt'),
    tactic: input.tactic.trim(),
    techniqueId: input.techniqueId.trim(),
    techniqueName: input.techniqueName.trim(),
    rationale: input.rationale.trim(),
    confidence: input.confidence,
    relatedFindingIds: input.relatedFindingIds.length ? input.relatedFindingIds : undefined,
    relatedEvidenceIds: input.relatedEvidenceIds.length ? input.relatedEvidenceIds : undefined,
  }
}

export function updateMitreMapping(existing: MitreMapping, input: NewMitreInput): MitreMapping {
  return { ...existing, ...createMitreMapping(input), id: existing.id }
}

/** Fields collected from the external-analysis contribution form. */
export interface NewAgentContributionInput {
  agentName: string
  type: AgentContributionType
  output: string
  confidence: Confidence | ''
  status: AgentContributionStatus
  relatedEvidenceIds: string[]
}

/** Build an explicitly untrusted, human-reviewed external-analysis record. */
export function createAgentContribution(input: NewAgentContributionInput): AgentContribution {
  const now = new Date().toISOString()
  return {
    id: generateId('agent'),
    agentName: input.agentName.trim(),
    type: input.type,
    output: input.output.trim(),
    confidence: input.confidence || undefined,
    status: input.status,
    relatedEvidenceIds: input.relatedEvidenceIds.length ? input.relatedEvidenceIds : undefined,
    createdAt: now,
    reviewedAt: input.status === 'unreviewed' ? undefined : now,
  }
}

export function updateAgentContribution(
  existing: AgentContribution,
  input: NewAgentContributionInput,
): AgentContribution {
  const updated = createAgentContribution(input)
  return {
    ...existing,
    ...updated,
    id: existing.id,
    createdAt: existing.createdAt,
    reviewedAt:
      input.status === 'unreviewed'
        ? undefined
        : existing.status === input.status
          ? existing.reviewedAt ?? updated.reviewedAt
          : updated.reviewedAt,
  }
}

/** Fields collected from the closure / classification form. */
export interface ClosureInput {
  verdict: ClassificationVerdict | ''
  closureStatus: ClosureStatus | ''
  rationale: string
  recommendedAction: string
  impactSummary: string
}

/** Merge closure-form input into the case's closure assessment. */
export function buildClosure(existing: CaseClosure | undefined, input: ClosureInput): CaseClosure {
  const closureStatus = input.closureStatus || undefined
  const closure: CaseClosure = {
    ...existing,
    verdict: input.verdict || undefined,
    closureStatus,
    rationale: input.rationale.trim() || undefined,
    recommendedAction: input.recommendedAction.trim() || undefined,
    impactSummary: input.impactSummary.trim() || undefined,
  }
  if (closureStatus === 'closed' && !closure.closedAt) {
    closure.closedAt = new Date().toISOString()
  }
  return closure
}

/** datetime-local has no timezone; treat the entered value as UTC (synthetic). */
function normalizeTimestamp(value: string): string | undefined {
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(trimmed)) {
    return trimmed.length === 16 ? `${trimmed}:00Z` : `${trimmed}Z`
  }
  return trimmed
}

function generateId(prefix: string): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `${prefix}-${cryptoObj.randomUUID()}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
