import { useEffect, useMemo, useState } from 'react'

export const SAVED_FILES_PAGE_SIZE = 15

export function useSavedFilesPagination(items, resetKey = '') {
  const [page, setPage] = useState(1)

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / SAVED_FILES_PAGE_SIZE))

  useEffect(() => {
    setPage(1)
  }, [resetKey])

  useEffect(() => {
    if (page > totalPages) setPage(totalPages)
  }, [page, totalPages])

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * SAVED_FILES_PAGE_SIZE
    return items.slice(start, start + SAVED_FILES_PAGE_SIZE)
  }, [items, page])

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * SAVED_FILES_PAGE_SIZE + 1
  const rangeEnd = Math.min(page * SAVED_FILES_PAGE_SIZE, totalItems)
  const showPagination = totalItems > SAVED_FILES_PAGE_SIZE

  return {
    page,
    setPage,
    totalPages,
    totalItems,
    paginatedItems,
    rangeStart,
    rangeEnd,
    showPagination,
    pageSize: SAVED_FILES_PAGE_SIZE,
  }
}
