import type {
  CaseSource,
  CaseStatus,
  ClassificationVerdict,
  Confidence,
  RecommendationPriority,
  Severity,
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
  false_positive: 'False positive',
  benign_true_positive: 'Benign true positive',
  inconclusive: 'Inconclusive',
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
