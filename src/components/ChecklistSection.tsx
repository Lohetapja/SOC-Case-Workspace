import type { ChecklistGroup, ChecklistItem } from '../types'
import { checklistGroupLabels } from '../data/labels'

const GROUP_ORDER: ChecklistGroup[] = ['evidence', 'timeline', 'findings', 'closure']

interface ChecklistSectionProps {
  checklist: ChecklistItem[]
  onToggle: (itemId: string) => void
}

/** Investigation checklist seeded from a template; items can be checked off. */
export function ChecklistSection({ checklist, onToggle }: ChecklistSectionProps) {
  const done = checklist.filter((item) => item.done).length

  return (
    <section className="card detail-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">
          Investigation checklist
          <span className="detail-section__count">
            {done}/{checklist.length}
          </span>
        </h2>
      </div>

      {GROUP_ORDER.map((group) => {
        const items = checklist.filter((item) => item.group === group)
        if (items.length === 0) return null
        return (
          <div key={group} className="checklist-group">
            <div className="checklist-group__title">{checklistGroupLabels[group]}</div>
            <ul className="checklist">
              {items.map((item) => (
                <li key={item.id} className="checklist__item">
                  <label className="checklist__label">
                    <input type="checkbox" checked={item.done} onChange={() => onToggle(item.id)} />
                    <span className={item.done ? 'checklist__text checklist__text--done' : 'checklist__text'}>
                      {item.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </section>
  )
}
