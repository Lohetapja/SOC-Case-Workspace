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
        It models how a Security Operations Center analyst structures an
        investigation — from alert intake through evidence, timeline, and
        decisions, to an ATT&amp;CK-mapped, exportable report. It is not a SIEM,
        EDR, or live security tool, and it makes no network calls.
      </p>
      <ul>
        <li>Frontend-only — runs entirely in your browser</li>
        <li>No backend, no authentication, no external APIs</li>
        <li>No real alerts, hosts, IPs, or customer data — ever</li>
      </ul>
    </section>
  )
}
