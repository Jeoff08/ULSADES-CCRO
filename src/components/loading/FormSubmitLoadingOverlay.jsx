import React from 'react'
import { FORM_SUBMIT_LOADING_MS, FORM_SUBMIT_LOADING_SEAL_SRC } from './formSubmitLoading'
import './FormSubmitLoadingOverlay.css'

export default function FormSubmitLoadingOverlay({
  open,
  title = 'Loading',
  subtitle = 'Preparing your document for print…',
}) {
  if (!open) return null

  return (
    <div
      className="form-submit-loading-overlay no-print"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={title}
    >
      <div className="form-submit-loading-backdrop" aria-hidden />
      <div className="form-submit-loading-card">
        <div className="form-submit-loading-seal-stage">
          <div className="form-submit-loading-glow" aria-hidden />
          <div className="form-submit-loading-ring" aria-hidden />
          <img
            src={FORM_SUBMIT_LOADING_SEAL_SRC}
            alt=""
            className="form-submit-loading-seal"
            draggable={false}
          />
        </div>
        <p className="form-submit-loading-title">{title}</p>
        <p className="form-submit-loading-subtitle">{subtitle}</p>
        <div className="form-submit-loading-bar" aria-hidden>
          <div
            className="form-submit-loading-bar-fill"
            style={{ animationDuration: `${FORM_SUBMIT_LOADING_MS}ms` }}
          />
        </div>
        <div className="form-submit-loading-dots" aria-hidden>
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  )
}
