import { readJSON, writeJSON } from './storage'

const STORAGE_KEY = 'soc-case-workspace:guided-mode'

export function loadGuidedMode(): boolean {
  return readJSON<boolean>(STORAGE_KEY, false)
}

export function saveGuidedMode(enabled: boolean): void {
  writeJSON(STORAGE_KEY, enabled)
}
