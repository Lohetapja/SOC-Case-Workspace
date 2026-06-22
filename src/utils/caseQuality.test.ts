import { describe, expect, it } from 'vitest'
import type { SocCase } from '../types'
import { demoCases } from '../data/demoCases'
import { reviewCaseQuality } from './caseQuality'

const blankCase: SocCase = {
  id: 'case-test-blank',
  title: 'Blank synthetic case',
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

describe('reviewCaseQuality', () => {
  it('flags important gaps in a weak blank case', () => {
    const review = reviewCaseQuality(blankCase)
    const checks = new Map(review.checks.map((check) => [check.id, check.status]))

    expect(checks.get('useful-summary')).toBe('missing')
    expect(checks.get('affected-entities')).toBe('missing')
    expect(checks.get('evidence')).toBe('missing')
    expect(checks.get('timeline')).toBe('missing')
    expect(checks.get('findings')).toBe('missing')
    expect(checks.get('closure-classification')).toBe('missing')
    expect(review.ready).toBe(false)
  })

  it('passes core integrity and reporting checks for a populated sample', () => {
    const review = reviewCaseQuality(demoCases[2])
    const checks = new Map(review.checks.map((check) => [check.id, check.status]))

    for (const id of [
      'useful-summary',
      'affected-entities',
      'evidence',
      'timeline',
      'finding-reference-integrity',
      'finding-quality',
      'mitre-quality',
      'mitre-reference-integrity',
      'closure-classification',
      'next-action',
      'report-export',
    ]) {
      expect(checks.get(id), id).toBe('pass')
    }
  })
})
