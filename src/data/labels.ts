import type {
  CaseSource,
  CaseStatus,
  ChecklistGroup,
  ClassificationVerdict,
  ClosureStatus,
  Confidence,
  EntityType,
  EvidenceType,
  FindingCategory,
  FindingStatus,
  QuestionStatus,
  RecommendationPriority,
  Severity,
  TimelinePhase,
} from '../types'

/**
 * Human-readable labels for the model's enum unions, kept separate from the UI
 * so they can be reused (lists, reports, etc.). Using `Record<Union, string>`
 * makes these exhaustive: adding a new union member fails the build until a
 * label is provided here.
 */

export const severityLabels: Record<Severity, string> = {
  informational: 'Informational',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
}

export const statusLabels: Record<CaseStatus, string> = {
  new: 'New',
  triage: 'Triage',
  investigating: 'Investigating',
  closed: 'Closed',
}

export const sourceLabels: Record<CaseSource, string> = {
  edr: 'EDR',
  siem: 'SIEM',
  email_gateway: 'Email gateway',
  identity_provider: 'Identity provider',
  firewall: 'Firewall',
  cloud: 'Cloud',
  user_report: 'User report',
  threat_intel: 'Threat intel',
  other: 'Other',
}

export const verdictLabels: Record<ClassificationVerdict, string> = {
  true_positive: 'True positive',
  benign_true_positive: 'Benign true positive',
  false_positive: 'False positive',
  suspicious: 'Suspicious',
  undetermined: 'Undetermined',
  inconclusive: 'Inconclusive',
}

export const closureStatusLabels: Record<ClosureStatus, string> = {
  open: 'Open',
  monitoring: 'Monitoring',
  escalated: 'Escalated',
  closed: 'Closed',
}

export const checklistGroupLabels: Record<ChecklistGroup, string> = {
  evidence: 'Evidence to collect',
  timeline: 'Timeline checkpoints',
  findings: 'Findings to validate',
  closure: 'Closure considerations',
}

export const confidenceLabels: Record<Confidence, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const priorityLabels: Record<RecommendationPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export const entityTypeLabels: Record<EntityType, string> = {
  host: 'Host',
  user: 'User',
  mailbox: 'Mailbox',
  cloud_account: 'Cloud account',
  ip_address: 'IP address',
  domain: 'Domain',
  url: 'URL',
  file: 'File',
  file_hash: 'File hash',
  process: 'Process',
}

export const evidenceTypeLabels: Record<EvidenceType, string> = {
  log: 'Log',
  process: 'Process',
  network: 'Network',
  file: 'File',
  email: 'Email',
  authentication: 'Authentication',
  registry: 'Registry',
  command: 'Command',
  screenshot: 'Screenshot',
  note: 'Note',
  other: 'Other',
}

export const timelinePhaseLabels: Record<TimelinePhase, string> = {
  detection: 'Detection',
  attacker_activity: 'Attacker activity',
  analyst_action: 'Analyst action',
  containment: 'Containment',
  other: 'Other',
}

export const questionStatusLabels: Record<QuestionStatus, string> = {
  open: 'Open',
  answered: 'Answered',
  not_applicable: 'Not applicable',
}

export const findingCategoryLabels: Record<FindingCategory, string> = {
  malicious_activity: 'Malicious activity',
  suspicious_activity: 'Suspicious activity',
  misconfiguration: 'Misconfiguration',
  policy_violation: 'Policy violation',
  benign: 'Benign',
  other: 'Other',
}

export const findingStatusLabels: Record<FindingStatus, string> = {
  draft: 'Draft',
  confirmed: 'Confirmed',
  rejected: 'Rejected',
}
