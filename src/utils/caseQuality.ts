import type { SocCase } from '../types'

export type QualityCheckStatus = 'pass' | 'warning' | 'missing'

export type QualityCheckGroup =
  | 'context'
  | 'evidence'
  | 'reasoning'
  | 'mitre'
  | 'agents'
  | 'closure'

export interface CaseQualityCheck {
  id: string
  group: QualityCheckGroup
  status: QualityCheckStatus
  title: string
  guidance: string
  detail?: string
}

export interface CaseQualityReview {
  checks: CaseQualityCheck[]
  counts: Record<QualityCheckStatus, number>
  completion: {
    complete: number
    total: number
    label: 'Complete' | 'Needs attention' | 'Missing'
  }
  coachSuggestions: string[]
  seniorReview: {
    unsupportedFindings: string[]
    openQuestions: string[]
    missingEvidence: boolean
    missingClosureRationale: boolean
    missingMitreRationale: string[]
    missingRecommendations: boolean
    reportReady: boolean
  }
  ready: boolean
}

const ATTACKER_BEHAVIOR =
  /attack|beacon|brute|credential|execution|malware|payload|persistence|phish|powershell/i

/**
 * Advisory readiness review based only on canonical, analyst-reviewed case data.
 * Future imported/tool suggestions should not affect quality until the analyst
 * accepts them into the case and links them to evidence where appropriate.
 */
export function reviewCaseQuality(socCase: SocCase): CaseQualityReview {
  const checks: CaseQualityCheck[] = []
  const add = (check: CaseQualityCheck) => checks.push(check)
  const evidenceIds = new Set(socCase.evidence.map((item) => item.id))
  const findingIds = new Set(socCase.findings.map((finding) => finding.id))

  const summaryLength = (socCase.summary ?? '').trim().length
  add({
    id: 'useful-summary',
    group: 'context',
    status: summaryLength === 0 ? 'missing' : summaryLength < 40 ? 'warning' : 'pass',
    title:
      summaryLength === 0
        ? 'Case summary is missing'
        : summaryLength < 40
          ? 'Case summary is very brief'
          : 'Case has a useful summary',
    guidance:
      summaryLength < 40
        ? 'Summarize the alert, affected subject, observed behavior, and why it matters.'
        : 'The summary gives report readers enough context to understand the investigation.',
  })

  add({
    id: 'affected-entities',
    group: 'context',
    status: socCase.affectedEntities.length > 0 ? 'pass' : 'missing',
    title:
      socCase.affectedEntities.length > 0
        ? `${socCase.affectedEntities.length} affected ${socCase.affectedEntities.length === 1 ? 'entity' : 'entities'} recorded`
        : 'No affected entities recorded',
    guidance:
      socCase.affectedEntities.length > 0
        ? 'The case has clear subjects for the investigation, graph, and report.'
        : 'Add at least one affected entity so the case has a clear subject.',
  })

  const missingContext = [
    !socCase.source && 'source',
    !socCase.severity && 'severity',
    (!socCase.owner?.trim() || socCase.owner === 'unassigned') && 'owner',
    !socCase.status && 'status',
  ].filter((value): value is string => Boolean(value))
  add({
    id: 'case-metadata',
    group: 'context',
    status: missingContext.length > 0 ? 'warning' : 'pass',
    title:
      missingContext.length > 0
        ? `Case context needs ${missingContext.join(', ')}`
        : 'Source, severity, owner, and status are recorded',
    guidance:
      missingContext.length > 0
        ? 'Complete the intake metadata so ownership, urgency, and workflow state are clear.'
        : 'The case has enough intake metadata for triage ownership and prioritization.',
  })

  add({
    id: 'evidence',
    group: 'evidence',
    status: socCase.evidence.length > 0 ? 'pass' : 'missing',
    title:
      socCase.evidence.length > 0
        ? `${socCase.evidence.length} evidence ${socCase.evidence.length === 1 ? 'item' : 'items'} recorded`
        : 'No evidence recorded',
    guidance:
      socCase.evidence.length > 0
        ? 'Evidence is available to support or refute the investigation.'
        : 'Collect at least one factual artifact so findings can be traced back to evidence.',
  })

  add({
    id: 'timeline',
    group: 'evidence',
    status: socCase.timeline.length > 0 ? 'pass' : 'missing',
    title:
      socCase.timeline.length > 0
        ? `${socCase.timeline.length} timeline ${socCase.timeline.length === 1 ? 'event' : 'events'} recorded`
        : 'No timeline events recorded',
    guidance:
      socCase.timeline.length > 0
        ? 'The sequence of activity can be reviewed chronologically.'
        : 'Add the alert, observed activity, and response timestamps to reconstruct what happened.',
  })

  const timelineWithMissingEvidence = socCase.timeline.filter((event) =>
    (event.relatedEvidenceIds ?? []).some((id) => !evidenceIds.has(id)),
  )
  add({
    id: 'timeline-reference-integrity',
    group: 'evidence',
    status: timelineWithMissingEvidence.length > 0 ? 'warning' : 'pass',
    title:
      timelineWithMissingEvidence.length > 0
        ? `${timelineWithMissingEvidence.length} timeline ${timelineWithMissingEvidence.length === 1 ? 'event references' : 'events reference'} missing evidence`
        : 'Timeline evidence references are valid',
    guidance:
      timelineWithMissingEvidence.length > 0
        ? 'Remove stale links or reconnect these events to evidence that still exists.'
        : 'Every evidence link used by the timeline resolves to a current case artifact.',
    detail:
      timelineWithMissingEvidence.length > 0
        ? timelineWithMissingEvidence.map((event) => event.title).join(' • ')
        : undefined,
  })

  const findingsWithMissingEvidence = socCase.findings.filter((finding) =>
    (finding.relatedEvidenceIds ?? []).some((id) => !evidenceIds.has(id)),
  )
  add({
    id: 'finding-reference-integrity',
    group: 'evidence',
    status: findingsWithMissingEvidence.length > 0 ? 'warning' : 'pass',
    title:
      findingsWithMissingEvidence.length > 0
        ? `${findingsWithMissingEvidence.length} ${findingsWithMissingEvidence.length === 1 ? 'finding references' : 'findings reference'} deleted evidence`
        : 'Finding evidence references are valid',
    guidance:
      findingsWithMissingEvidence.length > 0
        ? 'Repair or remove stale evidence links before relying on these findings.'
        : 'Every evidence link used by a finding resolves to a current case artifact.',
    detail:
      findingsWithMissingEvidence.length > 0
        ? findingsWithMissingEvidence.map((finding) => finding.title).join(' • ')
        : undefined,
  })

  const openQuestions = socCase.analystQuestions.filter((question) => question.status === 'open')
  add({
    id: 'decision-journal',
    group: 'reasoning',
    status: socCase.analystQuestions.length > 0 ? 'pass' : 'missing',
    title:
      socCase.analystQuestions.length > 0
        ? `${socCase.analystQuestions.length} decision journal ${socCase.analystQuestions.length === 1 ? 'entry' : 'entries'} recorded`
        : 'No decision journal entries recorded',
    guidance:
      socCase.analystQuestions.length > 0
        ? 'Analyst reasoning is captured alongside the evidence.'
        : 'Record at least one question, decision, or uncertainty so the reasoning trail is visible.',
  })
  add({
    id: 'open-questions',
    group: 'reasoning',
    status: openQuestions.length > 0 ? 'warning' : 'pass',
    title:
      openQuestions.length > 0
        ? `${openQuestions.length} analyst ${openQuestions.length === 1 ? 'question remains' : 'questions remain'} open`
        : 'No unresolved analyst questions',
    guidance:
      openQuestions.length > 0
        ? 'There are still open analyst questions before closure. Answer them or mark them not applicable.'
        : 'The decision journal has no unresolved questions blocking closure review.',
    detail: openQuestions.length > 0 ? openQuestions.map((question) => question.question).join(' • ') : undefined,
  })

  add({
    id: 'findings',
    group: 'reasoning',
    status: socCase.findings.length > 0 ? 'pass' : 'missing',
    title:
      socCase.findings.length > 0
        ? `${socCase.findings.length} analytical ${socCase.findings.length === 1 ? 'finding' : 'findings'} recorded`
        : 'No analytical findings recorded',
    guidance:
      socCase.findings.length > 0
        ? 'The case contains explicit conclusions rather than evidence alone.'
        : 'Turn the evidence into at least one defensible conclusion.',
  })

  const confirmedFindings = socCase.findings.filter((finding) => finding.status === 'confirmed')
  const unsupportedFindings = socCase.findings.filter(
    (finding) => finding.status !== 'rejected' && !finding.relatedEvidenceIds?.length,
  )
  const unsupportedConfirmedFindings = confirmedFindings.filter(
    (finding) => !finding.relatedEvidenceIds?.length,
  )
  const findingSupportTitle =
    socCase.findings.length === 0
      ? 'Finding support cannot be assessed'
      : confirmedFindings.length === 0
        ? 'No findings are explicitly confirmed'
        : unsupportedConfirmedFindings.length > 0
          ? `${unsupportedConfirmedFindings.length} confirmed ${unsupportedConfirmedFindings.length === 1 ? 'finding has' : 'findings have'} no linked evidence`
          : unsupportedFindings.length > 0
            ? `${unsupportedFindings.length} ${unsupportedFindings.length === 1 ? 'finding has' : 'findings have'} no linked evidence`
            : 'Confirmed findings are evidence-backed'
  const findingSupportGuidance =
    socCase.findings.length === 0
      ? 'Add findings before evaluating their supporting evidence.'
      : confirmedFindings.length === 0
        ? 'Confirm or reject draft findings so the report distinguishes conclusions from hypotheses.'
        : unsupportedFindings.length > 0
          ? unsupportedFindings.length === 1
            ? 'This finding has no supporting evidence linked. Connect the artifact that supports the conclusion.'
            : 'These findings have no supporting evidence linked. Connect the artifacts that support each conclusion.'
          : 'Each confirmed conclusion links back to supporting evidence.'
  add({
    id: 'finding-support',
    group: 'reasoning',
    status:
      socCase.findings.length === 0
        ? 'missing'
        : unsupportedFindings.length > 0 || confirmedFindings.length === 0
          ? 'warning'
          : 'pass',
    title: findingSupportTitle,
    guidance: findingSupportGuidance,
    detail:
      unsupportedFindings.length > 0
        ? unsupportedFindings.map((finding) => finding.title).join(' • ')
        : undefined,
  })

  const weakFindings = socCase.findings.filter(
    (finding) => !finding.confidence || (finding.description?.trim().length ?? 0) < 20,
  )
  add({
    id: 'finding-quality',
    group: 'reasoning',
    status:
      socCase.findings.length === 0
        ? 'missing'
        : weakFindings.length > 0
          ? 'warning'
          : 'pass',
    title:
      socCase.findings.length === 0
        ? 'Finding quality cannot be assessed'
        : weakFindings.length > 0
          ? `${weakFindings.length} ${weakFindings.length === 1 ? 'finding needs' : 'findings need'} clearer reasoning`
          : 'Findings include confidence and clear rationale',
    guidance:
      socCase.findings.length === 0
        ? 'Add findings before evaluating their reasoning quality.'
        : weakFindings.length > 0
          ? 'Explain what the evidence means and record analyst confidence for each finding.'
          : 'The findings communicate both the conclusion and the analyst’s confidence.',
    detail:
      weakFindings.length > 0
        ? weakFindings.map((finding) => finding.title).join(' • ')
        : undefined,
  })

  const attackerBehavior = socCase.findings.some((finding) => {
    if (finding.status === 'rejected') return false
    return (
      finding.category === 'malicious_activity' ||
      finding.category === 'suspicious_activity' ||
      ATTACKER_BEHAVIOR.test(`${finding.title} ${finding.description}`)
    )
  })
  add({
    id: 'mitre-coverage',
    group: 'mitre',
    status: attackerBehavior && socCase.mitreMappings.length === 0 ? 'missing' : 'pass',
    title:
      socCase.mitreMappings.length > 0
        ? `${socCase.mitreMappings.length} ATT&CK ${socCase.mitreMappings.length === 1 ? 'mapping' : 'mappings'} recorded`
        : attackerBehavior
          ? 'Attacker behavior has no ATT&CK mapping'
          : 'No ATT&CK mapping is currently required',
    guidance:
      socCase.mitreMappings.length > 0
        ? 'Observed behavior is mapped to analyst-selected ATT&CK techniques.'
        : attackerBehavior
          ? 'Map the relevant behavior to ATT&CK and explain why the technique applies.'
          : 'Add a mapping if later findings establish attacker behavior.',
  })

  const weakMappings = socCase.mitreMappings.filter(
    (mapping) =>
      !/^T\d{4}(?:\.\d{3})?$/.test(mapping.techniqueId?.trim() ?? '') ||
      !mapping.confidence ||
      (mapping.rationale?.trim().length ?? 0) < 20,
  )
  add({
    id: 'mitre-quality',
    group: 'mitre',
    status:
      socCase.mitreMappings.length === 0
        ? attackerBehavior
          ? 'missing'
          : 'pass'
        : weakMappings.length > 0
          ? 'warning'
          : 'pass',
    title:
      socCase.mitreMappings.length === 0
        ? attackerBehavior
          ? 'ATT&CK mapping quality cannot be assessed'
          : 'No ATT&CK mappings to review'
        : weakMappings.length > 0
          ? `${weakMappings.length} ATT&CK ${weakMappings.length === 1 ? 'mapping needs' : 'mappings need'} stronger rationale`
          : 'ATT&CK mappings include rationale and confidence',
    guidance:
      weakMappings.length > 0
        ? 'MITRE mappings should include a valid technique ID, rationale, and analyst confidence.'
        : 'Mappings are documented as analyst judgments rather than automatic detections.',
    detail:
      weakMappings.length > 0
        ? weakMappings.map((mapping) => `${mapping.techniqueId} ${mapping.techniqueName}`).join(' • ')
        : undefined,
  })

  const mappingsWithoutRationale = socCase.mitreMappings.filter(
    (mapping) => !mapping.rationale?.trim(),
  )
  add({
    id: 'mitre-rationale',
    group: 'mitre',
    status:
      socCase.mitreMappings.length === 0
        ? attackerBehavior
          ? 'missing'
          : 'pass'
        : mappingsWithoutRationale.length > 0
          ? 'warning'
          : 'pass',
    title:
      socCase.mitreMappings.length === 0
        ? attackerBehavior
          ? 'No ATT&CK rationale available'
          : 'No ATT&CK rationale needed yet'
        : mappingsWithoutRationale.length > 0
          ? `${mappingsWithoutRationale.length} ATT&CK ${mappingsWithoutRationale.length === 1 ? 'mapping has' : 'mappings have'} no rationale`
          : 'ATT&CK mappings have written rationale',
    guidance:
      mappingsWithoutRationale.length > 0
        ? 'MITRE mappings should include rationale. Explain the observed behavior that supports the technique.'
        : 'Each current mapping explains why the technique applies.',
    detail:
      mappingsWithoutRationale.length > 0
        ? mappingsWithoutRationale
            .map((mapping) => `${mapping.techniqueId} ${mapping.techniqueName}`)
            .join(' • ')
        : undefined,
  })

  const mappingsWithMissingReferences = socCase.mitreMappings.filter(
    (mapping) =>
      (mapping.relatedEvidenceIds ?? []).some((id) => !evidenceIds.has(id)) ||
      (mapping.relatedFindingIds ?? []).some((id) => !findingIds.has(id)),
  )
  add({
    id: 'mitre-reference-integrity',
    group: 'mitre',
    status: mappingsWithMissingReferences.length > 0 ? 'warning' : 'pass',
    title:
      mappingsWithMissingReferences.length > 0
        ? `${mappingsWithMissingReferences.length} ATT&CK ${mappingsWithMissingReferences.length === 1 ? 'mapping has' : 'mappings have'} stale references`
        : 'ATT&CK supporting references are valid',
    guidance:
      mappingsWithMissingReferences.length > 0
        ? 'Reconnect these mappings to current findings/evidence or remove the stale links.'
        : 'Every linked finding and evidence item used by a mapping still exists.',
    detail:
      mappingsWithMissingReferences.length > 0
        ? mappingsWithMissingReferences
            .map((mapping) => `${mapping.techniqueId} ${mapping.techniqueName}`)
            .join(' • ')
        : undefined,
  })

  const contributions = socCase.agentContributions ?? []
  const unreviewedContributions = contributions.filter(
    (contribution) => contribution.status === 'unreviewed',
  )
  add({
    id: 'agent-review-status',
    group: 'agents',
    status: unreviewedContributions.length > 0 ? 'warning' : 'pass',
    title:
      unreviewedContributions.length > 0
        ? `${unreviewedContributions.length} agent ${unreviewedContributions.length === 1 ? 'contribution is' : 'contributions are'} unreviewed`
        : 'No unreviewed agent contributions',
    guidance:
      unreviewedContributions.length > 0
        ? 'Review, accept, or reject each external suggestion before closure.'
        : 'Every attached external contribution has an explicit human review status.',
    detail:
      unreviewedContributions.length > 0
        ? unreviewedContributions.map((contribution) => contribution.agentName).join(' • ')
        : undefined,
  })

  const acceptedWithoutEvidence = contributions.filter(
    (contribution) =>
      contribution.status === 'accepted' &&
      (!contribution.relatedEvidenceIds?.length ||
        contribution.relatedEvidenceIds.some((id) => !evidenceIds.has(id))),
  )
  add({
    id: 'agent-evidence-links',
    group: 'agents',
    status: acceptedWithoutEvidence.length > 0 ? 'warning' : 'pass',
    title:
      acceptedWithoutEvidence.length > 0
        ? `${acceptedWithoutEvidence.length} accepted agent ${acceptedWithoutEvidence.length === 1 ? 'contribution needs' : 'contributions need'} evidence review`
        : 'Accepted agent contributions are evidence-linked where applicable',
    guidance:
      acceptedWithoutEvidence.length > 0
        ? 'Link accepted suggestions to current evidence where possible before using them in analyst conclusions.'
        : 'Accepted suggestions have supporting evidence links, or no accepted suggestions are present.',
    detail:
      acceptedWithoutEvidence.length > 0
        ? acceptedWithoutEvidence.map((contribution) => contribution.agentName).join(' • ')
        : undefined,
  })

  add({
    id: 'agent-evidence-boundary',
    group: 'agents',
    status: 'pass',
    title: 'Agent contributions remain separate from case evidence',
    guidance:
      'Agent output is not evidence until reviewed and linked. Rejected contributions do not support findings, mappings, closure, or reports.',
  })

  const closure = socCase.closure
  add({
    id: 'closure-classification',
    group: 'closure',
    status: !closure?.verdict ? 'missing' : closure.closureStatus ? 'pass' : 'warning',
    title: !closure?.verdict
      ? 'Closure classification is missing'
      : closure.closureStatus
        ? 'Classification and closure status are recorded'
        : 'Classification has no closure status',
    guidance: !closure?.verdict
      ? 'Classify the outcome so reviewers can distinguish malicious, benign, false-positive, and unresolved activity.'
      : closure.closureStatus
        ? 'The case has an explicit analyst classification and response lifecycle state.'
        : 'Add a closure status such as monitoring, escalated, or closed.',
  })

  add({
    id: 'closure-rationale',
    group: 'closure',
    status: closure?.rationale?.trim() ? 'pass' : 'warning',
    title: closure?.rationale?.trim()
      ? 'Closure rationale is documented'
      : 'Closure rationale is missing',
    guidance: closure?.rationale?.trim()
      ? 'The classification is supported by a written analyst justification.'
      : 'Explain why the evidence supports the selected classification before closure.',
  })

  const isClosed = socCase.status === 'closed' || closure?.closureStatus === 'closed'
  add({
    id: 'closed-open-questions',
    group: 'closure',
    status: isClosed && openQuestions.length > 0 ? 'warning' : 'pass',
    title:
      isClosed && openQuestions.length > 0
        ? 'Case is closed with unresolved analyst questions'
        : 'Open-question state is acceptable for closure review',
    guidance:
      isClosed && openQuestions.length > 0
        ? 'This case is marked closed but still has open analyst questions. Resolve or mark them not applicable.'
        : 'If this case is closed later, make sure any open questions are answered or explicitly accepted as limitations.',
  })

  const hasNextAction = Boolean(closure?.recommendedAction?.trim() || socCase.recommendations.length)
  add({
    id: 'next-action',
    group: 'closure',
    status: hasNextAction ? 'pass' : 'warning',
    title: hasNextAction ? 'A recommended next action is recorded' : 'No recommended next action recorded',
    guidance: hasNextAction
      ? 'The report can explain what should happen after the investigation.'
      : 'Add a concrete containment, monitoring, escalation, or prevention action for the response owner.',
  })

  add({
    id: 'recommendations',
    group: 'closure',
    status: socCase.recommendations.length > 0 ? 'pass' : 'warning',
    title:
      socCase.recommendations.length > 0
        ? `${socCase.recommendations.length} response ${socCase.recommendations.length === 1 ? 'recommendation' : 'recommendations'} recorded`
        : 'No recommendations have been added yet',
    guidance:
      socCase.recommendations.length > 0
        ? 'Response owners have concrete follow-up actions to review.'
        : 'No recommendations have been added yet. Add containment, monitoring, escalation, recovery, or prevention guidance.',
  })

  add({
    id: 'report-export',
    group: 'closure',
    status: 'pass',
    title: 'Markdown report export is available',
    guidance: 'Review warnings before relying on the exported report as the final case record.',
  })

  const counts = checks.reduce<Record<QualityCheckStatus, number>>(
    (result, check) => {
      result[check.status] += 1
      return result
    },
    { pass: 0, warning: 0, missing: 0 },
  )

  const total = checks.length
  const complete = counts.pass
  const label =
    counts.missing > 0 ? 'Missing' : counts.warning > 0 ? 'Needs attention' : 'Complete'
  const ready = counts.warning === 0 && counts.missing === 0
  const coachSuggestions = checks
    .filter((check) => check.status !== 'pass')
    .map((check) => check.guidance)
    .slice(0, 6)
  const seniorReview = {
    unsupportedFindings: unsupportedFindings.map((finding) => finding.title),
    openQuestions: openQuestions.map((question) => question.question),
    missingEvidence: socCase.evidence.length === 0,
    missingClosureRationale: !closure?.rationale?.trim(),
    missingMitreRationale: mappingsWithoutRationale.map(
      (mapping) => `${mapping.techniqueId} ${mapping.techniqueName}`,
    ),
    missingRecommendations: socCase.recommendations.length === 0,
    reportReady: ready,
  }

  return {
    checks,
    counts,
    completion: { complete, total, label },
    coachSuggestions,
    seniorReview,
    ready,
  }
}
