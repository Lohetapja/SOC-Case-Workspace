import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppFooter } from './components/AppFooter'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { SampleCasesPage } from './pages/SampleCasesPage'
import { CasesPage } from './pages/CasesPage'
import { CaseGraphPage } from './pages/CaseGraphPage'
import { EvidencePage } from './pages/EvidencePage'
import { TimelinePage } from './pages/TimelinePage'
import { DecisionJournalPage } from './pages/DecisionJournalPage'
import { MitreMappingPage } from './pages/MitreMappingPage'
import { ReportsPage } from './pages/ReportsPage'
import { SettingsPage } from './pages/SettingsPage'
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

  function openCaseReport(caseId: string) {
    setActiveCaseId(caseId)
    setSection('reports')
  }

  function openCaseDetail(caseId: string) {
    setActiveCaseId(caseId)
    setSection('cases')
  }

  function renderSection() {
    switch (section) {
      case 'overview':
        return <OverviewPage onNavigate={navigate} />
      case 'samples':
        return <SampleCasesPage onOpenCase={openCaseDetail} />
      case 'cases':
        return (
          <CasesPage
            activeCaseId={activeCaseId}
            onOpenCase={setActiveCaseId}
            onCloseCase={() => setActiveCaseId(null)}
            onOpenGraph={openCaseGraph}
            onOpenReport={openCaseReport}
          />
        )
      case 'graph':
        return <CaseGraphPage activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
      case 'evidence':
        return <EvidencePage onOpenCase={openCaseDetail} />
      case 'timeline':
        return <TimelinePage onOpenCase={openCaseDetail} />
      case 'journal':
        return <DecisionJournalPage onOpenCase={openCaseDetail} />
      case 'mitre':
        return <MitreMappingPage />
      case 'reports':
        return <ReportsPage activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
      case 'settings':
        return <SettingsPage />
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
      <AppFooter />
    </div>
  )
}
