/**
 * COLB (Certificate of Live Birth) utilities:
 * - PDF to image conversion (first page rendered to data URL)
 * - Single pipeline for both image and PDF uploads
 */

let workerSrcPromise = null

async function ensurePdfWorker() {
  if (workerSrcPromise) return workerSrcPromise
  workerSrcPromise = (async () => {
    const [pdfjsLib, workerUrl] = await Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    ])
    if (pdfjsLib.GlobalWorkerOptions?.workerSrc) return
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default
  })()
  return workerSrcPromise
}

/**
 * Convert the first page of a PDF to an image data URL.
 * Uses pdfjs-dist: render page to canvas, then to data URL.
 * @param {string} pdfDataUrl - data URL of the PDF (e.g. data:application/pdf;base64,...)
 * @param {number} [scale=1.5] - scale factor for rendering (higher = sharper)
 * @returns {Promise<string>} - data URL of the rendered image (e.g. data:image/png;base64,...)
 */
export async function pdfFirstPageToImageDataUrl(pdfDataUrl, scale = 1.5) {
  await ensurePdfWorker()
  const pdfjsLib = await import('pdfjs-dist')

  const loadingTask = pdfjsLib.getDocument({
    url: pdfDataUrl,
    verbosity: 0,
  })
  const pdf = await loadingTask.promise
  const page = await pdf.getPage(1)
  const viewport = page.getViewport({ scale })

  const canvas = document.createElement('canvas')
  canvas.width = viewport.width
  canvas.height = viewport.height
  const context = canvas.getContext('2d')
  const renderTask = page.render({
    canvasContext: context,
    viewport,
    intent: 'display',
  })
  await (renderTask.promise || renderTask)

  return canvas.toDataURL('image/png')
}

/**
 * Ensure the certificate data is an image data URL.
 * If it's a PDF data URL, convert the first page to an image.
 * @param {string} dataUrl - data URL (image or PDF)
 * @returns {Promise<string>} - image data URL
 */
export async function ensureImageDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return dataUrl
  if (dataUrl.startsWith('data:image/')) return dataUrl
  if (dataUrl.startsWith('data:application/pdf')) {
    return pdfFirstPageToImageDataUrl(dataUrl)
  }
  return dataUrl
}
