interface GuidedTipProps {
  children: string
}

export function GuidedTip({ children }: GuidedTipProps) {
  return (
    <p className="guided-tip" role="note">
      <span className="guided-tip__label">Analyst tip</span>
      {children}
    </p>
  )
}
