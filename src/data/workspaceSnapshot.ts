import type { SocCase } from '../types'
import type { AllCaseLayouts } from '../utils/graphLayout'
import { isGraphLayoutsShape } from '../utils/graphLayout'
import { parseCasesImport } from './casesStore'

export const WORKSPACE_SNAPSHOT_SCHEMA_VERSION = 1

export interface WorkspaceSnapshot {
  exportType: 'soc-case-workspace-snapshot'
  schemaVersion: number
  exportedAt: string
  cases: SocCase[]
  graphLayouts: AllCaseLayouts
  appSettings: Record<string, never>
}

export type WorkspaceImport =
  | { kind: 'snapshot'; snapshot: WorkspaceSnapshot }
  | { kind: 'cases'; cases: SocCase[] }

export function workspaceSnapshotFilename(): string {
  return `soc-case-workspace-snapshot-${new Date().toISOString().slice(0, 10)}.json`
}

export function buildWorkspaceSnapshot(
  cases: SocCase[],
  graphLayouts: AllCaseLayouts,
): WorkspaceSnapshot {
  return {
    exportType: 'soc-case-workspace-snapshot',
    schemaVersion: WORKSPACE_SNAPSHOT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    cases,
    graphLayouts,
    appSettings: {},
  }
}

export function parseWorkspaceImport(raw: unknown): WorkspaceImport {
  if (isWorkspaceSnapshotCandidate(raw)) {
    const cases = parseCasesImport({ cases: raw.cases })
    if (typeof raw.schemaVersion !== 'number') {
      throw new Error('Workspace snapshot is missing a numeric schemaVersion.')
    }
    if (typeof raw.exportedAt !== 'string') {
      throw new Error('Workspace snapshot is missing an exportedAt timestamp.')
    }
    if (!isGraphLayoutsShape(raw.graphLayouts)) {
      throw new Error('Workspace snapshot has invalid graph layout data.')
    }
    if (!raw.appSettings || typeof raw.appSettings !== 'object' || Array.isArray(raw.appSettings)) {
      throw new Error('Workspace snapshot has invalid app settings data.')
    }
    return {
      kind: 'snapshot',
      snapshot: {
        exportType: 'soc-case-workspace-snapshot',
        schemaVersion: raw.schemaVersion,
        exportedAt: raw.exportedAt,
        cases,
        graphLayouts: raw.graphLayouts,
        appSettings: {},
      },
    }
  }

  return { kind: 'cases', cases: parseCasesImport(raw) }
}

function isWorkspaceSnapshotCandidate(value: unknown): value is Partial<WorkspaceSnapshot> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const candidate = value as { exportType?: unknown }
  return (
    candidate.exportType === 'soc-case-workspace-snapshot' ||
    'graphLayouts' in value ||
    'appSettings' in value
  )
}
