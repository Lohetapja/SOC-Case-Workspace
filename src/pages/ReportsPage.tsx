import { useCases } from '../hooks/useCases'
import { ReportSection } from '../components/ReportSection'

interface ReportsPageProps {
  /** Shared active case; falls back to the first stored case. */
  activeCaseId: string | null
  onSelectCase: (id: string) => void
  onOpenCase: (id: string | null) => void
}

/** Markdown investigation report export for one case. */
export function ReportsPage({ activeCaseId, onSelectCase, onOpenCase }: ReportsPageProps) {
  const { cases } = useCases()
  const activeCase = cases.find((socCase) => socCase.id === activeCaseId) ?? cases[0]

  if (cases.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Reports</h1>
          <p className="page__subtitle">Export a case as a Markdown investigation report.</p>
        </header>
        <p className="cases-note">
          No case is available for report export. Create a case or load a guided sample first.
        </p>
        <button type="button" className="btn" onClick={() => onOpenCase(null)}>
          Go to Cases
        </button>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page__header page__header--row">
        <div>
          <h1 className="page__title">Investigation report</h1>
          <p className="page__subtitle">
            Markdown export of the selected case (synthetic data only).
          </p>
        </div>
        <div className="graph-controls">
          <label className="graph-select">
            <span>Case</span>
            <select
              value={activeCase?.id}
              onChange={(event) => onSelectCase(event.target.value)}
            >
              {cases.map((socCase) => (
                <option key={socCase.id} value={socCase.id}>
                  {socCase.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => onOpenCase(activeCase?.id ?? null)}
          >
            Open selected case
          </button>
        </div>
      </header>

      {activeCase && <ReportSection socCase={activeCase} />}
    </div>
  )
}
