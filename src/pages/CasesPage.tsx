import { useState } from 'react'
import { CaseSummaryCard } from '../components/CaseSummaryCard'
import { CreateCaseForm } from '../components/CreateCaseForm'
import { CaseDetailWorkspace } from '../components/CaseDetailWorkspace'
import { useCases } from '../hooks/useCases'
import {
  buildClosure,
  buildLabMetadata,
  createAgentContribution,
  createAnalystQuestion,
  createEntity,
  createEvidenceItem,
  createFinding,
  createMitreMapping,
  createRecommendation,
  createTimelineEvent,
  updateAnalystQuestion,
  updateEvidenceItem,
  updateFinding,
  updateMitreMapping,
  updateTimelineEvent,
} from '../data/casesStore'
import type { AgentContributionStatus } from '../types'
import {
  removeEvidenceRecord,
  removeFindingRecord,
  removeTimelineRecord,
} from '../utils/caseReferences'

interface CasesPageProps {
  /** The currently opened case, or null to show the list. */
  activeCaseId: string | null
  onOpenCase: (id: string) => void
  onCloseCase: () => void
  onOpenGraph: (id: string) => void
  onOpenReport: (id: string) => void
  onOpenReadOnly: (id: string) => void
}

/**
 * Cases section. Shows the case list (with create + delete) or, when a case is
 * active, its editable detail workspace. Backed by localStorage.
 */
export function CasesPage({
  activeCaseId,
  onOpenCase,
  onCloseCase,
  onOpenGraph,
  onOpenReport,
  onOpenReadOnly,
}: CasesPageProps) {
  const { cases, addCase, removeCase, updateCase } = useCases()
  const [showForm, setShowForm] = useState(false)

  const activeCase = activeCaseId ? cases.find((socCase) => socCase.id === activeCaseId) : undefined

  if (activeCase) {
    const caseId = activeCase.id
    return (
      <CaseDetailWorkspace
        socCase={activeCase}
        onBack={onCloseCase}
        onOpenGraph={() => onOpenGraph(caseId)}
        onOpenReport={() => onOpenReport(caseId)}
        onOpenReadOnly={() => onOpenReadOnly(caseId)}
        onSaveMetadata={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            title: input.title.trim(),
            summary: input.summary.trim(),
            source: input.source,
            sourceDetail: input.source === socCase.source ? socCase.sourceDetail : undefined,
            severity: input.severity,
            status: input.status,
            owner: input.owner.trim() || 'unassigned',
          }))
        }
        onAddEntity={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            affectedEntities: [...socCase.affectedEntities, createEntity(input)],
          }))
        }
        onRemoveEntity={(entityId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            affectedEntities: socCase.affectedEntities.filter((entity) => entity.id !== entityId),
            evidence: socCase.evidence.map((item) => {
              const relatedEntityIds = item.relatedEntityIds?.filter((id) => id !== entityId)
              return {
                ...item,
                relatedEntityIds: relatedEntityIds?.length ? relatedEntityIds : undefined,
              }
            }),
          }))
        }
        onAddEvidence={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            evidence: [...socCase.evidence, createEvidenceItem(input)],
          }))
        }
        onUpdateEvidence={(evidenceId, input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            evidence: socCase.evidence.map((item) =>
              item.id === evidenceId ? updateEvidenceItem(item, input) : item,
            ),
          }))
        }
        onRemoveEvidence={(evidenceId) =>
          updateCase(caseId, (socCase) => removeEvidenceRecord(socCase, evidenceId))
        }
        onAddTimelineEvent={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            timeline: [...socCase.timeline, createTimelineEvent(input)],
          }))
        }
        onUpdateTimelineEvent={(eventId, input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            timeline: socCase.timeline.map((event) =>
              event.id === eventId ? updateTimelineEvent(event, input) : event,
            ),
          }))
        }
        onRemoveTimelineEvent={(eventId) =>
          updateCase(caseId, (socCase) => removeTimelineRecord(socCase, eventId))
        }
        onAddQuestion={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            analystQuestions: [...socCase.analystQuestions, createAnalystQuestion(input)],
          }))
        }
        onUpdateQuestion={(questionId, input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            analystQuestions: socCase.analystQuestions.map((question) =>
              question.id === questionId ? updateAnalystQuestion(question, input) : question,
            ),
          }))
        }
        onRemoveQuestion={(questionId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            analystQuestions: socCase.analystQuestions.filter((q) => q.id !== questionId),
          }))
        }
        onAddAgentContribution={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            agentContributions: [
              ...(socCase.agentContributions ?? []),
              createAgentContribution(input),
            ],
          }))
        }
        onRemoveAgentContribution={(contributionId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            agentContributions: (socCase.agentContributions ?? []).filter(
              (contribution) => contribution.id !== contributionId,
            ),
          }))
        }
        onUpdateAgentContributionStatus={(
          contributionId: string,
          status: AgentContributionStatus,
        ) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            agentContributions: (socCase.agentContributions ?? []).map((contribution) =>
              contribution.id === contributionId
                ? {
                    ...contribution,
                    status,
                    reviewedAt:
                      status === 'unreviewed' ? undefined : new Date().toISOString(),
                  }
                : contribution,
            ),
          }))
        }
        onAddFinding={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            findings: [...socCase.findings, createFinding(input)],
          }))
        }
        onUpdateFinding={(findingId, input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            findings: socCase.findings.map((finding) =>
              finding.id === findingId ? updateFinding(finding, input) : finding,
            ),
          }))
        }
        onRemoveFinding={(findingId) =>
          updateCase(caseId, (socCase) => removeFindingRecord(socCase, findingId))
        }
        onAddMitre={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            mitreMappings: [...socCase.mitreMappings, createMitreMapping(input)],
          }))
        }
        onUpdateMitre={(mappingId, input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            mitreMappings: socCase.mitreMappings.map((mapping) =>
              mapping.id === mappingId ? updateMitreMapping(mapping, input) : mapping,
            ),
          }))
        }
        onRemoveMitre={(mappingId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            mitreMappings: socCase.mitreMappings.filter((mapping) => mapping.id !== mappingId),
          }))
        }
        onAddRecommendation={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            recommendations: [...socCase.recommendations, createRecommendation(input)],
          }))
        }
        onRemoveRecommendation={(recommendationId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            recommendations: socCase.recommendations.filter(
              (recommendation) => recommendation.id !== recommendationId,
            ),
          }))
        }
        onSaveClosure={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            closure: buildClosure(socCase.closure, input),
          }))
        }
        onSaveLabMetadata={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            lab: buildLabMetadata(input),
          }))
        }
        onToggleChecklistItem={(itemId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            checklist: socCase.checklist?.map((item) =>
              item.id === itemId ? { ...item, done: !item.done } : item,
            ),
          }))
        }
      />
    )
  }

  function handleDelete(id: string) {
    const target = cases.find((socCase) => socCase.id === id)
    const label = target ? target.title : 'this case'
    if (window.confirm(`Permanently delete "${label}" from this browser? This cannot be undone.`)) {
      removeCase(id)
    }
  }

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1 className="page__title">Cases</h1>
          <p className="page__subtitle">
            {cases.length} {cases.length === 1 ? 'case' : 'cases'} · saved locally
            in your browser. Click a case to open it.
          </p>
        </div>
        {!showForm && (
          <button type="button" className="btn" onClick={() => setShowForm(true)}>
            New case
          </button>
        )}
      </header>

      {showForm && (
        <CreateCaseForm
          onCreate={(input) => {
            addCase(input)
            setShowForm(false)
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {cases.length === 0 ? (
        <div className="empty-state empty-state--stacked">
          <p className="cases-note">
            No cases in this browser yet. Create a blank or template-based case here, or load a
            guided synthetic case from Sample Cases to explore the full workflow.
          </p>
          {!showForm && (
            <button type="button" className="btn btn--secondary" onClick={() => setShowForm(true)}>
              New case
            </button>
          )}
        </div>
      ) : (
        <div className="case-list">
          {cases.map((socCase) => (
            <CaseSummaryCard
              key={socCase.id}
              socCase={socCase}
              onOpen={onOpenCase}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <p className="cases-note">
        Cases are saved to this browser's localStorage (synthetic data only). Open any case to
        add evidence, reconstruct its timeline, document findings, and export a report.
      </p>
    </div>
  )
}
