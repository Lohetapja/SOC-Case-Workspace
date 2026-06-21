/**
 * SOC Case Workspace mark: a minimal shield with three connected nodes —
 * evoking SOC defense + the relationship/investigation theme. Pure inline SVG,
 * no external image.
 */
export function Logo() {
  return (
    <svg
      className="logo__mark"
      viewBox="0 0 32 32"
      role="img"
      aria-label="SOC Case Workspace logo"
    >
      <path
        d="M16 3 L27 7 V15.5 C27 22 22 26.5 16 29 C10 26.5 5 22 5 15.5 V7 Z"
        fill="#2563eb"
      />
      <g stroke="#ffffff" strokeWidth="1.1" strokeOpacity="0.85">
        <line x1="16" y1="11.5" x2="12" y2="19" />
        <line x1="16" y1="11.5" x2="20" y2="19" />
        <line x1="12" y1="19" x2="20" y2="19" />
      </g>
      <g fill="#ffffff">
        <circle cx="16" cy="11.5" r="2" />
        <circle cx="12" cy="19" r="2" />
        <circle cx="20" cy="19" r="2" />
      </g>
    </svg>
  )
}
