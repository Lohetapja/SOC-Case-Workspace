import { readJSON, writeJSON } from './storage'

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

type AllLayouts = Record<string, CaseLayout>

const STORAGE_KEY = 'soc-case-workspace:graph-layout'

/** Saved positions for one case (empty object if none). */
export function loadCaseLayout(caseId: string): CaseLayout {
  const all = readJSON<AllLayouts>(STORAGE_KEY, {})
  return all[caseId] ?? {}
}

/** Pin one node's position for a case. */
export function saveNodePosition(caseId: string, nodeId: string, position: NodePosition): void {
  const all = readJSON<AllLayouts>(STORAGE_KEY, {})
  const caseLayout = all[caseId] ?? {}
  caseLayout[nodeId] = position
  all[caseId] = caseLayout
  writeJSON(STORAGE_KEY, all)
}

/** Clear all saved positions for one case (used by "Reset layout"). */
export function clearCaseLayout(caseId: string): void {
  const all = readJSON<AllLayouts>(STORAGE_KEY, {})
  if (all[caseId]) {
    delete all[caseId]
    writeJSON(STORAGE_KEY, all)
  }
}
