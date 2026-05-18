import React, { useCallback, useEffect, useState } from 'react'
import { displayPdfFileName } from '../../lib/pdfOpenChooserHost'

function IconChrome() {
  return (
    <svg className="pdf-open-chooser__browser-icon" viewBox="0 0 48 48" aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#fff" stroke="#e5e7eb" strokeWidth="1" />
      <path fill="#EA4335" d="M24 10a14 14 0 0 1 12.12 7H24V10z" />
      <path fill="#FBBC05" d="M36.12 17a14 14 0 0 1-2.4 15.6L24 24V17h12.12z" />
      <path fill="#34A853" d="M24 38a14 14 0 0 1-10.8-5.2L17.6 24 24 24v14z" />
      <path fill="#4285F4" d="M10.8 32.8A14 14 0 0 1 10 24c0-2.5.6-4.9 1.8-7L24 24v8.8H10.8z" />
      <circle cx="24" cy="24" r="6" fill="#4285F4" />
      <circle cx="24" cy="24" r="3.5" fill="#fff" />
    </svg>
  )
}

function IconEdge() {
  return (
    <svg className="pdf-open-chooser__browser-icon" viewBox="0 0 48 48" aria-hidden>
      <defs>
        <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0ebeff" />
          <stop offset="50%" stopColor="#6b8cff" />
          <stop offset="100%" stopColor="#a362f7" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="22" fill="url(#edgeGrad)" />
      <path fill="#fff" d="M26 14H18c-4 0-7 3-7 7v10c0 4 3 7 7 7h12c4 0 7-3 7-7V21l-11 7V14z" opacity="0.95" />
    </svg>
  )
}

function IconPdfDoc() {
  return (
    <svg className="w-7 h-7 text-[var(--primary-blue)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 3v6h6M9 13h6M9 17h4" />
    </svg>
  )
}

const BROWSERS = [
  { id: 'chrome', label: 'Google Chrome', sub: 'Fast PDF viewer', Icon: IconChrome },
  { id: 'edge', label: 'Microsoft Edge', sub: 'Built-in on Windows', Icon: IconEdge },
]

export default function OpenPdfChooserModal({ filePath, onConfirm, onCancel }) {
  const [selected, setSelected] = useState('chrome')
  const [remember, setRemember] = useState(false)
  const [hovered, setHovered] = useState(null)
  const fileName = displayPdfFileName(filePath)

  const submit = useCallback(() => {
    onConfirm(selected, remember)
  }, [onConfirm, remember, selected])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel()
      if (e.key === 'Enter') submit()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        setSelected((prev) => (prev === 'chrome' ? 'edge' : 'chrome'))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, submit])

  return (
    <div
      className="pdf-open-chooser-backdrop fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="pdf-open-chooser-panel w-full max-w-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-open-chooser-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="pdf-open-chooser-panel__glow" aria-hidden />

        <header className="pdf-open-chooser-panel__header">
          <span className="pdf-open-chooser-panel__icon-wrap">
            <IconPdfDoc />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--primary-blue)]">
              ULSADES · Open PDF
            </p>
            <h2 id="pdf-open-chooser-title" className="text-lg font-bold text-gray-900 leading-tight mt-0.5">
              Where should we open this file?
            </h2>
          </div>
        </header>

        <p className="pdf-open-chooser-panel__file" title={filePath}>
          <span className="pdf-open-chooser-panel__file-label">Saved as</span>
          <span className="pdf-open-chooser-panel__file-name">{fileName}</span>
        </p>

        <div className="pdf-open-chooser-panel__grid" role="radiogroup" aria-label="Choose browser">
          {BROWSERS.map(({ id, label, sub, Icon }) => {
            const isSelected = selected === id
            const isHovered = hovered === id
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`pdf-open-chooser-browser ${isSelected ? 'pdf-open-chooser-browser--selected' : ''} ${isHovered ? 'pdf-open-chooser-browser--hover' : ''}`}
                onClick={() => setSelected(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
              >
                <span className="pdf-open-chooser-browser__check" aria-hidden>
                  {isSelected ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : null}
                </span>
                <Icon />
                <span className="pdf-open-chooser-browser__name">{label}</span>
                <span className="pdf-open-chooser-browser__sub">{sub}</span>
              </button>
            )
          })}
        </div>

        <label className="pdf-open-chooser-panel__remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="pdf-open-chooser-panel__checkbox"
          />
          <span className="pdf-open-chooser-panel__remember-text">Always use this browser</span>
        </label>

        <footer className="pdf-open-chooser-panel__footer">
          <button type="button" onClick={onCancel} className="pdf-open-chooser-btn pdf-open-chooser-btn--ghost">
            Cancel
          </button>
          <button type="button" onClick={submit} className="pdf-open-chooser-btn pdf-open-chooser-btn--primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Open in {selected === 'edge' ? 'Edge' : 'Chrome'}
          </button>
        </footer>
      </div>
    </div>
  )
}
