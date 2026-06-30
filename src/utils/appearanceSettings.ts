import { readJSON, removeKey, writeJSON } from './storage'

/**
 * Browser-local appearance/display preferences. These are NOT investigation data:
 * they live under their own localStorage key and are never part of case
 * export/import, reports, or read-only HTML exports. They only change how the app
 * looks in the current browser.
 */

export type ThemePreference = 'dark' | 'light' | 'system'
export type Density = 'comfortable' | 'compact'
export type TextSize = 'small' | 'normal' | 'large'
export type Contrast = 'normal' | 'high'
export type WorkspaceWidth = 'comfortable' | 'wide' | 'full'

export interface AppearanceSettings {
  theme: ThemePreference
  density: Density
  textSize: TextSize
  contrast: Contrast
  workspaceWidth: WorkspaceWidth
  dashboardDensity: Density
}

export const DEFAULT_APPEARANCE: AppearanceSettings = {
  theme: 'system',
  density: 'comfortable',
  textSize: 'normal',
  contrast: 'normal',
  workspaceWidth: 'comfortable',
  dashboardDensity: 'comfortable',
}

/** Dedicated key, separate from `:cases` so it never enters workspace exports. */
const STORAGE_KEY = 'soc-case-workspace:appearance'

export function loadAppearance(): AppearanceSettings {
  const stored = readJSON<Partial<AppearanceSettings>>(STORAGE_KEY, {})
  // Merge over defaults so missing/new keys stay valid.
  return { ...DEFAULT_APPEARANCE, ...stored }
}

export function saveAppearance(settings: AppearanceSettings): void {
  writeJSON(STORAGE_KEY, settings)
}

export function clearAppearance(): void {
  removeKey(STORAGE_KEY)
}

/** Resolve the effective light/dark theme, following the OS when set to system. */
export function resolveTheme(theme: ThemePreference): 'dark' | 'light' {
  if (theme === 'system') {
    const prefersDark =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return theme
}

/** Apply preferences as data-attributes on <html> so CSS can react globally. */
export function applyAppearance(settings: AppearanceSettings): void {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.setAttribute('data-theme', resolveTheme(settings.theme))
  root.setAttribute('data-density', settings.density)
  root.setAttribute('data-text-size', settings.textSize)
  root.setAttribute('data-contrast', settings.contrast)
  root.setAttribute('data-workspace-width', settings.workspaceWidth)
  root.setAttribute('data-dashboard-density', settings.dashboardDensity)
}
