/** CCRO seal shown while a module form finishes saving before print. */
export const FORM_SUBMIT_LOADING_SEAL_SRC = '/ChatGPT Image Feb 11, 2026, 03_26_31 PM.png'

export const FORM_SUBMIT_LOADING_MS = 2000

/**
 * Runs `task` while `setLoading(true)`; keeps the overlay visible for at least 2 seconds.
 */
export async function runWithFormSubmitLoading(setLoading, task) {
  setLoading(true)
  const started = Date.now()
  try {
    await task()
  } finally {
    const remaining = FORM_SUBMIT_LOADING_MS - (Date.now() - started)
    if (remaining > 0) {
      await new Promise((resolve) => setTimeout(resolve, remaining))
    }
    setLoading(false)
  }
}
