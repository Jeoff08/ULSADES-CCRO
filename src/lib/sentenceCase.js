import { flushSync } from 'react-dom'

/**
 * Sentence-style capitalization: first letter upper, following letters lower
 * until . ? ! — then capitalize the next letter again.
 */
export function toSentenceCase(str) {
  if (str == null || typeof str !== 'string') return str
  if (!str.length) return str

  const isLetter = (ch) => {
    if (!ch) return false
    try {
      return /\p{L}/u.test(ch)
    } catch {
      return /[a-zA-Z]/.test(ch)
    }
  }

  let out = ''
  let capitalizeNext = true
  for (let i = 0; i < str.length; i++) {
    const c = str[i]
    if (c === '.' || c === '?' || c === '!') {
      out += c
      capitalizeNext = true
      continue
    }
    if (isLetter(c)) {
      out += capitalizeNext ? c.toLocaleUpperCase('en-PH') : c.toLocaleLowerCase('en-PH')
      capitalizeNext = false
    } else {
      out += c
    }
  }
  return out
}

/**
 * Apply sentence case on each keystroke for controlled inputs; keeps caret position.
 */
export function commitSentenceCaseFromInput(e, setValue) {
  const el = e.target
  const start = Number(el.selectionStart) || 0
  const end = Number(el.selectionEnd) || 0
  const next = toSentenceCase(el.value)
  flushSync(() => setValue(next))
  queueMicrotask(() => {
    try {
      if (document.activeElement === el && typeof el.setSelectionRange === 'function') {
        const max = next.length
        el.setSelectionRange(Math.min(start, max), Math.min(end, max))
      }
    } catch (_) {}
  })
}

/**
 * Uppercase only the first Unicode letter in the value; leave all other characters as typed.
 * (Fields that are only digits/symbols are unchanged.)
 */
export function toFirstLetterUpperRestAsTyped(str) {
  if (str == null || typeof str !== 'string' || str.length === 0) return str
  const isLetter = (ch) => {
    if (!ch) return false
    try {
      return /\p{L}/u.test(ch)
    } catch {
      return /[a-zA-Z]/.test(ch)
    }
  }
  let i = -1
  for (let k = 0; k < str.length; k++) {
    if (isLetter(str[k])) {
      i = k
      break
    }
  }
  if (i < 0) return str
  return str.slice(0, i) + str[i].toLocaleUpperCase('en-PH') + str.slice(i + 1)
}

/** Apply first-letter cap on each keystroke; keeps caret position (input or textarea). */
export function commitFirstLetterUpperFromInput(e, setValue) {
  const el = e.target
  const start = Number(el.selectionStart) || 0
  const end = Number(el.selectionEnd) || 0
  const next = toFirstLetterUpperRestAsTyped(el.value)
  flushSync(() => setValue(next))
  queueMicrotask(() => {
    try {
      if (document.activeElement === el && typeof el.setSelectionRange === 'function') {
        const max = next.length
        el.setSelectionRange(Math.min(start, max), Math.min(end, max))
      }
    } catch (_) {}
  })
}
