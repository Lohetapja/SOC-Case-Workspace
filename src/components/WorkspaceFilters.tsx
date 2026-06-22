export interface FilterSelectConfig {
  id: string
  value: string
  onChange: (value: string) => void
  allLabel: string
  options: { value: string; label: string }[]
}

interface WorkspaceFiltersProps {
  searchPlaceholder: string
  search: string
  onSearch: (value: string) => void
  selects: FilterSelectConfig[]
}

/** Shared search + dropdown filter bar for the cross-case workspace pages. */
export function WorkspaceFilters({ searchPlaceholder, search, onSearch, selects }: WorkspaceFiltersProps) {
  return (
    <div className="filters">
      <input
        className="form__input filters__search"
        type="search"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        aria-label={searchPlaceholder}
      />
      {selects.map((select) => (
        <select
          key={select.id}
          className="form__select"
          value={select.value}
          onChange={(event) => select.onChange(event.target.value)}
          aria-label={select.allLabel}
        >
          <option value="all">{select.allLabel}</option>
          {select.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ))}
    </div>
  )
}
