import { useCallback, useEffect, useState } from 'react'
import type { SocCase } from '../types'
import { createCase, loadCases, persistCases, type NewCaseInput } from '../data/casesStore'

/**
 * Stateful access to the case collection, backed by localStorage. Seeds from the
 * demo cases on first run and persists on every change. Scoped to the component
 * that uses it (single-user, single-tab MVP).
 */
export function useCases() {
  const [cases, setCases] = useState<SocCase[]>(() => loadCases())

  useEffect(() => {
    persistCases(cases)
  }, [cases])

  const addCase = useCallback((input: NewCaseInput): SocCase => {
    const created = createCase(input)
    setCases((prev) => [created, ...prev])
    return created
  }, [])

  const removeCase = useCallback((id: string) => {
    setCases((prev) => prev.filter((socCase) => socCase.id !== id))
  }, [])

  return { cases, addCase, removeCase }
}
