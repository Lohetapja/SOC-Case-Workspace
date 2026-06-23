import { describe, expect, it } from 'vitest'
import type { AllCaseLayouts } from '../utils/graphLayout'
import { demoCases } from './demoCases'
import { sampleLibrary } from './sampleLibrary'
import {
  CASES_SCHEMA_VERSION,
  buildCasesExport,
  parseCasesImport,
} from './casesStore'
import {
  WORKSPACE_SNAPSHOT_SCHEMA_VERSION,
  buildWorkspaceSnapshot,
  parseWorkspaceImport,
  workspaceSnapshotFilename,
} from './workspaceSnapshot'

describe('case import, export, and bundled samples', () => {
  it('builds a versioned export that can be parsed again', () => {
    const exported = buildCasesExport(demoCases)

    expect(exported.schemaVersion).toBe(CASES_SCHEMA_VERSION)
    expect(exported.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(parseCasesImport(exported)).toEqual(demoCases)
  })

  it('rejects invalid import data', () => {
    expect(() => parseCasesImport({ cases: [{ id: 'broken', title: 'Missing arrays' }] })).toThrow(
      /missing required fields/i,
    )
    expect(() => parseCasesImport({ unexpected: true })).toThrow(/expected a JSON array/i)
  })

  it('builds and parses a replayable workspace snapshot', () => {
    const graphLayouts: AllCaseLayouts = {
      [demoCases[0].id]: {
        'case:demo-node': { x: 12, y: -8 },
      },
    }
    const snapshot = buildWorkspaceSnapshot(demoCases, graphLayouts)
    const parsed = parseWorkspaceImport(snapshot)

    expect(snapshot.schemaVersion).toBe(WORKSPACE_SNAPSHOT_SCHEMA_VERSION)
    expect(snapshot.format).toBe('soc-case-workspace-snapshot')
    expect(snapshot.exportType).toBe('whole-workspace')
    expect(snapshot.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
    expect(parsed).toEqual({ kind: 'snapshot', snapshot })
  })

  it('builds selected-case snapshots with only that case and layout', () => {
    const graphLayouts: AllCaseLayouts = {
      [demoCases[0].id]: {
        'case:demo-node': { x: 12, y: -8 },
      },
      [demoCases[1].id]: {
        'case:other-node': { x: 1, y: 2 },
      },
    }
    const snapshot = buildWorkspaceSnapshot(demoCases, graphLayouts, {
      exportType: 'selected-case',
      selectedCaseIds: [demoCases[0].id],
    })

    expect(snapshot.exportType).toBe('selected-case')
    expect(snapshot.cases.map((socCase) => socCase.id)).toEqual([demoCases[0].id])
    expect(snapshot.selectedCaseIds).toEqual([demoCases[0].id])
    expect(Object.keys(snapshot.graphLayouts)).toEqual([demoCases[0].id])
    expect(workspaceSnapshotFilename(snapshot)).toMatch(
      /^soc-case-workspace-case-suspicious-powershell-launched-from-outlook-\d{4}-\d{2}-\d{2}\.json$/,
    )
  })

  it('can exclude bundled sample cases from a full export', () => {
    const customCase = { ...demoCases[0], id: 'case-custom-review', title: 'Custom Review Case' }
    const snapshot = buildWorkspaceSnapshot([demoCases[0], customCase], {}, {
      includeDemoCases: false,
    })

    expect(snapshot.exportType).toBe('whole-workspace')
    expect(snapshot.cases.map((socCase) => socCase.id)).toEqual(['case-custom-review'])
  })

  it('keeps old case-only imports working through the workspace import path', () => {
    const parsed = parseWorkspaceImport(buildCasesExport(demoCases))

    expect(parsed).toEqual({ kind: 'cases', cases: demoCases })
  })

  it('rejects invalid workspace graph layout data', () => {
    expect(() =>
      parseWorkspaceImport({
        exportType: 'soc-case-workspace-snapshot',
        schemaVersion: 1,
        exportedAt: '2026-06-23T00:00:00.000Z',
        cases: demoCases,
        graphLayouts: { [demoCases[0].id]: { node: { x: 'bad', y: 1 } } },
        appSettings: {},
      }),
    ).toThrow(/invalid graph layout/i)
  })

  it('keeps every sample-library entry backed by a unique synthetic demo case', () => {
    const demoIds = new Set(demoCases.map((socCase) => socCase.id))
    const sampleIds = sampleLibrary.map((entry) => entry.caseId)

    expect(demoIds.size).toBe(demoCases.length)
    expect(new Set(sampleIds).size).toBe(sampleIds.length)
    expect(sampleIds.every((id) => demoIds.has(id))).toBe(true)
    expect(demoCases.every((socCase) =>
      [
        socCase.affectedEntities,
        socCase.evidence,
        socCase.timeline,
        socCase.analystQuestions,
        socCase.findings,
        socCase.mitreMappings,
        socCase.recommendations,
      ].every(Array.isArray),
    )).toBe(true)
  })
})
