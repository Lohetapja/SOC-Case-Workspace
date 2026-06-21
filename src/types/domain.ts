/**
 * Core SOC Case Workspace domain model.
 *
 * Design notes:
 * - A `SocCase` is the aggregate root: its child records (entities, evidence,
 *   timeline, questions, findings, MITRE mappings, recommendations) are embedded
 *   arrays, not separate normalized collections. This matches a single-user,
 *   localStorage-backed app where a case is loaded and saved as one JSON object.
 * - Cross-references between child records use string ids (e.g. a timeline event
 *   points at the evidence that supports it via `relatedEvidenceIds`). Ids are
 *   plain strings so they stay human-readable in synthetic data.
 * - Timestamps are ISO 8601 strings (UTC), e.g. "2026-06-18T09:14:00Z".
 * - SYNTHETIC DATA ONLY. No type here is intended to hold real customer data,
 *   real IOCs, or anything fetched from an external service.
 *
 * See docs/PRODUCT_SPEC.md (data model) and docs/DECISIONS.md (ADR-0008).
 */

/** Alert/case severity, lowest to highest. */
export type Severity = 'informational' | 'low' | 'medium' | 'high' | 'critical'

/** Where the case (originating alert) came from. */
export type CaseSource =
  | 'edr'
  | 'siem'
  | 'email_gateway'
  | 'identity_provider'
  | 'firewall'
  | 'cloud'
  | 'user_report'
  | 'threat_intel'
  | 'other'

/** Workflow state of a case. Distinct from the closure verdict. */
export type CaseStatus = 'new' | 'triage' | 'investigating' | 'closed'

/** Analyst confidence in a finding or mapping. */
export type Confidence = 'low' | 'medium' | 'high'

/** Kind of entity involved in a case. */
export type EntityType =
  | 'host'
  | 'user'
  | 'mailbox'
  | 'cloud_account'
  | 'ip_address'
  | 'domain'
  | 'url'
  | 'file'
  | 'file_hash'
  | 'process'

/** A person, machine, or indicator involved in the case. Synthetic only. */
export interface Entity {
  id: string
  type: EntityType
  /** Display value, e.g. host name, username, IP (synthetic). */
  value: string
  /** The entity's role in this case, e.g. "Affected workstation". */
  role?: string
  description?: string
}

/** Category of an evidence item. */
export type EvidenceType =
  | 'log'
  | 'process'
  | 'network'
  | 'file'
  | 'email'
  | 'authentication'
  | 'registry'
  | 'command'
  | 'screenshot'
  | 'note'
  | 'other'

/** A single piece of evidence supporting (or refuting) the investigation. */
export interface EvidenceItem {
  id: string
  type: EvidenceType
  /** Short label, e.g. "Outlook spawned PowerShell". */
  title: string
  /** The factual content: log line, command, hash, observation (synthetic). */
  detail: string
  /** Where it was collected from, e.g. "EDR process telemetry". */
  source?: string
  /** When the evidence was observed (ISO 8601). */
  observedAt?: string
  /** Analyst note on why this evidence matters. */
  analystNote?: string
  /** Ids of entities this evidence relates to. */
  relatedEntityIds?: string[]
}

/** Phase/category of a timeline event within the incident. */
export type TimelinePhase =
  | 'detection'
  | 'attacker_activity'
  | 'analyst_action'
  | 'containment'
  | 'other'

/** A single point in the reconstructed sequence of events. */
export interface TimelineEvent {
  id: string
  /** When the event occurred (ISO 8601). */
  timestamp: string
  title: string
  description: string
  /** Optional phase/category of the event. */
  phase?: TimelinePhase
  /** Evidence that supports this event. */
  relatedEvidenceIds?: string[]
}

/** Whether an analyst question is still open, resolved, or ruled out. */
export type QuestionStatus = 'open' | 'answered' | 'not_applicable'

/** An open investigative question and the decision/answer reached. */
export interface AnalystQuestion {
  id: string
  question: string
  status: QuestionStatus
  /** The answer or decision, once reached. */
  answer?: string
  /** Reasoning / evidence behind the answer. */
  rationale?: string
  createdAt: string
  answeredAt?: string
}

/** A conclusion the analyst has drawn from the evidence. */
export interface Finding {
  id: string
  title: string
  description: string
  confidence: Confidence
  /** Evidence that supports this finding. */
  relatedEvidenceIds?: string[]
}

/** A mapping from a case finding to a MITRE ATT&CK technique. */
export interface MitreMapping {
  id: string
  /** ATT&CK tactic name, e.g. "Execution". */
  tactic: string
  /** Technique or sub-technique id, e.g. "T1059.001". */
  techniqueId: string
  /** Technique or sub-technique name. */
  techniqueName: string
  /** Why this technique applies to the case. */
  rationale: string
  confidence: Confidence
  /** Evidence supporting the mapping. */
  relatedEvidenceIds?: string[]
}

/** Priority of a recommended action. */
export type RecommendationPriority = 'low' | 'medium' | 'high'

/** A recommended remediation or follow-up action. */
export interface Recommendation {
  id: string
  title: string
  description: string
  priority: RecommendationPriority
}

/** Final classification verdict for a closed case. */
export type ClassificationVerdict =
  | 'true_positive'
  | 'false_positive'
  | 'benign_true_positive'
  | 'inconclusive'

/** Closure details recorded when a case is classified and closed. */
export interface CaseClosure {
  verdict: ClassificationVerdict
  /** Closing summary of the outcome. */
  summary: string
  /** Primary justification for the verdict. */
  rationale: string
  closedAt: string
  closedBy?: string
}

/** Metadata attached to an exported report (used by the report export feature). */
export interface ReportMetadata {
  /** Who prepared the report. */
  preparedBy: string
  /** When the report was generated (ISO 8601). */
  preparedAt: string
  /** Handling/distribution label, e.g. "TLP:CLEAR". */
  distribution: string
  /** Report schema/format version. */
  version: string
}

/**
 * The aggregate root: one investigation, with all of its child records embedded.
 */
export interface SocCase {
  id: string
  title: string
  summary: string
  source: CaseSource
  /** Specific detecting product/tool, e.g. "Microsoft Defender for Endpoint". */
  sourceDetail?: string
  severity: Severity
  status: CaseStatus
  /** Analyst who owns the case. */
  owner: string
  affectedEntities: Entity[]
  evidence: EvidenceItem[]
  timeline: TimelineEvent[]
  analystQuestions: AnalystQuestion[]
  findings: Finding[]
  mitreMappings: MitreMapping[]
  recommendations: Recommendation[]
  /** Present once the case has been classified and closed. */
  closure?: CaseClosure
  /** Present once a report has been generated for the case. */
  reportMetadata?: ReportMetadata
  createdAt: string
  updatedAt: string
}
