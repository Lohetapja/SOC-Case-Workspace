import type { ReactNode } from 'react'

interface SectionPlaceholderProps {
  title: string
  subtitle: string
  /** Which build-plan milestone will implement this section. */
  milestone: string
  children?: ReactNode
}

/**
 * Reusable scaffold for a not-yet-implemented section. Keeps the skeleton
 * honest: it shows what the section is for and when it is planned, without
 * pretending to have functionality.
 */
export function SectionPlaceholder({ title, subtitle, milestone, children }: SectionPlaceholderProps) {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">{title}</h1>
        <p className="page__subtitle">{subtitle}</p>
      </header>
      <section className="card placeholder">
        <p className="placeholder__hint">
          This section is a placeholder. Its interface and workflow will be built here.
        </p>
        <span className="placeholder__note">Planned: {milestone}</span>
        {children}
      </section>
    </div>
  )
}
