import React from 'react'

/** Renders a stored attachment (same pattern as ACK annotation previews). */
export default function Mc2010EnclosurePreview({ entry }) {
  if (!entry?.dataUrl) {
    return (
      <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center text-sm text-gray-600">
        Attach a scanned document using the sidebar to enable this output.
      </div>
    )
  }
  const url = entry.dataUrl
  const mime = String(entry.mimeType || '')

  if (mime.startsWith('image/')) {
    return (
      <div className="flex justify-center p-4 print:p-6">
        <img src={url} alt="" className="max-w-full h-auto rounded border border-gray-200 shadow-sm" />
      </div>
    )
  }

  if (mime === 'application/pdf') {
    return (
      <div className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white min-h-[70vh] print:min-h-0">
        <iframe title="Attached PDF" src={url} className="w-full min-h-[75vh] print:min-h-[10in]" />
      </div>
    )
  }

  return (
    <div className="p-6 text-center text-sm text-gray-700">
      <p className="mb-3">Attached file ({mime || 'document'}).</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-medium">
        Open in new tab
      </a>
    </div>
  )
}
