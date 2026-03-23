import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getRemovalLogs } from '../lib/uploadedFileStore'

const MODULE_LABELS = {
  ausf: 'AUSF',
  'court-decree': 'Court Decree',
  legitimation: 'Legitimation',
}

const getModuleFromScope = (scope) => String(scope || '').split(':')[0] || 'other'

const formatWhen = (iso) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString()
  } catch {
    return '—'
  }
}

export default function Log() {
  const [logs, setLogs] = useState(() => getRemovalLogs())
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('latest')

  useEffect(() => {
    const onStorage = () => setLogs(getRemovalLogs())
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const modules = useMemo(() => {
    const set = new Set(logs.map((l) => getModuleFromScope(l.scope)))
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [logs])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()

    let list = logs.filter((l) => {
      if (moduleFilter !== 'all' && getModuleFromScope(l.scope) !== moduleFilter) return false
      if (!q) return true
      const haystack = [
        l.title,
        l.scope,
        l.name,
        l.fileName,
        l.reason,
      ]
        .map((s) => String(s || '').toLowerCase())
        .join(' ')
      return haystack.includes(q)
    })

    if (sortBy === 'oldest') {
      list = [...list].reverse()
    } else if (sortBy === 'by-name') {
      list = [...list].sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')))
    }
    return list
  }, [logs, moduleFilter, query, sortBy])

  const stats = useMemo(() => {
    const today = new Date()
    const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`
    const removedToday = logs.filter((l) => {
      if (!l.removedAt) return false
      const d = new Date(l.removedAt)
      const dKey = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      return dKey === todayKey
    }).length

    const withReason = logs.filter((l) => String(l.reason || '').trim().length > 0).length
    return {
      total: logs.length,
      shown: filtered.length,
      removedToday,
      withReason,
    }
  }, [filtered.length, logs])

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50/40 p-4 md:p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm text-gray-500 mb-1">
              <Link to="/" className="text-[var(--primary-blue)] hover:underline">Dashboard</Link>
              <span className="mx-2">/</span>
              <span>Logs</span>
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Removal Logs</h1>
            <p className="text-sm text-gray-600 mt-1">Track who removed uploaded files, when they were removed, and why.</p>
          </div>
          <div className="w-full sm:w-auto grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3 py-2">
              <p className="text-xs text-blue-700">Total logs</p>
              <p className="font-bold text-blue-900">{stats.total}</p>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
              <p className="text-xs text-emerald-700">Removed today</p>
              <p className="font-bold text-emerald-900">{stats.removedToday}</p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2">
              <p className="text-xs text-violet-700">With reason</p>
              <p className="font-bold text-violet-900">{stats.withReason}</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="text-xs text-amber-700">Filtered view</p>
              <p className="font-bold text-amber-900">{stats.shown}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-gray-200 bg-white p-3 md:p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-2 md:gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by file name, reason, scope, title, or person..."
              className="w-full rounded-xl border border-gray-300 bg-white px-10 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 focus:border-[var(--primary-blue)]"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden>🔍</span>
          </div>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 focus:border-[var(--primary-blue)]"
            aria-label="Filter by module"
          >
            <option value="all">All modules</option>
            {modules.map((m) => (
              <option key={m} value={m}>{MODULE_LABELS[m] || m}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[var(--primary-blue)]/30 focus:border-[var(--primary-blue)]"
            aria-label="Sort logs"
          >
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
            <option value="by-name">By person name</option>
          </select>
          <button
            type="button"
            onClick={() => {
              setQuery('')
              setModuleFilter('all')
              setSortBy('latest')
            }}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2.5 text-sm hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-4 bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">Recent removals</p>
          <p className="text-xs text-gray-600">{filtered.length} item{filtered.length === 1 ? '' : 's'}</p>
        </div>

        {logs.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-700">No removals logged yet.</p>
            <p className="text-xs text-gray-500 mt-1">Once someone removes an uploaded file, it will appear here.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-sm font-medium text-gray-700">No matching logs found.</p>
            <p className="text-xs text-gray-500 mt-1">Try adjusting search text, module filter, or sort.</p>
          </div>
        ) : (
          <div className="p-3 md:p-4 space-y-3">
            {filtered.map((l) => {
              const moduleName = getModuleFromScope(l.scope)
              return (
                <article
                  key={l.id}
                  className="rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/55 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        {MODULE_LABELS[moduleName] || moduleName}
                      </span>
                      <p className="font-semibold text-gray-900 truncate">{l.title || l.scope}</p>
                    </div>
                    <p className="text-xs text-gray-500">{formatWhen(l.removedAt)}</p>
                  </div>

                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm text-gray-700">
                    <p className="rounded-lg bg-white/70 border border-gray-200 px-2.5 py-2">
                      <span className="text-gray-500">Removed by:</span>{' '}
                      <span className="font-medium text-gray-900">{l.name || '—'}</span>
                    </p>
                    <p className="rounded-lg bg-white/70 border border-gray-200 px-2.5 py-2 truncate" title={l.fileName || ''}>
                      <span className="text-gray-500">File:</span>{' '}
                      <span className="font-medium text-gray-900">{l.fileName || '—'}</span>
                    </p>
                    <p className="rounded-lg bg-white/70 border border-gray-200 px-2.5 py-2 truncate" title={l.scope || ''}>
                      <span className="text-gray-500">Scope:</span>{' '}
                      <span className="font-medium text-gray-900">{l.scope || '—'}</span>
                    </p>
                  </div>

                  <details className="mt-3 group">
                    <summary className="cursor-pointer list-none inline-flex items-center gap-2 text-sm font-medium text-[var(--primary-blue)]">
                      <span className="group-open:hidden">Show reason</span>
                      <span className="hidden group-open:inline">Hide reason</span>
                    </summary>
                    <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed rounded-lg bg-white border border-gray-200 px-3 py-2.5">
                      {l.reason || 'No reason provided.'}
                    </p>
                  </details>
                </article>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
        <p>
          Logs are stored in this browser&apos;s local storage.
        </p>
        <p>
          Auto-refreshes when storage changes.
        </p>
      </div>
    </div>
  )
}
