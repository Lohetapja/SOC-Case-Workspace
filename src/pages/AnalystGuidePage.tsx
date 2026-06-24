const guideCards = [
  {
    title: 'How to structure a SOC case',
    body:
      'Start with the alert, affected subject, severity, owner, and a short summary. Then collect evidence, build a timeline, record decisions, write findings, map ATT&CK, classify closure, and export the report.',
  },
  {
    title: 'How to write evidence notes',
    body:
      'Evidence should be factual: what was observed, where it came from, when it was observed, and why it matters. Avoid putting unsupported conclusions in evidence notes.',
  },
  {
    title: 'How to build a timeline',
    body:
      'Put events in chronological order. Include detection, suspected activity, analyst actions, containment, and closure checkpoints so a reviewer can follow the sequence.',
  },
  {
    title: 'How to write findings',
    body:
      'A finding is a conclusion, not a raw log. Link it to supporting evidence, include confidence, and explain what the evidence means.',
  },
  {
    title: 'How to map MITRE ATT&CK',
    body:
      'Map only behavior you can explain. Include technique ID, technique name, tactic, confidence, and rationale tied to the observed evidence or finding.',
  },
  {
    title: 'How to write closure rationale',
    body:
      'Closure should explain the final classification, what evidence supports it, what remains uncertain, and what action should happen next.',
  },
  {
    title: 'How to use this for labs ethically',
    body:
      'Use lab mode for sanctioned training and personal learning. Do not publish restricted answers, copyrighted lab material, real sensitive data, or spoiler-sensitive content without permission.',
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
          SOC Case Workspace is designed for synthetic, sanitized, or training data. Do not import
          real sensitive investigation data into a public or shared browser environment.
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
