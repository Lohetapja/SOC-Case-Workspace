import { useState } from 'react'
import { CaseSummaryCard } from '../components/CaseSummaryCard'
import { CreateCaseForm } from '../components/CreateCaseForm'
import { useCases } from '../hooks/useCases'

/**
 * Cases view: a list of cases backed by localStorage, plus a create-case form.
 * Seeded from the synthetic demo cases on first run.
 */
export function CasesPage() {
  const { cases, addCase, removeCase } = useCases()
  const [showForm, setShowForm] = useState(false)

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
            in your browser.
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
            <CaseSummaryCard key={socCase.id} socCase={socCase} onDelete={handleDelete} />
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
