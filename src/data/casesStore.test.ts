import { describe, expect, it } from 'vitest'
import { demoCases } from './demoCases'
import { sampleLibrary } from './sampleLibrary'
import {
  CASES_SCHEMA_VERSION,
  buildCasesExport,
  parseCasesImport,
} from './casesStore'

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
