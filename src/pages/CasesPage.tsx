import { useState } from 'react'
import { CaseSummaryCard } from '../components/CaseSummaryCard'
import { CreateCaseForm } from '../components/CreateCaseForm'
import { CaseDetailWorkspace } from '../components/CaseDetailWorkspace'
import { useCases } from '../hooks/useCases'
import {
  buildClosure,
  createAnalystQuestion,
  createEvidenceItem,
  createFinding,
  createMitreMapping,
  createTimelineEvent,
} from '../data/casesStore'

interface CasesPageProps {
  /** The currently opened case, or null to show the list. */
  activeCaseId: string | null
  onOpenCase: (id: string) => void
  onCloseCase: () => void
  onOpenGraph: (id: string) => void
}

/**
 * Cases section. Shows the case list (with create + delete) or, when a case is
 * active, its read-only detail workspace. Backed by localStorage.
 */
export function CasesPage({ activeCaseId, onOpenCase, onCloseCase, onOpenGraph }: CasesPageProps) {
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
        onAddEvidence={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            evidence: [...socCase.evidence, createEvidenceItem(input)],
          }))
        }
        onRemoveEvidence={(evidenceId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            evidence: socCase.evidence.filter((item) => item.id !== evidenceId),
          }))
        }
        onAddTimelineEvent={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            timeline: [...socCase.timeline, createTimelineEvent(input)],
          }))
        }
        onRemoveTimelineEvent={(eventId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            timeline: socCase.timeline.filter((event) => event.id !== eventId),
          }))
        }
        onAddQuestion={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            analystQuestions: [...socCase.analystQuestions, createAnalystQuestion(input)],
          }))
        }
        onRemoveQuestion={(questionId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            analystQuestions: socCase.analystQuestions.filter((q) => q.id !== questionId),
          }))
        }
        onAddFinding={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            findings: [...socCase.findings, createFinding(input)],
          }))
        }
        onRemoveFinding={(findingId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            findings: socCase.findings.filter((finding) => finding.id !== findingId),
          }))
        }
        onAddMitre={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            mitreMappings: [...socCase.mitreMappings, createMitreMapping(input)],
          }))
        }
        onRemoveMitre={(mappingId) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            mitreMappings: socCase.mitreMappings.filter((mapping) => mapping.id !== mappingId),
          }))
        }
        onSaveClosure={(input) =>
          updateCase(caseId, (socCase) => ({
            ...socCase,
            closure: buildClosure(socCase.closure, input),
          }))
        }
      />
    )
  }

  function handleDelete(id: string) {
    const target = cases.find((socCase) => socCase.id === id)
    const label = target ? target.title : 'this case'
    if (window.confirm(`Delete "${label}"? This cannot be undone.`)) {
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
        <p className="cases-note">No cases yet. Create one to get started.</p>
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
        Cases are saved to your browser's localStorage (synthetic data only). New
        cases start empty — evidence, timeline, and the other sections are filled
        in their own milestones.
      </p>
    </div>
  )
}
