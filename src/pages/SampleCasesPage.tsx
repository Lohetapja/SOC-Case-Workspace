import { useState } from 'react'
import { useCases } from '../hooks/useCases'
import { demoCases } from '../data/demoCases'
import { sampleLibrary } from '../data/sampleLibrary'

const WALKTHROUGH_STEPS = [
  'Open a sample case from the library below.',
  'Review the Evidence collected for the case.',
  'Check the Timeline to see the sequence of events.',
  'Read the Analyst questions / decision journal.',
  'Inspect the Findings and the MITRE ATT&CK mapping.',
  'Check Case Quality Review for unresolved gaps and report readiness.',
  'Open the Case Graph, then switch to the Artifact Map.',
  'Export the Markdown investigation report from Reports.',
]

interface SampleCasesPageProps {
  onOpenCase: (id: string) => void
}

/** Guided demo: a small library of fully-populated synthetic sample cases. */
export function SampleCasesPage({ onOpenCase }: SampleCasesPageProps) {
  const { cases, addSampleCase } = useCases()
  const [message, setMessage] = useState<string | null>(null)

  function handleAdd(caseId: string, name: string) {
    const sample = demoCases.find((socCase) => socCase.id === caseId)
    if (!sample) {
      setMessage(`Could not load "${name}". Reset demo data in Settings and try again.`)
      return
    }
    const result = addSampleCase(sample)
    setMessage(
      result === 'added'
        ? `Added "${name}" to your workspace — open it below.`
        : `"${name}" is already in your workspace.`,
    )
  }

  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Sample cases</h1>
        <p className="page__subtitle">
          A guided demo library of fully-populated synthetic cases. Load one and explore how an
          investigation is structured end to end.
        </p>
      </header>

      <section className="card demo-walkthrough">
        <h2 className="demo-walkthrough__title">How to explore this demo</h2>
        <ol className="demo-walkthrough__steps">
          {WALKTHROUGH_STEPS.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>

      {message && <p className="sample-message" role="status" aria-live="polite">{message}</p>}

      <div className="sample-list">
        {sampleLibrary.map((entry) => {
          const sample = demoCases.find((socCase) => socCase.id === entry.caseId)
          if (!sample) return null
          const inWorkspace = cases.some((socCase) => socCase.id === entry.caseId)
          const stats = [
            `Evidence ${sample.evidence.length}`,
            `Timeline ${sample.timeline.length}`,
            `Questions ${sample.analystQuestions.length}`,
            `Findings ${sample.findings.length}`,
            `ATT&CK ${sample.mitreMappings.length}`,
            sample.closure?.verdict ? 'Closure ✓' : 'Closure —',
          ]
          return (
            <article key={entry.caseId} className="sample-card">
              <div className="sample-card__body">
                <h3 className="sample-card__title">{entry.name}</h3>
                <p className="sample-card__summary">{sample.summary}</p>
                <div className="sample-card__stats">
                  {stats.map((stat) => (
                    <span key={stat} className="chip">{stat}</span>
                  ))}
                </div>
              </div>
              <div className="sample-card__actions">
                {inWorkspace ? (
                  <>
                    <span className="sample-card__badge">✓ In your workspace</span>
                    <button type="button" className="btn" onClick={() => onOpenCase(entry.caseId)}>
                      Open case →
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleAdd(entry.caseId, entry.name)}
                  >
                    Add to workspace
                  </button>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
