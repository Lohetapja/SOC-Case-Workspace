import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import type { SocCase } from '../types'
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
  type WorkspaceSnapshotExportType,
} from '../data/workspaceSnapshot'
import { AppearanceSettingsCard } from '../components/AppearanceSettingsCard'
import type { UseAppearanceSettings } from '../hooks/useAppearanceSettings'

interface SettingsPageProps {
  appearance: UseAppearanceSettings
}

/**
 * Data management: back up, restore, reset, and clear locally stored cases.
 * All data lives in browser localStorage; nothing is sent to a server.
 * Also hosts browser-local appearance preferences (kept out of workspace data).
 */
export function SettingsPage({ appearance }: SettingsPageProps) {
  const { cases } = useCases()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [storageWarning, setStorageWarning] = useState<string | null>(() => getStorageWarning())
  const [exportType, setExportType] = useState<WorkspaceSnapshotExportType>('whole-workspace')
  const [selectedCaseId, setSelectedCaseId] = useState(() => cases[0]?.id ?? '')
  const [selectedCaseIds, setSelectedCaseIds] = useState<string[]>(() =>
    cases[0] ? [cases[0].id] : [],
  )
  const [includeGraphLayouts, setIncludeGraphLayouts] = useState(true)
  const [includeDemoCases, setIncludeDemoCases] = useState(true)
  const [includeAppSettings, setIncludeAppSettings] = useState(true)

  const selectedExportIds = useMemo(() => {
    if (exportType === 'selected-case') return selectedCaseId ? [selectedCaseId] : []
    if (exportType === 'selected-cases') return selectedCaseIds
    return cases.map((socCase) => socCase.id)
  }, [cases, exportType, selectedCaseId, selectedCaseIds])

  function reloadAfterFeedback() {
    window.setTimeout(() => window.location.reload(), 900)
  }

  function handleExportSnapshot() {
    setError(null)
    setMessage(null)
    try {
      if (cases.length === 0) {
        setError('There are no cases to export yet.')
        return
      }
      if (exportType !== 'whole-workspace' && selectedExportIds.length === 0) {
        setError('Choose at least one case before exporting a selected-case snapshot.')
        return
      }

      const snapshot = buildWorkspaceSnapshot(cases, loadAllGraphLayouts(), {
        exportType,
        selectedCaseIds: selectedExportIds,
        includeGraphLayouts,
        includeDemoCases,
        includeAppSettings,
      })
      if (snapshot.cases.length === 0) {
        setError('No cases matched the current export options. Adjust the selected cases or include demo/sample cases.')
        return
      }

      const filename = workspaceSnapshotFilename(snapshot)
      const json = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      document.body.appendChild(anchor)
      anchor.click()
      document.body.removeChild(anchor)
      URL.revokeObjectURL(url)
      setMessage(`Export started: ${filename} (${snapshot.cases.length} case${snapshot.cases.length === 1 ? '' : 's'}).`)
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
        if (importedCases.length === 0) {
          throw new Error('The import file does not contain any cases.')
        }

        if (imported.kind === 'snapshot') {
          if (imported.snapshot.exportType === 'whole-workspace') {
            const ok = window.confirm(
              `Replace the current workspace with ${importedCases.length} case(s) and saved graph layouts from "${file.name}"? This cannot be undone.`,
            )
            if (!ok) {
              setMessage('Import canceled. Your current workspace was not changed.')
              return
            }
            persistCases(importedCases)
            replaceAllGraphLayouts(imported.snapshot.graphLayouts)
          } else {
            const ok = window.confirm(
              `Add or merge ${importedCases.length} selected case(s) from "${file.name}" into the current workspace? Cases with matching IDs will be replaced.`,
            )
            if (!ok) {
              setMessage('Import canceled. Your current workspace was not changed.')
              return
            }
            persistCases(mergeCasesById(cases, importedCases))
            replaceAllGraphLayouts({
              ...loadAllGraphLayouts(),
              ...imported.snapshot.graphLayouts,
            })
          }
        } else {
          if (importedCases.length === 1) {
            const ok = window.confirm(
              `Add or merge case "${importedCases[0].title}" from "${file.name}" into the current workspace? A case with the same ID will be replaced.`,
            )
            if (!ok) {
              setMessage('Import canceled. Your current workspace was not changed.')
              return
            }
            persistCases(mergeCasesById(cases, importedCases))
          } else {
            const ok = window.confirm(
              `Replace the current workspace with ${importedCases.length} case(s) from older case-only backup "${file.name}"? This cannot be undone.`,
            )
            if (!ok) {
              setMessage('Import canceled. Your current workspace was not changed.')
              return
            }
            persistCases(importedCases)
            clearAllGraphLayouts()
          }
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

  function toggleSelectedCase(caseId: string, checked: boolean) {
    setSelectedCaseIds((current) =>
      checked ? [...new Set([...current, caseId])] : current.filter((id) => id !== caseId),
    )
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
        <h1 className="page__title">Settings</h1>
        <p className="page__subtitle">
          Appearance preferences and data management — back up, restore, and reset your workspace
          safely.
        </p>
      </header>

      <AppearanceSettingsCard {...appearance} />

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
          <p className="data-management__help">
            Use full workspace export to replay an entire demo. Use selected case export when you
            want to share or preserve only one investigation.
          </p>
          <p className="data-management__safety">
            This project is designed for synthetic, sanitized, or training data. Do not import or
            export real sensitive investigation data into a public or shared browser environment.
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
              Download the whole workspace or selected case snapshots as replayable JSON. Full
              exports are best for demos; selected exports are best for preserving one
              investigation.
            </p>
            <div className="export-options" aria-label="Export options">
              <label className="form__label">
                Export scope
                <select
                  value={exportType}
                  onChange={(event) => setExportType(event.target.value as WorkspaceSnapshotExportType)}
                >
                  <option value="whole-workspace">Export whole workspace</option>
                  <option value="selected-case">Export selected case</option>
                  <option value="selected-cases">Export selected cases</option>
                </select>
              </label>

              {exportType === 'selected-case' && (
                <label className="form__label">
                  Case to export
                  <select
                    value={selectedCaseId || cases[0]?.id || ''}
                    onChange={(event) => setSelectedCaseId(event.target.value)}
                    disabled={cases.length === 0}
                  >
                    {cases.map((socCase) => (
                      <option key={socCase.id} value={socCase.id}>
                        {socCase.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {exportType === 'selected-cases' && (
                <fieldset className="export-options__cases">
                  <legend>Cases to export</legend>
                  {cases.map((socCase) => (
                    <label key={socCase.id} className="export-options__check">
                      <input
                        type="checkbox"
                        checked={selectedCaseIds.includes(socCase.id)}
                        onChange={(event) => toggleSelectedCase(socCase.id, event.target.checked)}
                      />
                      <span>{socCase.title}</span>
                    </label>
                  ))}
                </fieldset>
              )}

              <div className="export-options__toggles">
                <label className="export-options__check">
                  <input
                    type="checkbox"
                    checked={includeGraphLayouts}
                    onChange={(event) => setIncludeGraphLayouts(event.target.checked)}
                  />
                  <span>Include graph layout positions</span>
                </label>
                <label className="export-options__check">
                  <input
                    type="checkbox"
                    checked={includeDemoCases}
                    onChange={(event) => setIncludeDemoCases(event.target.checked)}
                  />
                  <span>Include demo/sample cases</span>
                </label>
                <label className="export-options__check">
                  <input
                    type="checkbox"
                    checked={includeAppSettings}
                    onChange={(event) => setIncludeAppSettings(event.target.checked)}
                  />
                  <span>Include templates/settings placeholders</span>
                </label>
              </div>
            </div>
          </div>
          <button type="button" className="btn data-action__btn" onClick={handleExportSnapshot}>
            Export snapshot
          </button>
        </div>

        <div className="data-action">
          <div>
            <p className="data-action__title">Import workspace snapshot</p>
            <p className="data-action__help">
              Load a workspace snapshot and restore cases plus graph layouts where possible.
              Whole-workspace snapshots replace current data after confirmation; selected-case
              snapshots and single-case JSON files are added or merged. Older multi-case JSON
              backups are still accepted.
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

function mergeCasesById(currentCases: SocCase[], importedCases: SocCase[]): SocCase[] {
  const importedIds = new Set(importedCases.map((socCase) => socCase.id))
  return [...importedCases, ...currentCases.filter((socCase) => !importedIds.has(socCase.id))]
}
