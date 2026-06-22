import { describe, expect, it } from 'vitest'
import { demoCases } from '../data/demoCases'
import { buildCaseReport } from './caseReport'

describe('buildCaseReport', () => {
  it('renders the complete evidence-backed investigation structure', () => {
    const sample = demoCases[2]
    const report = buildCaseReport(sample)

    for (const heading of [
      '## Executive summary',
      '## Assessment and disposition',
      '## Evidence reviewed',
      '## Timeline of activity',
      '## Analyst reasoning and decision journal',
      '## Findings',
      '## MITRE ATT&CK assessment',
      '## Closure assessment',
      '## Investigation limitations and open questions',
      '## Educational use and synthetic-data disclaimer',
    ]) {
      expect(report).toContain(heading)
    }
    expect(report).toContain(sample.evidence[0].title)
    expect(report).toContain(sample.timeline[0].title)
    expect(report).toContain(sample.findings[0].title)
    expect(report).toContain(sample.mitreMappings[0].techniqueId)
    expect(report).toContain('All data is synthetic')
    expect(report).not.toContain('common follow-ups for this case type')
  })
})
