import type { SectionId } from '../types'
import { navItems } from '../data/navigation'
import { cn } from '../utils/classNames'

interface SidebarProps {
  active: SectionId
  onSelect: (id: SectionId) => void
}

/** Left navigation listing the workspace sections. */
export function Sidebar({ active, onSelect }: SidebarProps) {
  return (
    <nav className="sidebar" aria-label="Primary">
      <div className="sidebar__heading">Workspace</div>
      <ul className="nav">
        {navItems.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={cn('nav__item', active === item.id && 'nav__item--active')}
              onClick={() => onSelect(item.id)}
              aria-current={active === item.id ? 'page' : undefined}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  )
}
