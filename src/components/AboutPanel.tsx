/** Short explainer that frames the project and its synthetic-data-only stance. */
export function AboutPanel() {
  return (
    <section className="card about" aria-labelledby="about-title">
      <h2 id="about-title" className="about__title">What this workspace does</h2>
      <p>
        SOC Case Workspace turns fragmented alert details into a structured,
        evidence-backed investigation that another analyst can review and defend.
      </p>
      <p>
        The workflow is: alert intake → evidence → timeline → analyst reasoning →
        findings → MITRE ATT&amp;CK → closure → quality review → Markdown report.
      </p>
      <ul>
        <li>Built for SOC Analyst, Blue Team, and DFIR learning and portfolio review</li>
        <li>Frontend-only — runs entirely in your browser</li>
        <li>No backend, no authentication, no external APIs</li>
        <li>Educational workspace using synthetic data only — not live operations</li>
      </ul>
    </section>
  )
}
