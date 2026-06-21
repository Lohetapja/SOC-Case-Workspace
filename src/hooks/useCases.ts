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

  /** Add a pre-built case (e.g. a sample) unless one with the same id exists.
   *  Returns whether it was added or already present. */
  const addSampleCase = useCallback(
    (sample: SocCase): 'added' | 'exists' => {
      if (cases.some((socCase) => socCase.id === sample.id)) return 'exists'
      setCases((prev) =>
        prev.some((socCase) => socCase.id === sample.id) ? prev : [sample, ...prev],
      )
      return 'added'
    },
    [cases],
  )

  /** Apply `updater` to one case and stamp `updatedAt`. The basis for editing
   *  a case's sections (evidence, and later timeline, findings, etc.). */
  const updateCase = useCallback((id: string, updater: (socCase: SocCase) => SocCase) => {
    setCases((prev) =>
      prev.map((socCase) =>
        socCase.id === id
          ? { ...updater(socCase), updatedAt: new Date().toISOString() }
          : socCase,
      ),
    )
  }, [])

  return { cases, addCase, addSampleCase, removeCase, updateCase }
}
