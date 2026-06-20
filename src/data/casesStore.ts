import type {
  CaseSource,
  CaseStatus,
  EvidenceItem,
  EvidenceType,
  Severity,
  SocCase,
  TimelineEvent,
  TimelinePhase,
} from '../types'
import { readJSON, writeJSON } from '../utils/storage'
import { demoCases } from './demoCases'

const STORAGE_KEY = 'soc-case-workspace:cases'

/**
 * Load cases from localStorage. On first run (no stored value yet) the store is
 * seeded with the synthetic demo cases so the app is never empty on first open.
 * An explicitly emptied list (`[]`) is respected and not re-seeded.
 */
export function loadCases(): SocCase[] {
  const stored = readJSON<SocCase[] | null>(STORAGE_KEY, null)
  if (stored && Array.isArray(stored)) return stored
  writeJSON(STORAGE_KEY, demoCases)
  return demoCases
}

export function persistCases(cases: SocCase[]): void {
  writeJSON(STORAGE_KEY, cases)
}

/** Fields collected from the create-case form. */
export interface NewCaseInput {
  title: string
  summary: string
  source: CaseSource
  severity: Severity
  owner: string
  status?: CaseStatus
}

/** Build a new, empty case from form input. Child collections start empty and
 *  are populated in their own sections/milestones. */
export function createCase(input: NewCaseInput): SocCase {
  const now = new Date().toISOString()
  return {
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
