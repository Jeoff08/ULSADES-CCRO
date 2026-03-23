import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getUploadedFile, readFileAsDataUrl, setUploadedFile, moveUploadedFileToTrash } from '../lib/uploadedFileStore'
import ConfirmRemoveModal from '../components/upload/ConfirmRemoveModal'

const SCOPE_LABEL = {
  ausf: 'AUSF',
  'court-decree': 'Court Decree',
  legitimation: 'Legitimation',
}

function canInlinePreview(mimeType) {
  return (
    mimeType?.startsWith('image/') ||
    mimeType === 'application/pdf' ||
    mimeType?.startsWith('text/')
  )
}

export default function UploadedFileViewer() {
  const { scope } = useParams()
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [entered, setEntered] = useState(false)
  const [fileInfo, setFileInfo] = useState(() => (scope ? getUploadedFile(scope) : null))
  const [confirmRemoveOpen, setConfirmRemoveOpen] = useState(false)
  const scopeLabel = SCOPE_LABEL[scope] || (scope ? String(scope) : 'Uploaded File')

  useEffect(() => {
    setFileInfo(scope ? getUploadedFile(scope) : null)
  }, [scope])

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 0)
    return () => window.clearTimeout(id)
  }, [])

  const preview = useMemo(() => {
    if (!fileInfo?.dataUrl) return null
    if (!canInlinePreview(fileInfo.mimeType)) return null
    return fileInfo.dataUrl
  }, [fileInfo])

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f || !scope) return
    const dataUrl = await readFileAsDataUrl(f)
    const saved = setUploadedFile(scope, {
      title: fileInfo?.title || '',
      name: f.name,
      mimeType: f.type || 'application/octet-stream',
      dataUrl,
      uploadedAt: new Date().toISOString(),
    })
    setFileInfo(saved)
    e.target.value = ''
  }

  return (
    <div className="min-h-full bg-[var(--main-bg)] overflow-hidden">
      <div
        className={[
          'w-full min-h-full transition-transform duration-[550ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
          entered ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <div className="max-w-5xl mx-auto p-4 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Back
            </button>
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                onChange={onPick}
                accept="image/*,application/pdf,text/*"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900"
              >
                Replace file
              </button>
              {scope && fileInfo ? (
                <button
                  type="button"
                  onClick={() => setConfirmRemoveOpen(true)}
                  className="px-4 py-2 border border-red-300 text-red-700 bg-white rounded-lg text-sm font-medium hover:bg-red-50"
                >
                  Remove
                </button>
              ) : null}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 bg-gray-100 border-b border-gray-200 flex items-center justify-between gap-3">
              <h1 className="font-bold text-gray-900">
                {(fileInfo?.title || scopeLabel)} – Uploaded File
              </h1>
              {fileInfo ? (
                <p className="text-xs text-gray-600 truncate max-w-[60%]" title={fileInfo.name}>
                  {fileInfo.name}
                </p>
              ) : (
                <p className="text-xs text-gray-600">No file uploaded</p>
              )}
            </div>

            <div className="p-4">
              {!fileInfo ? (
                <div className="text-center py-10">
                  <p className="text-gray-700 mb-3">Upload a file to view it here.</p>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    className="px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-95"
                  >
                    Upload file
                  </button>
                </div>
              ) : preview ? (
                fileInfo.mimeType === 'application/pdf' ? (
                  <iframe
                    title="Uploaded PDF preview"
                    src={preview}
                    className="w-full h-[75vh] border border-gray-200 rounded-lg bg-white"
                  />
                ) : fileInfo.mimeType.startsWith('image/') ? (
                  <img
                    alt={fileInfo.name}
                    src={preview}
                    className="max-h-[75vh] w-auto mx-auto rounded-lg border border-gray-200 bg-white"
                  />
                ) : (
                  <iframe
                    title="Uploaded text preview"
                    src={preview}
                    className="w-full h-[75vh] border border-gray-200 rounded-lg bg-white"
                  />
                )
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-700 mb-3">
                    Preview not available for <span className="font-semibold">{fileInfo.mimeType || 'this file type'}</span>.
                  </p>
                  <a
                    href={fileInfo.dataUrl}
                    download={fileInfo.name || 'download'}
                    className="inline-flex px-4 py-2 bg-[var(--primary-blue)] text-white rounded-lg text-sm font-medium hover:opacity-95"
                  >
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <ConfirmRemoveModal
        open={confirmRemoveOpen}
        title={(fileInfo?.title || scopeLabel) ? `${fileInfo?.title || scopeLabel} — Remove attachment` : 'Remove attachment'}
        onClose={() => setConfirmRemoveOpen(false)}
        onConfirm={(meta) => {
          if (!scope) return
          moveUploadedFileToTrash(scope, meta)
          setFileInfo(null)
          setConfirmRemoveOpen(false)
        }}
      />
    </div>
  )
}

