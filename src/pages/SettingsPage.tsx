import { useRef, useState, type ChangeEvent } from 'react'
import { useCases } from '../hooks/useCases'
import {
  buildCasesExport,
  casesExportFilename,
  clearStoredCases,
  parseCasesImport,
  persistCases,
  resetToDemoCases,
} from '../data/casesStore'
import { clearAllGraphLayouts } from '../utils/graphLayout'

/**
 * Data management: back up, restore, reset, and clear the locally stored cases.
 * All data lives in the browser's localStorage — nothing is sent anywhere.
 */
export function SettingsPage() {
  const { cases } = useCases()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)

  function handleExport() {
    setError(null)
    const json = JSON.stringify(buildCasesExport(cases), null, 2)
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = casesExportFilename()
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    setError(null)
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const imported = parseCasesImport(JSON.parse(String(reader.result)))
        const ok = window.confirm(
          `Replace all current cases with ${imported.length} case(s) from "${file.name}"? This cannot be undone.`,
        )
        if (!ok) return
        persistCases(imported)
        window.location.reload()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not import this file.')
      }
    }
    reader.onerror = () => setError('Could not read the selected file.')
    reader.readAsText(file)
  }

  function handleReset() {
    setError(null)
    if (!window.confirm('Reset to the original synthetic demo cases? This replaces your current cases.')) {
      return
    }
    resetToDemoCases()
    window.location.reload()
  }

  function handleClear() {
    setError(null)
    const ok = window.confirm(
      'Clear all locally saved data? Your cases and saved graph layouts will be removed, and the app will reload with the demo cases.',
    )
    if (!ok) return
    clearStoredCases()
    clearAllGraphLayouts()
    window.location.reload()
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Settings</h1>
        <p className="page__subtitle">
          Back up, restore, and reset your cases. All data is stored in your browser
          (localStorage) only — nothing is uploaded anywhere. Synthetic data only.
        </p>
      </header>

      <section className="card">
        <div className="data-action">
          <div>
            <p className="data-action__title">Export cases</p>
            <p className="data-action__help">
              Download all {cases.length} current case{cases.length === 1 ? '' : 's'} as a JSON
              backup file.
            </p>
          </div>
          <button type="button" className="btn data-action__btn" onClick={handleExport}>
            Export cases
          </button>
        </div>

        <div className="data-action">
          <div>
            <p className="data-action__title">Import cases</p>
            <p className="data-action__help">
              Load cases from a JSON backup. This <strong>replaces</strong> all current cases
              (you'll be asked to confirm first).
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary data-action__btn"
            onClick={() => {
              setError(null)
              fileInputRef.current?.click()
            }}
          >
            Import cases
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
        </div>

        <div className="data-action">
          <div>
            <p className="data-action__title">Reset demo data</p>
            <p className="data-action__help">
              Restore the original synthetic demo / sample cases. Useful for getting the live demo
              back to its starting state.
            </p>
          </div>
          <button type="button" className="btn btn--secondary data-action__btn" onClick={handleReset}>
            Reset demo data
          </button>
        </div>

        <div className="data-action">
          <div>
            <p className="data-action__title">Clear local data</p>
            <p className="data-action__help">
              Remove all locally saved cases and graph layouts. The app reloads and re-seeds the
              demo cases.
            </p>
          </div>
          <button type="button" className="btn btn--danger data-action__btn" onClick={handleClear}>
            Clear local data
          </button>
        </div>

        {error && <p className="form__error data-action__error">Import failed: {error}</p>}
      </section>
    </div>
  )
}
