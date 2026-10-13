'use client'

import { useCallback, useEffect, useRef } from 'react'
import ApplicationDetailPanel from './ApplicationDetailPanel'

const focusableSelector = [
  'a[href]',
  'button:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export default function ApplicationReviewDrawer({
  applicationId,
  onClose,
}: {
  applicationId: string
  onClose: () => void
}) {
  const drawerRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const onCloseRef = useRef(onClose)

  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const closeDrawer = useCallback(() => {
    onCloseRef.current()
    window.setTimeout(() => previousFocusRef.current?.focus(), 0)
  }, [])

  useEffect(() => {
    previousFocusRef.current = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      const nestedDialogOpen = [...document.querySelectorAll<HTMLElement>(
        '[role="dialog"][aria-modal="true"]',
      )].some((dialog) => dialog !== drawerRef.current)
      if (nestedDialogOpen) return

      if (event.key === 'Escape') {
        event.preventDefault()
        closeDrawer()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable.at(-1) as HTMLElement
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeDrawer])

  return (
    <div className="fixed inset-0 z-40">
      <button
        type="button"
        aria-label="Dismiss application review"
        onClick={closeDrawer}
        className="absolute inset-0 bg-slate-950/40"
      />
      <aside
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Candidate application review"
        className="absolute inset-y-0 right-0 flex w-full max-w-3xl flex-col bg-slate-50 shadow-xl"
      >
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div>
            <p className="font-semibold text-slate-950">Application review</p>
            <p className="text-sm text-slate-500">Review the candidate without leaving the Kanban.</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            aria-label="Close application review"
            onClick={closeDrawer}
            className="flex size-10 items-center justify-center rounded-md text-2xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
          >
            <span aria-hidden="true">×</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-3 sm:p-4">
          <ApplicationDetailPanel applicationId={applicationId} />
        </div>
      </aside>
    </div>
  )
}
