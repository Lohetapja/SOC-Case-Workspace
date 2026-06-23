import type { SocCase } from '../types'
import type { AllCaseLayouts } from '../utils/graphLayout'
import { isGraphLayoutsShape } from '../utils/graphLayout'
import { parseCasesImport } from './casesStore'
import { sampleLibrary } from './sampleLibrary'

export const WORKSPACE_SNAPSHOT_SCHEMA_VERSION = 1

export type WorkspaceSnapshotExportType = 'whole-workspace' | 'selected-case' | 'selected-cases'

export interface WorkspaceSnapshot {
  format: 'soc-case-workspace-snapshot'
  exportType: WorkspaceSnapshotExportType
  schemaVersion: number
  exportedAt: string
  selectedCaseIds?: string[]
  selectedCaseTitles?: string[]
  cases: SocCase[]
  graphLayouts: AllCaseLayouts
  appSettings: Record<string, never>
}

export type WorkspaceImport =
  | { kind: 'snapshot'; snapshot: WorkspaceSnapshot }
  | { kind: 'cases'; cases: SocCase[] }

export interface WorkspaceSnapshotOptions {
  exportType?: WorkspaceSnapshotExportType
  selectedCaseIds?: string[]
  includeGraphLayouts?: boolean
  includeDemoCases?: boolean
  includeAppSettings?: boolean
}

const SAMPLE_CASE_IDS = new Set(sampleLibrary.map((entry) => entry.caseId))

export function workspaceSnapshotFilename(snapshot: WorkspaceSnapshot): string {
  const date = new Date().toISOString().slice(0, 10)

  if (snapshot.exportType === 'selected-case') {
    const caseTitle = snapshot.selectedCaseTitles?.[0] ?? snapshot.cases[0]?.title ?? 'case'
    return `soc-case-workspace-case-${slugify(caseTitle)}-${date}.json`
  }

  if (snapshot.exportType === 'selected-cases') {
    return `soc-case-workspace-selected-cases-${date}.json`
  }

  return `soc-case-workspace-full-${date}.json`
}

export function buildWorkspaceSnapshot(
  cases: SocCase[],
  graphLayouts: AllCaseLayouts,
  options: WorkspaceSnapshotOptions = {},
): WorkspaceSnapshot {
  const exportType = options.exportType ?? 'whole-workspace'
  const selectedCaseIds = options.selectedCaseIds ?? []
  const includeGraphLayouts = options.includeGraphLayouts ?? true
  const includeDemoCases = options.includeDemoCases ?? true
  const includeAppSettings = options.includeAppSettings ?? true

  const selectedIdSet = new Set(selectedCaseIds)
  const filteredCases = cases.filter((socCase) => {
    const selected =
      exportType === 'whole-workspace' ? true : selectedIdSet.has(socCase.id)
    const demoAllowed = includeDemoCases || !SAMPLE_CASE_IDS.has(socCase.id)
    return selected && demoAllowed
  })
  const includedCaseIds = new Set(filteredCases.map((socCase) => socCase.id))
  const filteredLayouts = includeGraphLayouts
    ? Object.fromEntries(
        Object.entries(graphLayouts).filter(([caseId]) => includedCaseIds.has(caseId)),
      )
    : {}

  const selectedMetadata =
    exportType === 'whole-workspace'
      ? {}
      : {
          selectedCaseIds: filteredCases.map((socCase) => socCase.id),
          selectedCaseTitles: filteredCases.map((socCase) => socCase.title),
        }

  return {
    format: 'soc-case-workspace-snapshot',
    exportType,
    schemaVersion: WORKSPACE_SNAPSHOT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    ...selectedMetadata,
    cases: filteredCases,
    graphLayouts: filteredLayouts,
    appSettings: includeAppSettings ? {} : {},
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
    const exportType = normalizeExportType(raw.exportType)
    const selectedCaseIds = parseOptionalStringArray(raw.selectedCaseIds, 'selectedCaseIds')
    const selectedCaseTitles = parseOptionalStringArray(raw.selectedCaseTitles, 'selectedCaseTitles')

    return {
      kind: 'snapshot',
      snapshot: {
        format: 'soc-case-workspace-snapshot',
        exportType,
        schemaVersion: raw.schemaVersion,
        exportedAt: raw.exportedAt,
        ...(selectedCaseIds ? { selectedCaseIds } : {}),
        ...(selectedCaseTitles ? { selectedCaseTitles } : {}),
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
  const candidate = value as { exportType?: unknown; format?: unknown }
  return (
    candidate.format === 'soc-case-workspace-snapshot' ||
    candidate.exportType === 'soc-case-workspace-snapshot' ||
    'graphLayouts' in value ||
    'appSettings' in value
  )
}

function normalizeExportType(value: unknown): WorkspaceSnapshotExportType {
  if (value === 'soc-case-workspace-snapshot') return 'whole-workspace'
  if (value === 'whole-workspace' || value === 'selected-case' || value === 'selected-cases') {
    return value
  }
  throw new Error('Workspace snapshot has an invalid export type.')
}

function parseOptionalStringArray(value: unknown, fieldName: string): string[] | undefined {
  if (value === undefined) return undefined
  if (!Array.isArray(value) || !value.every((entry) => typeof entry === 'string')) {
    throw new Error(`Workspace snapshot has invalid ${fieldName} data.`)
  }
  return value
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'case'
}
