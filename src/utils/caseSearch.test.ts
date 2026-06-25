import { describe, expect, it } from 'vitest'
import type { SocCase } from '../types'
import { demoCases } from '../data/demoCases'
import { MIN_QUERY_LENGTH, searchCases } from './caseSearch'

const sample = demoCases[0]

describe('searchCases', () => {
  it('ignores empty and too-short queries', () => {
    expect(searchCases(demoCases, '')).toEqual([])
    expect(searchCases(demoCases, '   ')).toEqual([])
    expect(searchCases(demoCases, 'a'.repeat(MIN_QUERY_LENGTH - 1))).toEqual([])
  })

  it('is case-insensitive and finds the matching case by title', () => {
    const upper = searchCases(demoCases, sample.title.toUpperCase())
    const lower = searchCases(demoCases, sample.title.toLowerCase())
    expect(lower.length).toEqual(upper.length)
    expect(upper.some((r) => r.type === 'case' && r.caseId === sample.id)).toBe(true)
  })

  it('finds an evidence value and reports its case + section', () => {
    const evidence = sample.evidence[0]
    const term = evidence.title.split(' ')[0]
    const results = searchCases(demoCases, term)
    const hit = results.find((r) => r.caseId === sample.id && r.type === 'evidence')
    expect(hit).toBeTruthy()
    expect(hit?.caseTitle).toBe(sample.title)
    expect(hit?.snippet.toLowerCase()).toContain(term.toLowerCase())
  })

  it('matches a MITRE technique id when present', () => {
    const withMitre = demoCases.find((c) => c.mitreMappings.length > 0)
    expect(withMitre).toBeTruthy()
    const techniqueId = withMitre!.mitreMappings[0].techniqueId
    const results = searchCases(demoCases, techniqueId)
    expect(results.some((r) => r.type === 'mitre' && r.caseId === withMitre!.id)).toBe(true)
  })

  it('returns no results for text that does not exist', () => {
    const results = searchCases(demoCases, 'zzzznotpresentquery')
    expect(results).toEqual([])
  })

  it('does not crash on a minimal case with no optional sections', () => {
    const blank: SocCase = {
      id: 'case-blank',
      title: 'Nothing here',
      summary: '',
      source: 'other',
      severity: 'low',
      status: 'new',
      owner: 'unassigned',
      affectedEntities: [],
      evidence: [],
      timeline: [],
      analystQuestions: [],
      findings: [],
      mitreMappings: [],
      recommendations: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    }
    const results = searchCases([blank], 'nothing')
    expect(results).toHaveLength(1)
    expect(results[0].type).toBe('case')
  })
})
