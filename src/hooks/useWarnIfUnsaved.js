import { useCallback, useState } from 'react'
import { useFormDirtyBaseline } from './useFormDirtyBaseline'
import { useRegisterUnsavedChanges } from '../context/UnsavedChangesContext'

/**
 * Wires baseline dirty detection to the global leave-page confirm (sidebar + in-app navigation).
 * @returns {() => void} Call after a successful save (or equivalent) so the next navigation is not blocked.
 */
export function useWarnIfUnsaved(value, resetDeps = []) {
  const [savedAckTick, setSavedAckTick] = useState(0)
  const dirty = useFormDirtyBaseline(value, [...resetDeps, savedAckTick])
  useRegisterUnsavedChanges(dirty)
  return useCallback(() => setSavedAckTick((x) => x + 1), [])
}

/**
 * Resets the “unsaved” baseline, then runs `go` on the next macrotask so layout/navigation guards
 * observe the updated clean state (avoids modal when navigating immediately after Save).
 */
export function afterUnsavedAcknowledge(acknowledgeSaved, go) {
  acknowledgeSaved()
  setTimeout(go, 0)
}
