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
          Turn a messy alert into a structured, evidence-backed SOC investigation report.
        </p>
      </header>

      <AboutPanel />

      <section className="card demo-walkthrough">
        <h2 className="demo-walkthrough__title">Start here: follow one alert to a report</h2>
        <p className="detail-text">
          Best first click: open a populated synthetic sample and follow the analyst workflow in
          about 60 seconds—no setup or case creation required.
        </p>
        <ol className="demo-walkthrough__steps">
          <li>Open Sample Cases and load a populated investigation.</li>
          <li>Open the case and review its alert context and affected entities.</li>
          <li>Inspect the evidence collected by the analyst.</li>
          <li>Reconstruct what happened from the chronological timeline.</li>
          <li>Review the Decision Journal and unresolved questions.</li>
          <li>Connect findings to evidence and analyst-authored ATT&amp;CK mappings.</li>
          <li>Use Case Quality Review to identify gaps before closure.</li>
          <li>Explore relationships in the Case Graph and Artifact Map.</li>
          <li>Export the investigation as a clean Markdown report.</li>
        </ol>
        <div className="form__actions">
          <button type="button" className="btn" onClick={() => onNavigate('samples')}>
            Open Sample Cases
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => onNavigate('cases')}>
            Open Cases
          </button>
          <button type="button" className="btn btn--secondary" onClick={() => onNavigate('reports')}>
            Open Reports
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
