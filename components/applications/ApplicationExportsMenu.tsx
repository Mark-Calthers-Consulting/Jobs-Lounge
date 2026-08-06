'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LuChevronDown, LuDownload } from 'react-icons/lu'
import { useUser } from '@/hooks/useUsers'
import ExportRecordsDialog from './ExportRecordsDialog'
import VacancySummaryButton from './VacancySummaryButton'

export default function ApplicationExportsMenu({ total }: { total: number }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const user = useUser()
  const closeAndRestoreFocus = () => {
    setOpen(false)
    requestAnimationFrame(() => triggerRef.current?.focus())
  }

  useEffect(() => {
    if (!open) return

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || document.querySelector('[role="dialog"][aria-modal="true"]')) return
      setOpen(false)
      triggerRef.current?.focus()
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return
          event.preventDefault()
          setOpen(true)
          requestAnimationFrame(() => rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus())
        }}
        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <LuDownload aria-hidden="true" />
        Exports
        <LuChevronDown aria-hidden="true" className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div
          role="menu"
          tabIndex={-1}
          aria-label="Application exports"
          onKeyDown={(event) => {
            if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
            const items = [...(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
              .filter((item) => !item.hasAttribute('disabled'))
            if (!items.length) return
            event.preventDefault()
            const current = items.indexOf(document.activeElement as HTMLElement)
            const next = event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? items.length - 1
                : event.key === 'ArrowUp'
                  ? (current <= 0 ? items.length - 1 : current - 1)
                  : (current + 1) % items.length
            items[next]?.focus()
          }}
          className="absolute right-0 z-30 mt-2 w-80 overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <VacancySummaryButton variant="menu" onAction={closeAndRestoreFocus} />
          <ExportRecordsDialog
            filters={{ sort: 'newest' }}
            selectedIds={[]}
            matchingTotal={total}
            variant="menu"
            onDialogClose={closeAndRestoreFocus}
          />
          <div className="mx-4 border-t border-slate-200" />
          <Link
            href="/admin-center/applications/exports"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="block px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-blue-50"
          >
            {user.data?.role === 'super-admin' ? 'Export requests and approvals' : 'My export requests'}
          </Link>
        </div>
      ) : null}
    </div>
  )
}
