'use client'

import type { PaginationMetadata } from '@/types/types'

type PaginationControlsProps = {
  pagination?: PaginationMetadata
  onPageChange: (page: number) => void
}

const PaginationControls = ({ pagination, onPageChange }: PaginationControlsProps) => {
  if (!pagination || pagination.totalPages <= 1) return null

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-gray-200 px-4 py-3" aria-label="Pagination">
      <p className="text-sm text-gray-600" aria-live="polite">
        Page {pagination.page} of {pagination.totalPages} ({pagination.total} results)
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!pagination.hasPreviousPage}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!pagination.hasNextPage}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Next
        </button>
      </div>
    </nav>
  )
}

export default PaginationControls
