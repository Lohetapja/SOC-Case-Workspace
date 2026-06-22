import type { SocCase } from '../types'

function withoutId(ids: string[] | undefined, removedId: string): string[] | undefined {
  const remaining = ids?.filter((id) => id !== removedId)
  return remaining?.length ? remaining : undefined
}

/** Delete evidence and atomically remove every supported reference to it. */
export function removeEvidenceRecord(socCase: SocCase, evidenceId: string): SocCase {
  return {
    ...socCase,
    evidence: socCase.evidence.filter((item) => item.id !== evidenceId),
    timeline: socCase.timeline.map((event) => ({
      ...event,
      relatedEvidenceIds: withoutId(event.relatedEvidenceIds, evidenceId),
    })),
    findings: socCase.findings.map((finding) => ({
      ...finding,
      relatedEvidenceIds: withoutId(finding.relatedEvidenceIds, evidenceId),
    })),
    mitreMappings: socCase.mitreMappings.map((mapping) => ({
      ...mapping,
      relatedEvidenceIds: withoutId(mapping.relatedEvidenceIds, evidenceId),
    })),
    agentContributions: socCase.agentContributions?.map((contribution) => ({
      ...contribution,
      relatedEvidenceIds: withoutId(contribution.relatedEvidenceIds, evidenceId),
    })),
  }
}

/** Delete a timeline event and remove references from analytical findings. */
export function removeTimelineRecord(socCase: SocCase, eventId: string): SocCase {
  return {
    ...socCase,
    timeline: socCase.timeline.filter((event) => event.id !== eventId),
    findings: socCase.findings.map((finding) => ({
      ...finding,
      relatedTimelineEventIds: withoutId(finding.relatedTimelineEventIds, eventId),
    })),
  }
}

/** Delete a finding and remove it from ATT&CK supporting references. */
export function removeFindingRecord(socCase: SocCase, findingId: string): SocCase {
  return {
    ...socCase,
    findings: socCase.findings.filter((finding) => finding.id !== findingId),
    mitreMappings: socCase.mitreMappings.map((mapping) => ({
      ...mapping,
      relatedFindingIds: withoutId(mapping.relatedFindingIds, findingId),
    })),
  }
}
