import { useMemo, useState } from 'react'
import type { QuestionStatus } from '../types'
import { useCases } from '../hooks/useCases'
import { questionStatusLabels } from '../data/labels'
import { WorkspaceFilters } from '../components/WorkspaceFilters'

interface DecisionJournalPageProps {
  onOpenCase: (id: string) => void
}

const statusOptions = Object.keys(questionStatusLabels) as QuestionStatus[]
const STATUS_ORDER: Record<QuestionStatus, number> = { open: 0, answered: 1, not_applicable: 2 }

function statusChipClass(status: QuestionStatus): string {
  if (status === 'answered') return 'chip chip--ok'
  if (status === 'open') return 'chip chip--open'
  return 'chip'
}

/** Read-only, cross-case view of all analyst questions, open first. */
export function DecisionJournalPage({ onOpenCase }: DecisionJournalPageProps) {
  const { cases } = useCases()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [caseId, setCaseId] = useState('all')

  const items = useMemo(
    () =>
      cases
        .flatMap((socCase) =>
          socCase.analystQuestions.map((question) => ({
            ...question,
            caseId: socCase.id,
            caseTitle: socCase.title,
          })),
        )
        .sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status]),
    [cases],
  )

  const filtered = items.filter((question) => {
    if (status !== 'all' && question.status !== status) return false
    if (caseId !== 'all' && question.caseId !== caseId) return false
    if (search.trim()) {
      const haystack = `${question.question} ${question.answer ?? ''} ${question.rationale ?? ''}`.toLowerCase()
      if (!haystack.includes(search.trim().toLowerCase())) return false
    }
    return true
  })

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Decision Journal</h1>
        <p className="page__subtitle">
          All analyst questions across your cases, open first ({items.length}{' '}
          {items.length === 1 ? 'question' : 'questions'}). Read-only — edit inside a case.
        </p>
      </header>

      {items.length === 0 ? (
        <p className="cases-note">
          No analyst questions recorded yet. Open a case to add investigation questions.
        </p>
      ) : (
        <>
          <WorkspaceFilters
            searchPlaceholder="Search questions…"
            search={search}
            onSearch={setSearch}
            selects={[
              {
                id: 'status',
                value: status,
                onChange: setStatus,
                allLabel: 'All statuses',
                options: statusOptions.map((value) => ({ value, label: questionStatusLabels[value] })),
              },
              {
                id: 'case',
                value: caseId,
                onChange: setCaseId,
                allLabel: 'All cases',
                options: cases.map((socCase) => ({ value: socCase.id, label: socCase.title })),
              },
            ]}
          />

          {filtered.length === 0 ? (
            <p className="cases-note">No questions match your filters.</p>
          ) : (
            <ul className="detail-list">
              {filtered.map((question) => (
                <li key={`${question.caseId}-${question.id}`} className="detail-item">
                  <div className="detail-item__head">
                    <strong>{question.question}</strong>
                    <span className={statusChipClass(question.status)}>
                      {questionStatusLabels[question.status]}
                    </span>
                    <button
                      type="button"
                      className="btn-link detail-item__open"
                      onClick={() => onOpenCase(question.caseId)}
                    >
                      Open case →
                    </button>
                  </div>
                  {question.answer && <p className="detail-text">{question.answer}</p>}
                  {question.rationale && (
                    <p className="detail-item__note">Rationale: {question.rationale}</p>
                  )}
                  <p className="detail-item__case">Case: {question.caseTitle}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  )
}
