import type { AgentContributionStatus, SocCase } from '../types'
import type {
  CaseMetadataInput,
  ClosureInput,
  NewAgentContributionInput,
  NewEntityInput,
  NewEvidenceInput,
  NewFindingInput,
  NewMitreInput,
  NewQuestionInput,
  NewRecommendationInput,
  NewTimelineEventInput,
} from '../data/casesStore'
import {
  closureStatusLabels,
  severityLabels,
  sourceLabels,
  statusLabels,
  verdictLabels,
} from '../data/labels'
import { formatDateTime } from '../utils/format'
import { EvidenceSection } from './EvidenceSection'
import { TimelineSection } from './TimelineSection'
import { DecisionJournalSection } from './DecisionJournalSection'
import { FindingsSection } from './FindingsSection'
import { MitreMappingSection } from './MitreMappingSection'
import { ClosureSection } from './ClosureSection'
import { ChecklistSection } from './ChecklistSection'
import { CaseQualityReview } from './CaseQualityReview'
import { AgentContributionsSection } from './AgentContributionsSection'
import { CaseMetadataSection } from './CaseMetadataSection'
import { AffectedEntitiesSection } from './AffectedEntitiesSection'
import { RecommendationsSection } from './RecommendationsSection'

interface CaseDetailWorkspaceProps {
  socCase: SocCase
  onBack: () => void
  onOpenGraph: () => void
  onOpenReport: () => void
  onSaveMetadata: (input: CaseMetadataInput) => void
  onAddEntity: (input: NewEntityInput) => void
  onRemoveEntity: (entityId: string) => void
  onAddEvidence: (input: NewEvidenceInput) => void
  onUpdateEvidence: (evidenceId: string, input: NewEvidenceInput) => void
  onRemoveEvidence: (evidenceId: string) => void
  onAddTimelineEvent: (input: NewTimelineEventInput) => void
  onUpdateTimelineEvent: (eventId: string, input: NewTimelineEventInput) => void
  onRemoveTimelineEvent: (eventId: string) => void
  onAddQuestion: (input: NewQuestionInput) => void
  onUpdateQuestion: (questionId: string, input: NewQuestionInput) => void
  onRemoveQuestion: (questionId: string) => void
  onAddAgentContribution: (input: NewAgentContributionInput) => void
  onRemoveAgentContribution: (contributionId: string) => void
  onUpdateAgentContributionStatus: (
    contributionId: string,
    status: AgentContributionStatus,
  ) => void
  onAddFinding: (input: NewFindingInput) => void
  onUpdateFinding: (findingId: string, input: NewFindingInput) => void
  onRemoveFinding: (findingId: string) => void
  onAddMitre: (input: NewMitreInput) => void
  onUpdateMitre: (mappingId: string, input: NewMitreInput) => void
  onRemoveMitre: (mappingId: string) => void
  onAddRecommendation: (input: NewRecommendationInput) => void
  onRemoveRecommendation: (recommendationId: string) => void
  onSaveClosure: (input: ClosureInput) => void
  onToggleChecklistItem: (itemId: string) => void
}

/** Working surface for one case, with focused editable investigation sections. */
export function CaseDetailWorkspace({
  socCase,
  onBack,
  onOpenGraph,
  onOpenReport,
  onSaveMetadata,
  onAddEntity,
  onRemoveEntity,
  onAddEvidence,
  onUpdateEvidence,
  onRemoveEvidence,
  onAddTimelineEvent,
  onUpdateTimelineEvent,
  onRemoveTimelineEvent,
  onAddQuestion,
  onUpdateQuestion,
  onRemoveQuestion,
  onAddAgentContribution,
  onRemoveAgentContribution,
  onUpdateAgentContributionStatus,
  onAddFinding,
  onUpdateFinding,
  onRemoveFinding,
  onAddMitre,
  onUpdateMitre,
  onRemoveMitre,
  onAddRecommendation,
  onRemoveRecommendation,
  onSaveClosure,
  onToggleChecklistItem,
}: CaseDetailWorkspaceProps) {
  return (
    <div className="detail">
      <button type="button" className="btn btn--secondary detail__back" onClick={onBack}>
        ← Back to Cases
      </button>

      <header className="card detail-header">
        <div className="detail-header__top">
          <h1 className="detail-header__title">{socCase.title}</h1>
          <span className={`sev sev--${socCase.severity}`}>{severityLabels[socCase.severity]}</span>
        </div>
        <div className="detail-header__meta">
          <span className="chip">Status: {statusLabels[socCase.status]}</span>
          <span className="chip">
            Source: {sourceLabels[socCase.source]}
            {socCase.sourceDetail ? ` (${socCase.sourceDetail})` : ''}
          </span>
          <span className="chip">Owner: {socCase.owner}</span>
          {socCase.closure?.verdict && (
            <span className="chip">Classification: {verdictLabels[socCase.closure.verdict]}</span>
          )}
          {socCase.closure?.closureStatus && (
            <span className="chip">Closure: {closureStatusLabels[socCase.closure.closureStatus]}</span>
          )}
        </div>
        <div className="detail-header__dates">
          <span>Created {formatDateTime(socCase.createdAt)}</span>
          <span>Updated {formatDateTime(socCase.updatedAt)}</span>
        </div>
      </header>

      <CaseMetadataSection socCase={socCase} onSave={onSaveMetadata} />

      <CaseQualityReview socCase={socCase} onOpenReport={onOpenReport} />

      {socCase.checklist && socCase.checklist.length > 0 && (
        <ChecklistSection checklist={socCase.checklist} onToggle={onToggleChecklistItem} />
      )}

      <ClosureSection closure={socCase.closure} onSave={onSaveClosure} />

      <AffectedEntitiesSection
        entities={socCase.affectedEntities}
        onAdd={onAddEntity}
        onRemove={onRemoveEntity}
      />

      <EvidenceSection
        evidence={socCase.evidence}
        onAdd={onAddEvidence}
        onUpdate={onUpdateEvidence}
        onRemove={onRemoveEvidence}
      />

      <TimelineSection
        timeline={socCase.timeline}
        evidence={socCase.evidence}
        onAdd={onAddTimelineEvent}
        onUpdate={onUpdateTimelineEvent}
        onRemove={onRemoveTimelineEvent}
      />

      <DecisionJournalSection
        questions={socCase.analystQuestions}
        onAdd={onAddQuestion}
        onUpdate={onUpdateQuestion}
        onRemove={onRemoveQuestion}
      />

      <AgentContributionsSection
        contributions={socCase.agentContributions ?? []}
        evidence={socCase.evidence}
        onAdd={onAddAgentContribution}
        onRemove={onRemoveAgentContribution}
        onUpdateStatus={onUpdateAgentContributionStatus}
      />

      <FindingsSection
        findings={socCase.findings}
        evidence={socCase.evidence}
        timeline={socCase.timeline}
        onAdd={onAddFinding}
        onUpdate={onUpdateFinding}
        onRemove={onRemoveFinding}
      />

      <MitreMappingSection
        mappings={socCase.mitreMappings}
        findings={socCase.findings}
        evidence={socCase.evidence}
        onAdd={onAddMitre}
        onUpdate={onUpdateMitre}
        onRemove={onRemoveMitre}
      />

      <RecommendationsSection
        recommendations={socCase.recommendations}
        onAdd={onAddRecommendation}
        onRemove={onRemoveRecommendation}
      />

      <section className="card detail-graph-cta">
        <div>
          <h2 className="detail-section__title">Investigation visuals</h2>
          <p className="detail-text">Explore this case in the Case Graph or structured Artifact Map.</p>
        </div>
        <button type="button" className="btn" onClick={onOpenGraph}>Open visuals →</button>
      </section>

      <section className="card detail-graph-cta">
        <div>
          <h2 className="detail-section__title">Investigation report</h2>
          <p className="detail-text">Generate a Markdown report of this case to copy or download.</p>
        </div>
        <button type="button" className="btn" onClick={onOpenReport}>Export report →</button>
      </section>
    </div>
  )
}
