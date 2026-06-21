import type { ReactNode } from 'react'
import type { SocCase } from '../types'
import type {
  ClosureInput,
  NewEvidenceInput,
  NewFindingInput,
  NewMitreInput,
  NewQuestionInput,
  NewTimelineEventInput,
} from '../data/casesStore'
import {
  closureStatusLabels,
  entityTypeLabels,
  priorityLabels,
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

interface CaseDetailWorkspaceProps {
  socCase: SocCase
  onBack: () => void
  onOpenGraph: () => void
  onOpenReport: () => void
  onAddEvidence: (input: NewEvidenceInput) => void
  onRemoveEvidence: (evidenceId: string) => void
  onAddTimelineEvent: (input: NewTimelineEventInput) => void
  onRemoveTimelineEvent: (eventId: string) => void
  onAddQuestion: (input: NewQuestionInput) => void
  onRemoveQuestion: (questionId: string) => void
  onAddFinding: (input: NewFindingInput) => void
  onRemoveFinding: (findingId: string) => void
  onAddMitre: (input: NewMitreInput) => void
  onRemoveMitre: (mappingId: string) => void
  onSaveClosure: (input: ClosureInput) => void
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="card detail-section">
      <h2 className="detail-section__title">
        {title}
        {typeof count === 'number' && <span className="detail-section__count">{count}</span>}
      </h2>
      {children}
    </section>
  )
}

function Empty() {
  return <p className="detail-empty">None recorded yet.</p>
}

/**
 * Read-only workspace for a single case. Shows header fields and every section of
 * the case model. No editing yet — that lands in a later milestone.
 */
export function CaseDetailWorkspace({
  socCase,
  onBack,
  onOpenGraph,
  onOpenReport,
  onAddEvidence,
  onRemoveEvidence,
  onAddTimelineEvent,
  onRemoveTimelineEvent,
  onAddQuestion,
  onRemoveQuestion,
  onAddFinding,
  onRemoveFinding,
  onAddMitre,
  onRemoveMitre,
  onSaveClosure,
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

      <Section title="Summary">
        <p className="detail-text">{socCase.summary || 'No summary provided.'}</p>
      </Section>

      <ClosureSection closure={socCase.closure} onSave={onSaveClosure} />

      <Section title="Affected entities" count={socCase.affectedEntities.length}>
        {socCase.affectedEntities.length === 0 ? (
          <Empty />
        ) : (
          <ul className="detail-list">
            {socCase.affectedEntities.map((entity) => (
              <li key={entity.id} className="detail-item">
                <div className="detail-item__head">
                  <span className="chip">{entityTypeLabels[entity.type]}</span>
                  <span className="detail-mono">{entity.value}</span>
                </div>
                {(entity.role || entity.description) && (
                  <p className="detail-item__sub">
                    {[entity.role, entity.description].filter(Boolean).join(' — ')}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <EvidenceSection
        evidence={socCase.evidence}
        onAdd={onAddEvidence}
        onRemove={onRemoveEvidence}
      />

      <TimelineSection
        timeline={socCase.timeline}
        evidence={socCase.evidence}
        onAdd={onAddTimelineEvent}
        onRemove={onRemoveTimelineEvent}
      />

      <DecisionJournalSection
        questions={socCase.analystQuestions}
        onAdd={onAddQuestion}
        onRemove={onRemoveQuestion}
      />

      <FindingsSection
        findings={socCase.findings}
        evidence={socCase.evidence}
        timeline={socCase.timeline}
        onAdd={onAddFinding}
        onRemove={onRemoveFinding}
      />

      <MitreMappingSection
        mappings={socCase.mitreMappings}
        findings={socCase.findings}
        evidence={socCase.evidence}
        onAdd={onAddMitre}
        onRemove={onRemoveMitre}
      />

      <Section title="Recommendations" count={socCase.recommendations.length}>
        {socCase.recommendations.length === 0 ? (
          <Empty />
        ) : (
          <ul className="detail-list">
            {socCase.recommendations.map((rec) => (
              <li key={rec.id} className="detail-item">
                <div className="detail-item__head">
                  <strong>{rec.title}</strong>
                  <span className="chip">{priorityLabels[rec.priority]} priority</span>
                </div>
                <p className="detail-text">{rec.description}</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <section className="card detail-graph-cta">
        <div>
          <h2 className="detail-section__title">Case Graph</h2>
          <p className="detail-text">Explore this case as an interactive relationship graph.</p>
        </div>
        <button type="button" className="btn" onClick={onOpenGraph}>
          Open Case Graph →
        </button>
      </section>

      <section className="card detail-graph-cta">
        <div>
          <h2 className="detail-section__title">Investigation report</h2>
          <p className="detail-text">Generate a Markdown report of this case to copy or download.</p>
        </div>
        <button type="button" className="btn" onClick={onOpenReport}>
          Export report →
        </button>
      </section>
    </div>
  )
}
