import { useState } from 'react'
import { AppHeader } from './components/AppHeader'
import { Sidebar } from './components/Sidebar'
import { OverviewPage } from './pages/OverviewPage'
import { CasesPage } from './pages/CasesPage'
import { EvidencePage } from './pages/EvidencePage'
import { TimelinePage } from './pages/TimelinePage'
import { DecisionJournalPage } from './pages/DecisionJournalPage'
import { MitreMappingPage } from './pages/MitreMappingPage'
import { ReportsPage } from './pages/ReportsPage'
import type { SectionId } from './types'

/**
 * App shell: header + sidebar + main content. Navigation is simple local state
 * (no router dependency yet — see docs/DECISIONS.md). No case logic lives here.
 */
export default function App() {
  const [section, setSection] = useState<SectionId>('overview')

  function renderSection() {
    switch (section) {
      case 'overview':
        return <OverviewPage onNavigate={setSection} />
      case 'cases':
        return <CasesPage />
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
        <Sidebar active={section} onSelect={setSection} />
        <main className="app__main">{renderSection()}</main>
      </div>
    </div>
  )
}
