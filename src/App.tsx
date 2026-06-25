import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { AppFooter } from './components/AppFooter'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { SearchPage } from './pages/SearchPage'
import { SampleCasesPage } from './pages/SampleCasesPage'
import { AnalystGuidePage } from './pages/AnalystGuidePage'
import { CasesPage } from './pages/CasesPage'
import { CaseGraphPage } from './pages/CaseGraphPage'
import { EvidencePage } from './pages/EvidencePage'
import { TimelinePage } from './pages/TimelinePage'
import { DecisionJournalPage } from './pages/DecisionJournalPage'
import { MitreMappingPage } from './pages/MitreMappingPage'
import { ReportsPage } from './pages/ReportsPage'
import { ReadOnlyCasePage } from './pages/ReadOnlyCasePage'
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  function navigate(target: SectionId) {
    // Selecting "Cases" from the nav always returns to the list.
    if (target === 'cases') setActiveCaseId(null)
    setSection(target)
    setMobileNavOpen(false)
  }

  function openCaseGraph(caseId: string) {
    setActiveCaseId(caseId)
    setSection('graph')
    setMobileNavOpen(false)
  }

  function openCaseReport(caseId: string) {
    setActiveCaseId(caseId)
    setSection('reports')
    setMobileNavOpen(false)
  }

  function openReadOnlyCase(caseId: string) {
    setActiveCaseId(caseId)
    setSection('viewer')
    setMobileNavOpen(false)
  }

  function openCaseDetail(caseId: string | null) {
    setActiveCaseId(caseId)
    setSection('cases')
    setMobileNavOpen(false)
  }

  function renderSection() {
    switch (section) {
      case 'overview':
        return <OverviewPage onNavigate={navigate} />
      case 'search':
        return <SearchPage onOpenCase={openCaseDetail} />
      case 'samples':
        return <SampleCasesPage onOpenCase={openCaseDetail} />
      case 'guide':
        return <AnalystGuidePage />
      case 'cases':
        return (
          <CasesPage
            activeCaseId={activeCaseId}
            onOpenCase={setActiveCaseId}
            onCloseCase={() => setActiveCaseId(null)}
            onOpenGraph={openCaseGraph}
            onOpenReport={openCaseReport}
            onOpenReadOnly={openReadOnlyCase}
          />
        )
      case 'graph':
        return (
          <CaseGraphPage
            activeCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
            onOpenCase={openCaseDetail}
          />
        )
      case 'evidence':
        return <EvidencePage onOpenCase={openCaseDetail} />
      case 'timeline':
        return <TimelinePage onOpenCase={openCaseDetail} />
      case 'journal':
        return <DecisionJournalPage onOpenCase={openCaseDetail} />
      case 'mitre':
        return <MitreMappingPage onOpenCase={openCaseDetail} />
      case 'reports':
        return (
          <ReportsPage
            activeCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
            onOpenCase={openCaseDetail}
          />
        )
      case 'viewer':
        return (
          <ReadOnlyCasePage
            activeCaseId={activeCaseId}
            onBackToWorkspace={openCaseDetail}
            onOpenCases={() => openCaseDetail(null)}
          />
        )
      case 'settings':
        return <SettingsPage />
      default:
        return null
    }
  }

  return (
    <div className="app">
      <AppHeader
        isMenuOpen={mobileNavOpen}
        onToggleMenu={() => setMobileNavOpen((isOpen) => !isOpen)}
      />
      <div className="app__body">
        <Sidebar active={section} onSelect={navigate} isOpen={mobileNavOpen} />
        {mobileNavOpen && (
          <button
            type="button"
            className="sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMobileNavOpen(false)}
          />
        )}
        <main className="app__main">{renderSection()}</main>
      </div>
      <AppFooter />
    </div>
  )
}
