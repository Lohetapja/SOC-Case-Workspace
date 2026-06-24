import { useState } from 'react'
import { loadGuidedMode, saveGuidedMode } from '../utils/guidedMode'

export function useGuidedMode() {
  const [enabled, setEnabled] = useState(() => loadGuidedMode())

  function setGuidedMode(nextEnabled: boolean) {
    setEnabled(nextEnabled)
    saveGuidedMode(nextEnabled)
  }

  return { guidedMode: enabled, setGuidedMode }
}
