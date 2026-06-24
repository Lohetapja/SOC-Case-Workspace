import { useEffect, useState, type FormEvent } from 'react'
import type { LabDisclosureState, LabMetadata, LabWriteupStatus } from '../types'
import type { LabMetadataInput } from '../data/casesStore'
import { labDisclosureStateLabels, labWriteupStatusLabels } from '../data/labels'
import { isAllowedValue } from '../utils/formValidation'

const writeupStatusOptions = Object.keys(labWriteupStatusLabels) as LabWriteupStatus[]
const disclosureOptions = Object.keys(labDisclosureStateLabels) as LabDisclosureState[]

interface LabTrainingSectionProps {
  lab?: LabMetadata
  onSave: (input: LabMetadataInput) => void
}

export function LabTrainingSection({ lab, onSave }: LabTrainingSectionProps) {
  const [editing, setEditing] = useState(false)
  const [enabled, setEnabled] = useState(lab?.enabled ?? false)
  const [platform, setPlatform] = useState(lab?.platform ?? '')
  const [labName, setLabName] = useState(lab?.labName ?? '')
  const [scenarioSummary, setScenarioSummary] = useState(lab?.scenarioSummary ?? '')
  const [toolsUsed, setToolsUsed] = useState(lab?.toolsUsed ?? '')
  const [learningNotes, setLearningNotes] = useState(lab?.learningNotes ?? '')
  const [writeupStatus, setWriteupStatus] = useState<LabWriteupStatus>(
    lab?.writeupStatus ?? 'not_started',
  )
  const [publicWriteupAllowed, setPublicWriteupAllowed] = useState<LabDisclosureState>(
    lab?.publicWriteupAllowed ?? 'unknown',
  )
  const [spoilerSensitive, setSpoilerSensitive] = useState<LabDisclosureState>(
    lab?.spoilerSensitive ?? 'unknown',
  )
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setEnabled(lab?.enabled ?? false)
    setPlatform(lab?.platform ?? '')
    setLabName(lab?.labName ?? '')
    setScenarioSummary(lab?.scenarioSummary ?? '')
    setToolsUsed(lab?.toolsUsed ?? '')
    setLearningNotes(lab?.learningNotes ?? '')
    setWriteupStatus(lab?.writeupStatus ?? 'not_started')
    setPublicWriteupAllowed(lab?.publicWriteupAllowed ?? 'unknown')
    setSpoilerSensitive(lab?.spoilerSensitive ?? 'unknown')
  }, [lab])

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      !isAllowedValue(writeupStatus, writeupStatusOptions) ||
      !isAllowedValue(publicWriteupAllowed, disclosureOptions) ||
      !isAllowedValue(spoilerSensitive, disclosureOptions)
    ) {
      setError('Choose valid lab status and sharing values.')
      return
    }
    onSave({
      enabled,
      platform,
      labName,
      scenarioSummary,
      toolsUsed,
      learningNotes,
      writeupStatus,
      publicWriteupAllowed,
      spoilerSensitive,
    })
    setError(null)
    setEditing(false)
  }

  return (
    <section className="card detail-section lab-section">
      <div className="detail-section__head">
        <h2 className="detail-section__title">Lab / training mode</h2>
        {!editing && (
          <button type="button" className="btn btn--secondary btn--sm" onClick={() => setEditing(true)}>
            {lab?.enabled ? 'Edit lab mode' : 'Set lab mode'}
          </button>
        )}
      </div>

      <p className="lab-section__safety">
        Lab mode is for training and personal learning. Do not publish restricted lab answers,
        copyrighted lab material, or spoiler-sensitive content without permission.
      </p>

      {editing ? (
        <form className="form lab-form" onSubmit={handleSubmit} aria-label="Lab training metadata">
          <label className="form__check">
            <input
              type="checkbox"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
            <span>Mark this case as a lab / training case</span>
          </label>

          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="lab-platform">Lab platform</label>
              <input
                id="lab-platform"
                className="form__input"
                value={platform}
                onChange={(event) => setPlatform(event.target.value)}
                placeholder="BTLO, TryHackMe, CyberDefenders, LetsDefend..."
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="lab-name">Lab name</label>
              <input
                id="lab-name"
                className="form__input"
                value={labName}
                onChange={(event) => setLabName(event.target.value)}
                placeholder="Synthetic lab title"
              />
            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="lab-scenario">Scenario summary</label>
            <textarea
              id="lab-scenario"
              className="form__textarea"
              value={scenarioSummary}
              onChange={(event) => setScenarioSummary(event.target.value)}
              placeholder="Short sanitized scenario summary."
            />
          </div>

          <div className="form__row--inline">
            <div className="form__field">
              <label className="form__label" htmlFor="lab-writeup">Writeup status</label>
              <select
                id="lab-writeup"
                className="form__select"
                value={writeupStatus}
                onChange={(event) => setWriteupStatus(event.target.value as LabWriteupStatus)}
              >
                {writeupStatusOptions.map((value) => (
                  <option key={value} value={value}>{labWriteupStatusLabels[value]}</option>
                ))}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="lab-public">Public writeup allowed</label>
              <select
                id="lab-public"
                className="form__select"
                value={publicWriteupAllowed}
                onChange={(event) => setPublicWriteupAllowed(event.target.value as LabDisclosureState)}
              >
                {disclosureOptions.map((value) => (
                  <option key={value} value={value}>{labDisclosureStateLabels[value]}</option>
                ))}
              </select>
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="lab-spoiler">Spoiler-sensitive</label>
              <select
                id="lab-spoiler"
                className="form__select"
                value={spoilerSensitive}
                onChange={(event) => setSpoilerSensitive(event.target.value as LabDisclosureState)}
              >
                {disclosureOptions.map((value) => (
                  <option key={value} value={value}>{labDisclosureStateLabels[value]}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="lab-tools">Tools used</label>
            <textarea
              id="lab-tools"
              className="form__textarea"
              value={toolsUsed}
              onChange={(event) => setToolsUsed(event.target.value)}
              placeholder="Tools used during the lab, if useful."
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="lab-notes">Learning notes</label>
            <textarea
              id="lab-notes"
              className="form__textarea"
              value={learningNotes}
              onChange={(event) => setLearningNotes(event.target.value)}
              placeholder="What you practiced or learned. Keep restricted answers out."
            />
          </div>

          {error && <p className="form__error" role="alert">{error}</p>}

          <div className="form__actions">
            <button type="submit" className="btn">Save lab metadata</button>
            <button type="button" className="btn btn--secondary" onClick={() => { setError(null); setEditing(false) }}>
              Cancel
            </button>
          </div>
        </form>
      ) : lab?.enabled ? (
        <div className="lab-section__summary">
          <div className="case-card__meta">
            {lab.platform && <span className="chip">{lab.platform}</span>}
            {lab.labName && <span className="chip">{lab.labName}</span>}
            <span className="chip">
              Writeup: {labWriteupStatusLabels[lab.writeupStatus ?? 'not_started']}
            </span>
            <span className="chip">
              Public writeup: {labDisclosureStateLabels[lab.publicWriteupAllowed ?? 'unknown']}
            </span>
            <span className="chip">
              Spoiler-sensitive: {labDisclosureStateLabels[lab.spoilerSensitive ?? 'unknown']}
            </span>
          </div>
          {lab.scenarioSummary && <p className="detail-text"><strong>Scenario:</strong> {lab.scenarioSummary}</p>}
          {lab.toolsUsed && <p className="detail-text"><strong>Tools used:</strong> {lab.toolsUsed}</p>}
          {lab.learningNotes && <p className="detail-text"><strong>Learning notes:</strong> {lab.learningNotes}</p>}
        </div>
      ) : (
        <p className="detail-empty">
          Not marked as a lab case. Enable this only for sanctioned training, personal learning,
          or sanitized practice investigations.
        </p>
      )}
    </section>
  )
}
