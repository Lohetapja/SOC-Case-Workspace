import { readJSON, removeKey, writeJSON } from './storage'

/**
 * Per-case persistence of pinned Case Graph node positions, in localStorage.
 * Shape: { [caseId]: { [nodeId]: { x, y } } }. Positions are in force-graph
 * coordinate space (independent of zoom/pan). Stale node ids (e.g. for records
 * later removed) are simply ignored on restore.
 */

export interface NodePosition {
  x: number
  y: number
}

export type CaseLayout = Record<string, NodePosition>

export type AllCaseLayouts = Record<string, CaseLayout>

const STORAGE_KEY = 'soc-case-workspace:graph-layout'

function isNodePosition(value: unknown): value is NodePosition {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    Number.isFinite((value as NodePosition).x) &&
    Number.isFinite((value as NodePosition).y)
  )
}

export function isGraphLayoutsShape(value: unknown): value is AllCaseLayouts {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  return Object.values(value).every((caseLayout) => {
    if (!caseLayout || typeof caseLayout !== 'object' || Array.isArray(caseLayout)) return false
    return Object.values(caseLayout).every(isNodePosition)
  })
}

/** All saved graph layouts, keyed by case id. */
export function loadAllGraphLayouts(): AllCaseLayouts {
  const all = readJSON<unknown>(STORAGE_KEY, {})
  return isGraphLayoutsShape(all) ? all : {}
}

/** Replace all saved graph layouts, used by workspace snapshot import. */
export function replaceAllGraphLayouts(layouts: AllCaseLayouts): void {
  writeJSON(STORAGE_KEY, layouts)
}

/** Saved positions for one case (empty object if none). */
export function loadCaseLayout(caseId: string): CaseLayout {
  const all = loadAllGraphLayouts()
  return all[caseId] ?? {}
}

/** Pin one node's position for a case. */
export function saveNodePosition(caseId: string, nodeId: string, position: NodePosition): void {
  const all = loadAllGraphLayouts()
  const caseLayout = all[caseId] ?? {}
  caseLayout[nodeId] = position
  all[caseId] = caseLayout
  writeJSON(STORAGE_KEY, all)
}

/** Clear all saved positions for one case (used by "Reset layout"). */
export function clearCaseLayout(caseId: string): void {
  const all = loadAllGraphLayouts()
  if (all[caseId]) {
    delete all[caseId]
    writeJSON(STORAGE_KEY, all)
  }
}

/** Remove all saved graph layouts (used by "Clear local data"). */
export function clearAllGraphLayouts(): void {
  removeKey(STORAGE_KEY)
}
