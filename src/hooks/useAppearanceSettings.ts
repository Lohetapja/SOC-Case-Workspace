import { useCallback, useEffect, useState } from 'react'
import {
  applyAppearance,
  DEFAULT_APPEARANCE,
  loadAppearance,
  saveAppearance,
  type AppearanceSettings,
} from '../utils/appearanceSettings'

/**
 * Stateful access to the browser-local appearance preferences. Applies them to
 * <html> and persists on every change, and (when theme = system) re-applies when
 * the OS colour-scheme changes. Single source of truth; mount once high in the app.
 */
export function useAppearanceSettings() {
  const [settings, setSettings] = useState<AppearanceSettings>(() => loadAppearance())

  useEffect(() => {
    applyAppearance(settings)
    saveAppearance(settings)
  }, [settings])

  // Follow the OS preference live while theme is "system".
  useEffect(() => {
    if (settings.theme !== 'system') return
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => applyAppearance(settings)
    media.addEventListener('change', handleChange)
    return () => media.removeEventListener('change', handleChange)
  }, [settings])

  const update = useCallback(
    <K extends keyof AppearanceSettings>(key: K, value: AppearanceSettings[K]) => {
      setSettings((current) => ({ ...current, [key]: value }))
    },
    [],
  )

  const reset = useCallback(() => setSettings(DEFAULT_APPEARANCE), [])

  return { settings, update, reset }
}

export type UseAppearanceSettings = ReturnType<typeof useAppearanceSettings>
