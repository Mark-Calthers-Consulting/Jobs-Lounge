'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { LuMegaphone, LuX } from 'react-icons/lu'
import { useDismissImportantTeamAnnouncement, useTeamNotifications } from '@/hooks/useTeamNotifications'

export default function TeamAnnouncementModalHost() {
  const query = useTeamNotifications(1, 5)
  const dismiss = useDismissImportantTeamAnnouncement()
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previouslyFocused = useRef<HTMLElement | null>(null)
  const announcement = query.data?.popup

  useEffect(() => {
    if (!announcement) return
    previouslyFocused.current = document.activeElement as HTMLElement | null
    closeButtonRef.current?.focus()
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
      previouslyFocused.current?.focus()
    }
  }, [announcement])

  useEffect(() => {
    if (!announcement) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !dismiss.isPending) dismiss.mutate(announcement._id)
      if (event.key !== 'Tab') return
      const dialog = closeButtonRef.current?.closest('[role="dialog"]')
      const focusable = dialog?.querySelectorAll<HTMLElement>('button:not([disabled]), a[href]')
      if (!focusable?.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [announcement, dismiss])

  if (!announcement) return null
  const close = () => dismiss.mutate(announcement._id)

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4" aria-hidden={false}>
      <section role="dialog" aria-modal="true" aria-labelledby="important-announcement-title" aria-describedby="important-announcement-message" className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span aria-hidden="true" className="inline-flex size-10 items-center justify-center rounded-lg bg-blue-50 text-blue-800"><LuMegaphone size={21} /></span>
          <button ref={closeButtonRef} type="button" onClick={close} disabled={dismiss.isPending} aria-label="Close announcement" className="inline-flex size-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60">
            <LuX aria-hidden="true" size={21} />
          </button>
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-wide text-blue-800">Important team update</p>
        <h2 id="important-announcement-title" className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{announcement.title}</h2>
        <p id="important-announcement-message" className="mt-3 whitespace-pre-wrap text-base leading-7 text-slate-600">{announcement.message}</p>
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={close} disabled={dismiss.isPending} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60">
            {dismiss.isPending ? 'Closing…' : 'Close'}
          </button>
          {announcement.action?.href && announcement.action.label ? (
            <Link href={announcement.action.href} onClick={close} className="inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">
              {announcement.action.label}
            </Link>
          ) : null}
        </div>
        <p className="mt-4 text-center text-xs text-slate-500">Closing this notice does not mark your notifications as read.</p>
      </section>
    </div>
  )
}
