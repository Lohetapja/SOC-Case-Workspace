import { CaseSummaryCard } from '../components/CaseSummaryCard'
import { demoCases } from '../data/demoCases'

/**
 * Cases view. For Milestone 2 this is a read-only preview of the synthetic demo
 * cases — enough to see the data model rendered. The case list, create form, and
 * localStorage persistence land in the next milestone.
 */
export function CasesPage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Cases</h1>
        <p className="page__subtitle">
          Investigations as structured cases. Showing {demoCases.length} synthetic
          demo cases — a read-only preview of the data model.
        </p>
      </header>

      <div className="case-list">
        {demoCases.map((socCase) => (
          <CaseSummaryCard key={socCase.id} socCase={socCase} />
        ))}
      </div>

      <p className="cases-note">
        Creating, editing, and saving cases arrives next (case list &amp; create
        form with localStorage). These two cases are fixed demo data for now.
      </p>
    </div>
  )
}
