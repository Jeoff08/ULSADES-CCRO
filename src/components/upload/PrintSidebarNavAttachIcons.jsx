import React from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Upload / eye + dot column used beside each print-output nav button (same layout as Legitimation / Court Decree).
 * When allowManageUpload is true and a file exists, a second button opens the attachment modal (replace / remove with confirmation).
 */
export default function PrintSidebarNavAttachIcons({
  hasUpload,
  scopeKey,
  onOpenUploadModal,
  allowManageUpload = false,
  iconsDisabled = false,
}) {
  const navigate = useNavigate()
  const locked = iconsDisabled || !scopeKey

  const openManage = () => {
    if (locked) return
    onOpenUploadModal?.()
  }

  return (
    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
      {!hasUpload ? (
        <button
          type="button"
          onClick={() => {
            if (locked) return
            onOpenUploadModal?.()
          }}
          disabled={locked}
          className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          aria-label="Upload file"
          title="Upload file"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
            <path d="M12 16V4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 8l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={() => {
              if (locked || !scopeKey) return
              navigate(`/uploaded/${encodeURIComponent(scopeKey)}`)
            }}
            disabled={locked}
            className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="View uploaded file"
            title="View uploaded file"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
              <path
                d="M2.5 12s3.5-7 9.5-7 9.5 7 9.5 7-3.5 7-9.5 7-9.5-7-9.5-7Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
          {allowManageUpload ? (
            <button
              type="button"
              onClick={openManage}
              disabled={locked}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Replace or remove attachment"
              title="Replace or remove attachment"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" aria-hidden>
                <path
                  d="M4 4v5h.582m15.356 2A8.002 8.002 0 004.582 15H4m0-5V4m0 0h5M20 20v-5h-.581m0 0a8.003 8.003 0 01-15.357-2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          ) : null}
        </>
      )}
      {hasUpload ? (
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="File uploaded" aria-label="File uploaded" />
      ) : null}
    </div>
  )
}
