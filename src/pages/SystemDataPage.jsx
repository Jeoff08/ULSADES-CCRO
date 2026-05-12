import React, { useRef, useState } from 'react'
import { buildSystemBackupPayload, importSystemBackupPayload } from '../lib/systemBackup'

function downloadTextFile(text, fileName) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read selected file.'))
    reader.onload = () => resolve(String(reader.result || ''))
    reader.readAsText(file)
  })
}

export default function SystemDataPage() {
  const [status, setStatus] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const fileInputRef = useRef(null)

  const handleExport = async () => {
    if (isExporting) return
    setIsExporting(true)
    setStatus('')
    try {
      const payload = buildSystemBackupPayload()
      const backupText = JSON.stringify(payload, null, 2)
      const suggestedFileName = `ulsades-backup-${new Date().toISOString().slice(0, 10)}.json`
      if (window?.electronAPI?.saveBackupJson) {
        try {
          const result = await window.electronAPI.saveBackupJson(backupText, suggestedFileName)
          if (!result?.ok) {
            if (!result?.cancelled) setStatus(result?.reason || 'Backup export failed.')
            return
          }
          setStatus(`Export complete: ${result.filePath}`)
          return
        } catch (err) {
          // Fallback for stale Electron main process without new IPC handler.
          if (!String(err?.message || '').includes('No handler registered')) throw err
          downloadTextFile(backupText, suggestedFileName)
          setStatus('Export complete (fallback download). Please restart the app to enable native save dialog.')
          return
        }
      }
      downloadTextFile(backupText, suggestedFileName)
      setStatus('Export complete.')
    } catch (err) {
      setStatus(err?.message || 'Backup export failed.')
    } finally {
      setIsExporting(false)
    }
  }

  const importFromText = async (text) => {
    const normalizedText = String(text || '').replace(/^\uFEFF/, '').trim()
    if (!normalizedText) {
      throw new Error('Selected file is empty.')
    }
    let parsed
    try {
      parsed = JSON.parse(normalizedText)
    } catch {
      throw new Error('Invalid backup JSON file.')
    }
    const result = importSystemBackupPayload(parsed)
    setStatus(`Import complete. Added ${result.insertedKeys} keys, updated ${result.updatedKeys} keys, unchanged ${result.skippedKeys} keys.`)
    setTimeout(() => window.location.reload(), 500)
  }

  const handleImport = async () => {
    if (isImporting) return
    setIsImporting(true)
    setStatus('')
    try {
      if (window?.electronAPI?.openBackupJson) {
        try {
          const opened = await window.electronAPI.openBackupJson()
          if (!opened?.ok) {
            if (!opened?.cancelled) setStatus(opened?.reason || 'Backup import failed.')
            return
          }
          await importFromText(opened.text)
          return
        } catch (err) {
          // Fallback for stale Electron main process without new IPC handler.
          if (!String(err?.message || '').includes('No handler registered')) throw err
          fileInputRef.current?.click()
          setStatus('Using fallback importer. Please restart the app to enable native open dialog.')
          return
        }
      }
      fileInputRef.current?.click()
    } catch (err) {
      setStatus(err?.message || 'Backup import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setIsImporting(true)
    setStatus('')
    try {
      const text = await readFileAsText(file)
      await importFromText(text)
    } catch (err) {
      setStatus(err?.message || 'Backup import failed.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="p-6 md:p-8 space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-slate-800">Export / Import</h1>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          Export all system data (AUSF, Court Decree, Legitimation, Supplemental, MC2010-04, and Wrongly Register), including uploaded attachment files. 
          Importing will merge missing records into your system without duplicating existing ones.
        </p>
      </header>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Export backup</h2>
        <p className="text-sm text-slate-600 mb-4">
          Creates a backup file with all saved records, drafts, transmittal data, and uploaded file attachments.
        </p>
        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-[var(--primary-blue)] text-white hover:bg-[var(--primary-blue)]/90 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isExporting ? 'Exporting...' : 'Export all data'}
        </button>
      </section>

      <section className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-800 mb-2">Import backup</h2>
        <p className="text-sm text-slate-600 mb-4">
          Imports backup data and merges it into this system. Existing data is kept, missing data is added, and duplicate records are avoided.
        </p>
        <button
          type="button"
          onClick={handleImport}
          disabled={isImporting}
          className="px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isImporting ? 'Importing...' : 'Import backup file'}
        </button>
        <input ref={fileInputRef} type="file" accept=".json,application/json" className="hidden" onChange={handleFileChange} />
      </section>

      {status ? (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-700">
          {status}
        </div>
      ) : null}
    </div>
  )
}

