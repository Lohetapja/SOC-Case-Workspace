/** Short explainer that frames the project and its synthetic-data-only stance. */
export function AboutPanel() {
  return (
    <section className="card about" aria-labelledby="about-title">
      <h2 id="about-title" className="about__title">About this project</h2>
      <p>
        This is an educational SOC investigation workspace using <strong>synthetic
        data only</strong>.
      </p>
      <p>
        It models how a Security Operations Center analyst turns an alert into a
        defensible investigation: collect evidence, reconstruct the timeline,
        document decisions, form findings, map behavior to ATT&amp;CK, classify the
        case, review its quality, and export a Markdown report.
      </p>
      <ul>
        <li>Frontend-only — runs entirely in your browser</li>
        <li>No backend, no authentication, no external APIs</li>
        <li>No real alerts, hosts, IPs, or customer data — ever</li>
        <li>Designed for SOC, Blue Team, and DFIR learning — not live operations</li>
      </ul>
    </section>
  )
}
