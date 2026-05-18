import React, { useMemo } from 'react'

function getVisiblePageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b)
  const result = []
  let prev = 0
  for (const p of sorted) {
    if (prev && p - prev > 1) result.push('ellipsis')
    result.push(p)
    prev = p
  }
  return result
}

export default function SavedFilesPagination({
  page,
  totalPages,
  totalItems,
  rangeStart,
  rangeEnd,
  onPageChange,
  className = '',
}) {
  const pageNumbers = useMemo(() => getVisiblePageNumbers(page, totalPages), [page, totalPages])

  if (totalItems <= 0) return null

  return (
    <nav
      className={`saved-files-pagination mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm ${className}`.trim()}
      aria-label="Saved files pages"
    >
      <p className="text-sm text-gray-600 m-0 order-2 sm:order-1">
        Showing <span className="font-semibold text-gray-800">{rangeStart}</span>
        {' – '}
        <span className="font-semibold text-gray-800">{rangeEnd}</span>
        {' of '}
        <span className="font-semibold text-gray-800">{totalItems}</span>
      </p>
      <div className="flex flex-wrap items-center justify-center gap-1 order-1 sm:order-2" role="group" aria-label="Page navigation">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Prev
        </button>
        {pageNumbers.map((entry, idx) =>
          entry === 'ellipsis' ? (
            <span key={`ellipsis-${idx}`} className="px-1 text-gray-400 text-sm select-none" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={entry}
              type="button"
              onClick={() => onPageChange(entry)}
              aria-label={`Page ${entry}`}
              aria-current={entry === page ? 'page' : undefined}
              className={`min-w-[2.25rem] h-9 px-2 text-sm font-medium rounded-lg border transition-all duration-200 active:scale-95 ${
                entry === page
                  ? 'border-[var(--primary-blue)] bg-[var(--primary-blue)] text-white shadow-sm'
                  : 'border-gray-300 text-gray-700 hover:bg-[var(--primary-blue)]/10 hover:border-[var(--primary-blue)]'
              }`}
            >
              {entry}
            </button>
          )
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
          className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-200 active:scale-95"
        >
          Next
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  )
}
