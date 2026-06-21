/** Minimal app footer: project framing + author links. */
export function AppFooter() {
  return (
    <footer className="footer">
      <span className="footer__meta">Educational portfolio project · Synthetic data only</span>
      <span className="footer__links">
        <span>Built by Riivo Maadla</span>
        <a
          href="https://www.linkedin.com/in/riivo-m-43530a154/"
          target="_blank"
          rel="noreferrer"
        >
          LinkedIn
        </a>
        <a href="https://github.com/Lohetapja" target="_blank" rel="noreferrer">
          GitHub
        </a>
      </span>
    </footer>
  )
}
