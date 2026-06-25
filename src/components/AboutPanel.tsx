/** Short explainer that frames the project and its synthetic-data-only stance. */
export function AboutPanel() {
  return (
    <section className="card about" aria-labelledby="about-title">
      <h2 id="about-title" className="about__title">What this workspace does</h2>
      <p>
        SOC Case Workspace is a local-first SOC case structuring workspace. It helps
        analysts turn selected or sanitized alert details into a case another person
        can review: what happened, what supports it, what remains uncertain, and what
        should happen next.
      </p>
      <p>
        The workflow is: alert intake - evidence - timeline - analyst reasoning -
        findings - MITRE ATT&amp;CK rationale - closure - quality review - Markdown report.
      </p>
      <ul>
        <li>Useful for juniors, mentors, senior reviewers, hiring managers, labs, and portfolio review</li>
        <li>Designed for synthetic, sanitized, or training data - not sensitive live investigations</li>
        <li>Runs entirely in your browser with localStorage persistence</li>
        <li>No backend, authentication, external APIs, cloud sync, telemetry, or live integrations</li>
        <li>Not a SIEM, EDR, SOAR, ticketing system, or production incident platform</li>
      </ul>
    </section>
  )
}
