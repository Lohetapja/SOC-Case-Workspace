/** Top application bar: product name, tagline, and the synthetic-data badge. */
export function AppHeader() {
  return (
    <header className="header">
      <div className="header__brand">
        <span className="header__title">SOC Case Workspace</span>
        <span className="header__tagline">Turn messy alerts into structured SOC cases</span>
      </div>
      <span className="badge" title="This application never uses real data.">
        <span className="badge__dot" aria-hidden="true" />
        Synthetic data only
      </span>
    </header>
  )
}
