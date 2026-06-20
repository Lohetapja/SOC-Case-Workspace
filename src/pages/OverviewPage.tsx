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
          An educational workspace for structuring SOC investigations end to end.
        </p>
      </header>

      <AboutPanel />

      <section className="card">
        <h2 className="about__title">Workspace sections</h2>
        <p className="placeholder__hint">
          Each stage of an investigation has its own section. Features are built
          one milestone at a time.
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
