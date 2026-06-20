import type { CaseSource, CaseStatus, Severity, SocCase } from '../types'
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
    id: generateCaseId(),
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

function generateCaseId(): string {
  const cryptoObj = globalThis.crypto
  if (cryptoObj && typeof cryptoObj.randomUUID === 'function') {
    return `case-${cryptoObj.randomUUID()}`
  }
  return `case-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}
