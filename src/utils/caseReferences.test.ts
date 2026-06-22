import { describe, expect, it } from 'vitest'
import { demoCases } from '../data/demoCases'
import {
  removeEvidenceRecord,
  removeFindingRecord,
  removeTimelineRecord,
} from './caseReferences'

describe('case reference cleanup', () => {
  it('removes deleted evidence from every supported dependent record', () => {
    const source = structuredClone(demoCases[2])
    const evidenceId = source.evidence[0].id
    source.timeline[0].relatedEvidenceIds = [evidenceId]
    source.findings[0].relatedEvidenceIds = [evidenceId]
    source.mitreMappings[0].relatedEvidenceIds = [evidenceId]
    source.agentContributions = [{
      id: 'agent-test',
      agentName: 'Synthetic helper',
      type: 'summary',
      output: 'Synthetic suggestion only.',
      status: 'reviewed',
      relatedEvidenceIds: [evidenceId],
      createdAt: '2026-01-01T00:00:00Z',
    }]

    const cleaned = removeEvidenceRecord(source, evidenceId)

    expect(cleaned.evidence.some((item) => item.id === evidenceId)).toBe(false)
    expect(cleaned.timeline[0].relatedEvidenceIds).toBeUndefined()
    expect(cleaned.findings[0].relatedEvidenceIds).toBeUndefined()
    expect(cleaned.mitreMappings[0].relatedEvidenceIds).toBeUndefined()
    expect(cleaned.agentContributions?.[0].relatedEvidenceIds).toBeUndefined()
    expect(source.evidence.some((item) => item.id === evidenceId)).toBe(true)
  })

  it('removes deleted timeline and finding references', () => {
    const source = structuredClone(demoCases[2])
    const eventId = source.timeline[0].id
    const findingId = source.findings[0].id
    source.findings[0].relatedTimelineEventIds = [eventId]
    source.mitreMappings[0].relatedFindingIds = [findingId]

    const withoutTimeline = removeTimelineRecord(source, eventId)
    const withoutFinding = removeFindingRecord(source, findingId)

    expect(withoutTimeline.timeline.some((event) => event.id === eventId)).toBe(false)
    expect(withoutTimeline.findings[0].relatedTimelineEventIds).toBeUndefined()
    expect(withoutFinding.findings.some((finding) => finding.id === findingId)).toBe(false)
    expect(withoutFinding.mitreMappings[0].relatedFindingIds).toBeUndefined()
  })
})
