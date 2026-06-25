import { useMemo, useState, type ReactNode } from 'react'
import { useCases } from '../hooks/useCases'
import {
  MIN_QUERY_LENGTH,
  SEARCH_GROUPS,
  searchCases,
  type SearchResult,
} from '../utils/caseSearch'

interface SearchPageProps {
  onOpenCase: (id: string) => void
}

/** Highlight every case-insensitive occurrence of `query` inside `text`. */
function Highlight({ text, query }: { text: string; query: string }): ReactNode {
  const needle = query.trim()
  if (needle.length < MIN_QUERY_LENGTH) return text
  const haystack = text.toLowerCase()
  const lowerNeedle = needle.toLowerCase()
  const parts: ReactNode[] = []
  let cursor = 0
  let key = 0
  while (cursor < text.length) {
    const index = haystack.indexOf(lowerNeedle, cursor)
    if (index === -1) {
      parts.push(text.slice(cursor))
      break
    }
    if (index > cursor) parts.push(text.slice(cursor, index))
    parts.push(
      <mark key={key++} className="search-mark">
        {text.slice(index, index + needle.length)}
      </mark>,
    )
    cursor = index + needle.length
  }
  return parts
}

/** Local-only search across all cases stored in this browser. */
export function SearchPage({ onOpenCase }: SearchPageProps) {
  const { cases } = useCases()
  const [query, setQuery] = useState('')

  const trimmed = query.trim()
  const tooShort = trimmed.length > 0 && trimmed.length < MIN_QUERY_LENGTH
  const active = trimmed.length >= MIN_QUERY_LENGTH

  const results = useMemo(() => searchCases(cases, query), [cases, query])
  const grouped = useMemo(
    () =>
      SEARCH_GROUPS.map((group) => ({
        ...group,
        items: results.filter((result) => result.type === group.type),
      })).filter((group) => group.items.length > 0),
    [results],
  )

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Search</h1>
        <p className="page__subtitle">
          Search runs locally in your browser across stored cases. No data is sent anywhere.
        </p>
      </header>

      <section className="card search-controls">
        <label className="form__label" htmlFor="case-search">
          Search local cases
        </label>
        <input
          id="case-search"
          type="search"
          className="form__input search-input"
          placeholder="Search local cases…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          autoFocus
          autoComplete="off"
        />
        <p className="search-safety">
          Search is local-only. It searches cases stored in this browser — no backend, API, or
          external search provider is used.
        </p>
      </section>

      {!active ? (
        <p className="cases-note">
          {tooShort
            ? `Type at least ${MIN_QUERY_LENGTH} characters to search.`
            : 'Start typing to search across case titles, evidence, timeline, decisions, findings, MITRE mappings, closure, recommendations, and lab notes.'}
        </p>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <p className="cases-note">No matches for “{trimmed}” in your local cases.</p>
        </div>
      ) : (
        <>
          <p className="search-count">
            {results.length} {results.length === 1 ? 'result' : 'results'} for “{trimmed}”
          </p>
          {grouped.map((group) => (
            <section key={group.type} className="search-group">
              <h2 className="search-group__title">
                {group.label}
                <span className="search-group__count">{group.items.length}</span>
              </h2>
              <ul className="search-results">
                {group.items.map((result) => (
                  <li key={result.id}>
                    <SearchResultButton result={result} query={trimmed} onOpenCase={onOpenCase} />
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </>
      )}
    </div>
  )
}

function SearchResultButton({
  result,
  query,
  onOpenCase,
}: {
  result: SearchResult
  query: string
  onOpenCase: (id: string) => void
}) {
  return (
    <button
      type="button"
      className="search-result"
      onClick={() => onOpenCase(result.caseId)}
      title={`Open case: ${result.caseTitle}`}
    >
      <div className="search-result__top">
        <span className="search-result__case">{result.caseTitle}</span>
        <span className="search-result__section chip">{result.section}</span>
      </div>
      <div className="search-result__title">
        <Highlight text={result.itemTitle} query={query} />
      </div>
      <p className="search-result__snippet">
        <Highlight text={result.snippet} query={query} />
      </p>
      <span className="search-result__open">Open case →</span>
    </button>
  )
}
