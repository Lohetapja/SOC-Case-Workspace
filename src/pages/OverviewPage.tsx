import { AboutPanel } from '../components/AboutPanel'
import { navItems } from '../data/navigation'
import type { SectionId } from '../types'

interface OverviewPageProps {
  onNavigate: (id: SectionId) => void
}

/** Landing view: the About panel plus quick links into each section. */
export function OverviewPage({ onNavigate }: OverviewPageProps) {
  const sections = navItems.filter((item) => item.id !== 'overview')

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Overview</h1>
        <p className="page__subtitle">
          Turn an alert into an evidence-backed case, closure decision, and report.
        </p>
      </header>

      <AboutPanel />

      <section className="card demo-walkthrough">
        <h2 className="demo-walkthrough__title">Start here: explore a case in 60 seconds</h2>
        <p className="detail-text">
          Open a populated synthetic sample to see the complete analyst workflow without creating
          a case from scratch.
        </p>
        <ol className="demo-walkthrough__steps">
          <li>Open a sample case and review its alert context and affected entities.</li>
          <li>Trace the evidence and chronological timeline.</li>
          <li>Review analyst questions, findings, and ATT&amp;CK rationale.</li>
          <li>Check Case Quality Review for unresolved investigation gaps.</li>
          <li>Explore the Case Graph and Artifact Map.</li>
          <li>Export the final Markdown investigation report.</li>
        </ol>
        <div className="form__actions">
          <button type="button" className="btn" onClick={() => onNavigate('samples')}>
            Open Sample Cases →
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="about__title">Workspace sections</h2>
        <p className="overview-hint">
          Work inside a case to build the investigation, or use these workspace-level views to
          review related records across all cases.
        </p>
        <div className="section-grid">
          {sections.map((item) => (
            <button
              key={item.id}
              type="button"
              className="section-card"
              onClick={() => onNavigate(item.id)}
            >
              <div className="section-card__title">{item.label}</div>
              <div className="section-card__desc">{item.description}</div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
