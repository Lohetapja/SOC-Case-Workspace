const guideCards = [
  {
    title: 'How to structure a SOC case',
    body:
      'Start with the alert, affected subject, severity, owner, and short summary. Then connect evidence, timeline, decisions, findings, ATT&CK mapping, closure, and report output.',
  },
  {
    title: 'How to write evidence notes',
    body:
      'Keep evidence factual: what was observed, where it came from, when it was observed, and why it matters. Save conclusions for Findings.',
  },
  {
    title: 'How to build a timeline',
    body:
      'Use the timeline to explain sequence. Include detection, suspected activity, analyst actions, containment, and closure checkpoints.',
  },
  {
    title: 'How to use the Decision Journal',
    body:
      'Record the questions you asked, the answer or decision, and the rationale. Leave unresolved questions visible instead of hiding uncertainty.',
  },
  {
    title: 'How to write findings',
    body:
      'A finding is a conclusion backed by evidence. Link supporting artifacts, set confidence, and explain what the observations mean.',
  },
  {
    title: 'How to map MITRE ATT&CK with rationale',
    body:
      'Map behavior you can explain. Include technique ID, tactic, confidence, and a rationale tied to evidence or a finding.',
  },
  {
    title: 'How to write closure rationale',
    body:
      'Closure should state the classification, supporting evidence, remaining uncertainty, impact, and recommended next action.',
  },
  {
    title: 'How to use this for labs ethically',
    body:
      'Use lab mode for sanctioned training and personal learning. Do not publish restricted answers, copyrighted material, or spoiler-sensitive content without permission.',
  },
  {
    title: 'Why local-first matters',
    body:
      'The app stores data in your browser and avoids live integrations. That keeps the demo simple, offline-friendly, and lower risk for synthetic or sanitized practice data.',
  },
  {
    title: 'What this tool is not',
    body:
      'It is not a SIEM, EDR, SOAR, ticketing system, live connector, or production incident platform. It is a human-led case structuring and reporting workspace.',
  },
]

export function AnalystGuidePage() {
  return (
    <div className="page">
      <header className="page__header">
        <h1 className="page__title">Analyst Guide</h1>
        <p className="page__subtitle">
          Short local guidance for turning messy alerts into evidence-backed SOC case writeups.
        </p>
      </header>

      <section className="card guide-intro">
        <h2 className="guide-intro__title">Use this as a checklist, not a script.</h2>
        <p className="detail-text">
          SOC Case Workspace is designed for synthetic, sanitized, or training data. It
          helps structure analyst reasoning; it does not replace analyst judgment.
        </p>
      </section>

      <div className="guide-grid">
        {guideCards.map((card) => (
          <article key={card.title} className="card guide-card">
            <h2 className="guide-card__title">{card.title}</h2>
            <p className="guide-card__body">{card.body}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
