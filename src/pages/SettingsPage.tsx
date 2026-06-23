import { useRef, useState, type ChangeEvent } from 'react'
import { useCases } from '../hooks/useCases'
import {
  clearStorageWarning,
  clearStoredCases,
  getStorageWarning,
  persistCases,
  resetToDemoCases,
} from '../data/casesStore'
import {
  clearAllGraphLayouts,
  loadAllGraphLayouts,
  replaceAllGraphLayouts,
} from '../utils/graphLayout'
import {
  buildWorkspaceSnapshot,
  parseWorkspaceImport,
  workspaceSnapshotFilename,
} from '../data/workspaceSnapshot'

/**
 * Data management: back up, restore, reset, and clear locally stored cases.
 * All data lives in browser localStorage; nothing is sent to a server.
 */
export function SettingsPage() {
  const { cases } = useCases()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(() => getStorageWarning())

  function reloadAfterFeedback() {
    window.setTimeout(() => window.location.reload(), 900)
  }

  function handleExportSnapshot() {
    setError(null)
    setMessage(null)
    try {
      const filename = workspaceSnapshotFilename()
      const json = JSON.stringify(buildWorkspaceSnapshot(cases, loadAllGraphLayouts()), null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      setMessage(`Export started: ${filename}`)
    } catch {
      setError('Could not create the workspace snapshot. Your local data was not changed.')
    }
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    setError(null)
    setMessage(null)
    const file = event.target.files?.[0]
    event.target.value = '' // allow re-selecting the same file
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        let parsed: unknown
        try {
          parsed = JSON.parse(String(reader.result))
        } catch {
          throw new Error('The selected file is not valid JSON.')
        }

        const imported = parseWorkspaceImport(parsed)
        const importedCases = imported.kind === 'snapshot' ? imported.snapshot.cases : imported.cases
        const importLabel =
          imported.kind === 'snapshot'
            ? `${importedCases.length} case(s) and saved graph layouts`
            : `${importedCases.length} case(s) from an older case-only backup`
        const ok = window.confirm(
          `Replace the current workspace with ${importLabel} from "${file.name}"? This cannot be undone.`,
        )
        if (!ok) {
          setMessage('Import canceled. Your current workspace was not changed.')
          return
        }

        persistCases(importedCases)
        if (imported.kind === 'snapshot') {
          replaceAllGraphLayouts(imported.snapshot.graphLayouts)
        } else {
          clearAllGraphLayouts()
        }
        clearStorageWarning()
        setStorageWarning(null)
        setMessage(`Imported workspace data from "${file.name}". Reloading workspace...`)
        reloadAfterFeedback()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not import this file.')
      }
    }
    reader.onerror = () => setError('Could not read the selected file.')
    reader.readAsText(file)
  }

  function handleReset() {
    setError(null)
    setMessage(null)
    const ok = window.confirm(
      'Reset to the original synthetic demo cases? This replaces your current cases and saved graph layouts. Export a backup first if needed. This cannot be undone.',
    )
    if (!ok) return

    resetToDemoCases()
    clearAllGraphLayouts()
    setMessage('Demo data restored. Reloading workspace...')
    clearStorageWarning()
    setStorageWarning(null)
    reloadAfterFeedback()
  }

  function handleClear() {
    setError(null)
    setMessage(null)
    const ok = window.confirm(
      'Clear all locally saved data? Your cases and graph layouts will be removed, then the app will reload with fresh demo cases. Export a backup first if needed. This cannot be undone.',
    )
    if (!ok) return

    clearStoredCases()
    clearAllGraphLayouts()
    clearStorageWarning()
    setStorageWarning(null)
    setMessage('Local data cleared. Reloading with fresh demo cases...')
    reloadAfterFeedback()
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Settings / Data Management</h1>
        <p className="page__subtitle">Back up, restore, and reset your workspace safely.</p>
      </header>

      <section className="card data-management">
        <div className="data-management__intro">
          <h2 className="data-management__title">Local browser storage</h2>
          <p className="data-management__help">
            SOC Case Workspace stores data locally in your browser using localStorage. No data is
            sent to a server. Export a workspace snapshot before importing, resetting, or clearing
            data.
          </p>
          <p className="data-management__help">
            Workspace snapshots let you save the current investigation state and load it later.
            This is useful for demos, training, portfolio review, and replaying a completed case.
          </p>
          <p className="data-management__safety">
            Do not export real sensitive investigation data. This portfolio demo is designed for
            synthetic data.
          </p>
        </div>

        {message && <p className="action-feedback" role="status">{message}</p>}
        {storageWarning && (
          <div className="data-management__warning" role="alert">
            <p>{storageWarning}</p>
            <button
              type="button"
              className="btn btn--secondary btn--sm"
              onClick={() => {
                clearStorageWarning()
                setStorageWarning(null)
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        {error && <p className="form__error data-action__error" role="alert">Action failed: {error}</p>}

        {cases.length === 0 && (
          <p className="data-management__empty">
            No cases are currently stored in this browser. Use Reset demo data to restore the guided
            sample cases, or create a new case from the Cases page.
          </p>
        )}

        <h3 className="data-management__section-title">Backup and restore</h3>

        <div className="data-action">
          <div>
            <p className="data-action__title">Export workspace snapshot</p>
            <p className="data-action__help">
              Download all {cases.length} current case{cases.length === 1 ? '' : 's'}, saved Case
              Graph node positions, and app-level settings as one replayable JSON snapshot.
            </p>
          </div>
          <button type="button" className="btn data-action__btn" onClick={handleExportSnapshot}>
            Export snapshot
          </button>
        </div>

        <div className="data-action">
          <div>
            <p className="data-action__title">Import workspace snapshot</p>
            <p className="data-action__help">
              Load a workspace snapshot and restore cases plus graph layouts where possible. Older
              case-only JSON backups are still accepted. Import <strong>replaces</strong> current
              local workspace data after validation and confirmation.
            </p>
          </div>
          <button
            type="button"
            className="btn btn--secondary data-action__btn"
            onClick={() => {
              setError(null)
              setMessage(null)
              fileInputRef.current?.click()
            }}
          >
            Import snapshot
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImportFile}
          />
        </div>

        <h3 className="data-management__section-title">Demo recovery</h3>

        <div className="data-action">
          <div>
            <p className="data-action__title">Reset demo data</p>
            <p className="data-action__help">
              Restore the original synthetic demo and sample cases. Useful for getting the live demo
              back to its starting state.
            </p>
          </div>
          <button type="button" className="btn btn--secondary data-action__btn" onClick={handleReset}>
            Reset demo data
          </button>
        </div>

        <h3 className="data-management__section-title data-management__section-title--danger">
          Danger zone
        </h3>

        <div className="data-action">
          <div>
            <p className="data-action__title">Clear local data</p>
            <p className="data-action__help">
              Remove locally saved cases and graph layouts. The app reloads and re-seeds the demo
              cases.
            </p>
          </div>
          <button type="button" className="btn btn--danger data-action__btn" onClick={handleClear}>
            Clear local data
          </button>
        </div>
      </section>
    </div>
  )
}
