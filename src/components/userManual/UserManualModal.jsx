import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { USER_MANUAL_SECTIONS, flattenManualSteps } from '../../content/userManualSteps'
import UserManualStepVisual from './UserManualStepVisual'

const FLAT_STEPS = flattenManualSteps()

function IconBook() {
  return (
    <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
      />
    </svg>
  )
}

export function UserManualSidebarButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${className} flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full text-left text-white/90 hover:bg-white/10 transition`}
    >
      <IconBook />
      <span>User Manual</span>
    </button>
  )
}

export default function UserManualModal({ isOpen, onClose }) {
  const [sectionIndex, setSectionIndex] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)

  const section = USER_MANUAL_SECTIONS[sectionIndex]
  const step = section?.steps[stepIndex]
  const flatIndex = useMemo(() => {
    let idx = 0
    for (let s = 0; s < sectionIndex; s++) idx += USER_MANUAL_SECTIONS[s].steps.length
    return idx + stepIndex
  }, [sectionIndex, stepIndex])

  const totalSteps = FLAT_STEPS.length
  const isFirst = flatIndex === 0
  const isLast = flatIndex === totalSteps - 1

  const goToFlat = useCallback((targetFlat) => {
    let remaining = targetFlat
    for (let s = 0; s < USER_MANUAL_SECTIONS.length; s++) {
      const len = USER_MANUAL_SECTIONS[s].steps.length
      if (remaining < len) {
        setSectionIndex(s)
        setStepIndex(remaining)
        return
      }
      remaining -= len
    }
  }, [])

  const goPrev = () => {
    if (isFirst) return
    goToFlat(flatIndex - 1)
  }

  const goNext = () => {
    if (isLast) return
    goToFlat(flatIndex + 1)
  }

  const selectSection = (idx) => {
    setSectionIndex(idx)
    setStepIndex(0)
  }

  useEffect(() => {
    if (!isOpen) return
    setSectionIndex(0)
    setStepIndex(0)
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && flatIndex > 0) goToFlat(flatIndex - 1)
      if (e.key === 'ArrowRight' && flatIndex < totalSteps - 1) goToFlat(flatIndex + 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose, flatIndex, totalSteps, goToFlat])

  if (!isOpen || !step) return null

  return (
    <div
      className="user-manual-modal fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-manual-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px] modal-backdrop"
        aria-label="Close user manual"
        onClick={onClose}
      />
      <div className="user-manual-modal__panel relative flex flex-col w-full max-w-5xl max-h-[min(92vh,780px)] bg-white rounded-2xl shadow-2xl overflow-hidden modal-content">
        <header className="shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--primary-blue)]">User Manual</p>
            <h2 id="user-manual-title" className="text-lg font-bold text-slate-900 truncate">
              {step.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {section.title} · Step {stepIndex + 1} of {section.steps.length}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-9 h-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition flex items-center justify-center"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div className="flex flex-1 min-h-0 flex-col sm:flex-row">
          <aside className="shrink-0 sm:w-44 border-b sm:border-b-0 sm:border-r border-slate-200 bg-slate-50/80 p-2 overflow-x-auto sm:overflow-y-auto">
            <p className="hidden sm:block px-2 py-1 text-[10px] font-semibold uppercase text-slate-500 tracking-wide">Sections</p>
            <div className="flex sm:flex-col gap-1">
              {USER_MANUAL_SECTIONS.map((sec, idx) => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => selectSection(idx)}
                  className={`shrink-0 sm:w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition ${
                    idx === sectionIndex
                      ? 'bg-[var(--primary-blue)] text-white shadow-sm'
                      : 'text-slate-700 hover:bg-white border border-transparent hover:border-slate-200'
                  }`}
                >
                  {sec.title}
                </button>
              ))}
            </div>
          </aside>

          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <div className="user-manual-modal__visual rounded-xl bg-gradient-to-b from-slate-50 to-slate-100/80 border border-slate-200 p-3 sm:p-4 min-h-[240px] flex flex-col items-center justify-center gap-3">
                {step.image && !step.visual ? (
                  <img
                    src={step.image}
                    alt=""
                    className="max-h-[260px] w-auto max-w-full object-contain rounded-lg shadow-sm"
                  />
                ) : null}
                {step.visual ? <UserManualStepVisual visualId={step.visual} /> : null}
              </div>

              <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-none m-0 p-0">
                {step.body.map((line) => (
                  <li key={line} className="flex gap-2">
                    <span className="text-[var(--primary-blue)] font-bold shrink-0">•</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {section.steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setStepIndex(idx)}
                    title={s.title}
                    aria-label={`Go to step ${idx + 1}: ${s.title}`}
                    aria-current={idx === stepIndex ? 'step' : undefined}
                    className={`h-2 rounded-full transition-all ${
                      idx === stepIndex
                        ? 'w-6 bg-[var(--primary-blue)]'
                        : 'w-2 bg-slate-300 hover:bg-slate-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="shrink-0 flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500 order-2 sm:order-1 w-full sm:w-auto text-center sm:text-left">
            {flatIndex + 1} / {totalSteps} · Use ← → keys
          </p>
          <div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
            <button
              type="button"
              onClick={goPrev}
              disabled={isFirst}
              className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 text-slate-700 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            {isLast ? (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)] transition"
              >
                Finish
              </button>
            ) : (
              <button
                type="button"
                onClick={goNext}
                className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue-light)] transition"
              >
                Next
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
