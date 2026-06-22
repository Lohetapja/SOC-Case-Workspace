import type { SocCase } from '../types'

export type QualityCheckStatus = 'pass' | 'warning' | 'missing'

export type QualityCheckGroup =
  | 'context'
  | 'evidence'
  | 'reasoning'
  | 'mitre'
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
        : 'Add at least one affected entity so the case graph and report have a clear subject.',
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
        : 'Collect at least one factual artifact before drawing conclusions.',
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
        : 'Add key alert, attacker, analyst, and response events to reconstruct what happened.',
  })

  const openQuestions = socCase.analystQuestions.filter((question) => question.status === 'open')
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
        ? 'Resolve each question or explicitly mark it not applicable before closure.'
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
  const unsupportedFindings = confirmedFindings.filter(
    (finding) => !finding.relatedEvidenceIds?.length,
  )
  add({
    id: 'finding-support',
    group: 'reasoning',
    status:
      socCase.findings.length === 0
        ? 'missing'
        : confirmedFindings.length === 0 || unsupportedFindings.length > 0
          ? 'warning'
          : 'pass',
    title:
      socCase.findings.length === 0
        ? 'Finding support cannot be assessed'
        : confirmedFindings.length === 0
          ? 'No findings are explicitly confirmed'
          : unsupportedFindings.length > 0
            ? `${unsupportedFindings.length} confirmed ${unsupportedFindings.length === 1 ? 'finding has' : 'findings have'} no linked evidence`
            : 'Confirmed findings are evidence-backed',
    guidance:
      socCase.findings.length === 0
        ? 'Add findings before evaluating their supporting evidence.'
        : confirmedFindings.length === 0
          ? 'Confirm or reject draft findings so the report distinguishes conclusions from hypotheses.'
          : unsupportedFindings.length > 0
            ? 'Link supporting evidence to every confirmed finding where possible.'
            : 'Each confirmed conclusion links back to supporting evidence.',
    detail:
      unsupportedFindings.length > 0
        ? unsupportedFindings.map((finding) => finding.title).join(' • ')
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
    (mapping) => !mapping.confidence || (mapping.rationale?.trim().length ?? 0) < 20,
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
        ? 'Explain the observed behavior behind each technique and record analyst confidence.'
        : 'Mappings are documented as analyst judgments rather than automatic detections.',
    detail:
      weakMappings.length > 0
        ? weakMappings.map((mapping) => `${mapping.techniqueId} ${mapping.techniqueName}`).join(' • ')
        : undefined,
  })

  const closure = socCase.closure
  const closureComplete = Boolean(closure?.verdict && closure.closureStatus && closure.rationale?.trim())
  add({
    id: 'closure',
    group: 'closure',
    status: !closure?.verdict ? 'missing' : closureComplete ? 'pass' : 'warning',
    title: !closure?.verdict
      ? 'Closure classification is missing'
      : closureComplete
        ? 'Classification and closure reasoning are recorded'
        : 'Closure assessment is incomplete',
    guidance: !closure?.verdict
      ? 'Record a classification before treating the investigation as closure-ready.'
      : closureComplete
        ? 'The classification, workflow status, and rationale are documented.'
        : 'Add closure status and rationale so the classification is defensible.',
  })

  const hasNextAction = Boolean(closure?.recommendedAction?.trim() || socCase.recommendations.length)
  add({
    id: 'next-action',
    group: 'closure',
    status: hasNextAction ? 'pass' : 'warning',
    title: hasNextAction ? 'A recommended next action is recorded' : 'No recommended next action recorded',
    guidance: hasNextAction
      ? 'The report can explain what should happen after the investigation.'
      : 'Add a closure next action or at least one recommendation for the response owner.',
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

  return { checks, counts, ready: counts.warning === 0 && counts.missing === 0 }
}
