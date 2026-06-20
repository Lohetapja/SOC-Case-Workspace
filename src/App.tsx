import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { CasesPage } from './pages/CasesPage'
import { CaseGraphPage } from './pages/CaseGraphPage'
import { EvidencePage } from './pages/EvidencePage'
import { TimelinePage } from './pages/TimelinePage'
import { DecisionJournalPage } from './pages/DecisionJournalPage'
import { MitreMappingPage } from './pages/MitreMappingPage'
import { ReportsPage } from './pages/ReportsPage'
import type { SectionId } from './types'

/**
 * App shell: header + sidebar + main content. Navigation is simple local state
 * (no router dependency yet — see docs/DECISIONS.md). A shared `activeCaseId`
 * links the Cases detail workspace and the Case Graph to the same case.
 */
export default function App() {
  const [section, setSection] = useState<SectionId>('overview')
  const [activeCaseId, setActiveCaseId] = useState<string | null>(null)

  function navigate(target: SectionId) {
    // Selecting "Cases" from the nav always returns to the list.
    if (target === 'cases') setActiveCaseId(null)
    setSection(target)
  }

  function openCaseGraph(caseId: string) {
    setActiveCaseId(caseId)
    setSection('graph')
  }

  function renderSection() {
    switch (section) {
      case 'overview':
        return <OverviewPage onNavigate={navigate} />
      case 'cases':
        return (
          <CasesPage
            activeCaseId={activeCaseId}
            onOpenCase={setActiveCaseId}
            onCloseCase={() => setActiveCaseId(null)}
            onOpenGraph={openCaseGraph}
          />
        )
      case 'graph':
        return <CaseGraphPage activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
      case 'evidence':
        return <EvidencePage />
      case 'timeline':
        return <TimelinePage />
      case 'journal':
        return <DecisionJournalPage />
      case 'mitre':
        return <MitreMappingPage />
      case 'reports':
        return <ReportsPage />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <AppHeader />
      <div className="app__body">
        <Sidebar active={section} onSelect={navigate} />
        <main className="app__main">{renderSection()}</main>
      </div>
    </div>
  )
}
