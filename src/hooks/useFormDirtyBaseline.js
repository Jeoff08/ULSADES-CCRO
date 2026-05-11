import { useRef } from 'react'

function stableStringify(value) {
  try {
    return JSON.stringify(value)
  } catch {
    try {
      return JSON.stringify(value, (_k, v) => (typeof v === 'function' ? undefined : v))
    } catch {
      return ''
    }
  }
}

/**
 * Compares current serialized value to a baseline. When `resetKeys` changes (deep-compared via JSON),
 * the baseline is cleared and re-captured on the next render so navigation / save can reset “clean”.
 */
export function useFormDirtyBaseline(value, resetKeys = []) {
  const baseline = useRef(null)
  const keyJson = JSON.stringify(resetKeys)
  const prevKeyJson = useRef(keyJson)
  if (prevKeyJson.current !== keyJson) {
    prevKeyJson.current = keyJson
    baseline.current = null
  }
  const serialized = stableStringify(value)
  if (baseline.current === null) {
    baseline.current = serialized
  }
  return serialized !== baseline.current
}
