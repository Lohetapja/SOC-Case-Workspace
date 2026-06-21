import { useCases } from '../hooks/useCases'
import { ReportSection } from '../components/ReportSection'

interface ReportsPageProps {
  /** Shared active case; falls back to the first stored case. */
  activeCaseId: string | null
  onSelectCase: (id: string) => void
}

/** Markdown investigation report export for one case. */
export function ReportsPage({ activeCaseId, onSelectCase }: ReportsPageProps) {
  const { cases } = useCases()
  const activeCase = cases.find((socCase) => socCase.id === activeCaseId) ?? cases[0]

  if (cases.length === 0) {
    return (
      <div className="page">
        <header className="page__header">
          <h1 className="page__title">Reports</h1>
          <p className="page__subtitle">Export a case as a Markdown investigation report.</p>
        </header>
        <p className="cases-note">No cases to report on yet. Create a case first.</p>
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
      </header>

      {activeCase && <ReportSection socCase={activeCase} />}
    </div>
  )
}
