interface GuidedModeToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
}

export function GuidedModeToggle({ enabled, onChange }: GuidedModeToggleProps) {
  return (
    <label className="guided-toggle">
      <input
        type="checkbox"
        checked={enabled}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>Guided Analyst Mode</span>
    </label>
  )
}
