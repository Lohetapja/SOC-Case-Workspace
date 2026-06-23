import { Logo } from './Logo'

interface AppHeaderProps {
  isMenuOpen: boolean
  onToggleMenu: () => void
}

/** Top application bar: logo, product name, tagline, and the synthetic-data badge. */
export function AppHeader({ isMenuOpen, onToggleMenu }: AppHeaderProps) {
  return (
    <header className="header">
      <button
        type="button"
        className="header__menu"
        onClick={onToggleMenu}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
      >
        ☰
      </button>
      <div className="header__brand">
        <Logo />
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
