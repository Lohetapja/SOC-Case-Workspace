import type { UseAppearanceSettings } from '../hooks/useAppearanceSettings'
import type {
  Contrast,
  Density,
  TextSize,
  ThemePreference,
  WorkspaceWidth,
} from '../utils/appearanceSettings'

interface OptionGroupProps<T extends string> {
  label: string
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  hint?: string
}

/** Accessible segmented radio group (keyboard-navigable, clear selected state). */
function OptionGroup<T extends string>({ label, name, value, options, onChange, hint }: OptionGroupProps<T>) {
  return (
    <fieldset className="appearance-group">
      <legend className="appearance-group__label">{label}</legend>
      <div className="appearance-options">
        {options.map((option) => (
          <label
            key={option.value}
            className={`appearance-option${value === option.value ? ' appearance-option--active' : ''}`}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
      {hint && <p className="appearance-group__hint">{hint}</p>}
    </fieldset>
  )
}

/** The "Appearance" card for Settings — browser-local display preferences only. */
export function AppearanceSettingsCard({ settings, update, reset }: UseAppearanceSettings) {
  return (
    <section className="card appearance-card" aria-labelledby="appearance-title">
      <h2 id="appearance-title" className="detail-section__title">Appearance</h2>
      <p className="appearance-subtitle">
        Display preferences for this browser only. These settings do not affect workspace data or
        exports.
      </p>

      <div className="appearance-grid">
        <OptionGroup<ThemePreference>
          label="Theme"
          name="appearance-theme"
          value={settings.theme}
          onChange={(value) => update('theme', value)}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'light', label: 'Light' },
            { value: 'system', label: 'System' },
          ]}
          hint="System follows your browser / OS light or dark preference."
        />

        <OptionGroup<Density>
          label="Density"
          name="appearance-density"
          value={settings.density}
          onChange={(value) => update('density', value)}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
          hint="Compact tightens spacing in cards, lists, and forms."
        />

        <OptionGroup<TextSize>
          label="Text size"
          name="appearance-text-size"
          value={settings.textSize}
          onChange={(value) => update('textSize', value)}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'normal', label: 'Normal' },
            { value: 'large', label: 'Large' },
          ]}
        />

        <OptionGroup<Contrast>
          label="High contrast"
          name="appearance-contrast"
          value={settings.contrast}
          onChange={(value) => update('contrast', value)}
          options={[
            { value: 'normal', label: 'Off' },
            { value: 'high', label: 'On' },
          ]}
          hint="Strengthens text, borders, and focus outlines."
        />

        <OptionGroup<WorkspaceWidth>
          label="Workspace width"
          name="appearance-width"
          value={settings.workspaceWidth}
          onChange={(value) => update('workspaceWidth', value)}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'wide', label: 'Wide' },
            { value: 'full', label: 'Full' },
          ]}
          hint="Wide / Full give table and visual views more horizontal space."
        />

        <OptionGroup<Density>
          label="Dashboard density"
          name="appearance-dashboard-density"
          value={settings.dashboardDensity}
          onChange={(value) => update('dashboardDensity', value)}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
          hint="Affects Overview / dashboard-style cards."
        />
      </div>

      <div className="appearance-actions">
        <button type="button" className="btn btn--secondary btn--sm" onClick={reset}>
          Reset appearance
        </button>
      </div>

      <p className="appearance-group__hint">
        Display preferences are stored in this browser only and are not part of workspace data or
        exports.
      </p>
    </section>
  )
}
