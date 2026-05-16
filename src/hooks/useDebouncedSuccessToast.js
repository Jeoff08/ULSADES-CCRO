import { useCallback, useRef } from 'react'

/** Debounced green “Saved” toast (e.g. while editing LCR certification line). */
export function useDebouncedSuccessToast(show, { title = 'Saved', message = 'LCR certification line updated.', delayMs = 450 } = {}) {
  const timerRef = useRef(null)
  return useCallback(() => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null
      show({ type: 'success', title, message })
    }, delayMs)
  }, [show, title, message, delayMs])
}
