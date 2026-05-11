import React, { useEffect } from 'react'

export default function ConfirmationModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'OK', cancelText = 'Cancel' }) {
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] modal-backdrop" 
        onClick={onCancel}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-[380px] bg-white rounded-2xl shadow-xl overflow-hidden modal-content" role="alertdialog" aria-modal="true">
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              {title || 'Unsaved Changes'}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors duration-200"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              autoFocus
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 shadow-md active:scale-[0.98] transition-all duration-200"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}



