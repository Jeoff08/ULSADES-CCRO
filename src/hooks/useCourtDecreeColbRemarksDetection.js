import { useState, useEffect } from 'react'
import { detectRemarksBox, FALLBACK_OVERLAY } from '../lib/courtDecreeColbRemarksDetection'

/**
 * React hook for Court Decree COLB remarks detection (Form 102 / LCR Form 1A).
 * Uses courtDecreeColbRemarksDetection; edits there do not affect AUSF.
 * @param {string|null} imageDataUrl - Certificate image data URL (must be image, not PDF)
 * @returns {{ overlayRect: object, isAnalyzing: boolean, detectionFailed: boolean }}
 */
export function useCourtDecreeColbRemarksDetection(imageDataUrl) {
  const [overlayRect, setOverlayRect] = useState(FALLBACK_OVERLAY)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [detectionFailed, setDetectionFailed] = useState(false)

  useEffect(() => {
    if (!imageDataUrl || !imageDataUrl.startsWith('data:image/')) {
      setOverlayRect(FALLBACK_OVERLAY)
      setDetectionFailed(false)
      setIsAnalyzing(false)
      return
    }

    let cancelled = false
    setIsAnalyzing(true)
    setDetectionFailed(false)

    detectRemarksBox(imageDataUrl)
      .then((box) => {
        if (cancelled) return
        setIsAnalyzing(false)
        if (box) {
          setOverlayRect(box)
          setDetectionFailed(false)
        } else {
          setOverlayRect(FALLBACK_OVERLAY)
          setDetectionFailed(true)
        }
      })
      .catch(() => {
        if (cancelled) return
        setIsAnalyzing(false)
        setOverlayRect(FALLBACK_OVERLAY)
        setDetectionFailed(true)
      })

    return () => { cancelled = true }
  }, [imageDataUrl])

  return { overlayRect, isAnalyzing, detectionFailed }
}
