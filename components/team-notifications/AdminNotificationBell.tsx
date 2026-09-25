'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LuBell, LuCheck, LuChevronRight } from 'react-icons/lu'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import {
  useMarkAllTeamNotificationsRead,
  useTeamNotifications,
} from '@/hooks/useTeamNotifications'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { announcementTypeTone } from './announcementStyles'

export default function AdminNotificationBell() {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const query = useTeamNotifications(1, 5)
  const markAll = useMarkAllTeamNotificationsRead()
  const { timeZone } = usePlatformSettings()
  const unreadCount = query.data?.unreadCount || 0

  useEffect(() => {
    if (!open) return
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
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
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={unreadCount ? `Notifications, ${unreadCount} unread` : 'Notifications'}
        onClick={() => setOpen((current) => !current)}
        className="relative inline-flex size-11 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"
      >
        <LuBell aria-hidden="true" size={20} />
        {unreadCount > 0 ? (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-[11px] font-bold leading-5 text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <section
          role="dialog"
          aria-label="Notifications"
          className="fixed inset-x-3 top-20 z-50 max-h-[min(36rem,calc(100vh-6rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-14 sm:w-[25rem]"
        >
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-4 py-3.5">
            <div>
              <h2 className="font-semibold text-slate-950">Notifications</h2>
              <p className="mt-0.5 text-xs text-slate-500">
                {unreadCount ? `${unreadCount} unread` : 'You are up to date'}
              </p>
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                disabled={markAll.isPending}
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60"
              >
                <LuCheck aria-hidden="true" />
                {markAll.isPending ? 'Updating…' : 'Mark all as read'}
              </button>
            ) : null}
          </div>

          <div className="max-h-[27rem] overflow-y-auto">
            {query.isLoading ? (
              <div role="status" aria-label="Loading notifications" className="space-y-3 p-4">
                {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-lg bg-slate-100" />)}
              </div>
            ) : query.isError ? (
              <div className="p-6 text-center">
                <p className="text-sm font-medium text-slate-900">Notifications could not be loaded.</p>
                <button type="button" onClick={() => query.refetch()} className="mt-3 text-sm font-semibold text-blue-800 hover:underline">Try again</button>
              </div>
            ) : query.data?.data.length ? (
              <ul className="divide-y divide-slate-100">
                {query.data.data.map((announcement) => (
                  <li key={announcement._id} className="relative px-4 py-4">
                    {!announcement.isRead ? <span aria-label="Unread" className="absolute left-1.5 top-5 size-1.5 rounded-full bg-blue-700" /> : null}
                    <div className="flex items-start justify-between gap-3">
                      <span className={`rounded px-2 py-1 text-[11px] font-semibold ${announcementTypeTone[announcement.type]}`}>
                        {announcement.type}
                      </span>
                      <time className="shrink-0 text-xs text-slate-500" dateTime={announcement.publishedAt || announcement.createdAt}>
                        {formatDateInTimeZone(announcement.publishedAt || announcement.createdAt, timeZone, { day: 'numeric', month: 'short' })}
                      </time>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-slate-950">{announcement.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600">{announcement.message}</p>
                    {announcement.action?.href && announcement.action.label ? (
                      <Link href={announcement.action.href} onClick={() => setOpen(false)} className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
                        {announcement.action.label}<LuChevronRight aria-hidden="true" />
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-6 py-10 text-center">
                <LuBell aria-hidden="true" className="mx-auto text-slate-300" size={28} />
                <p className="mt-3 font-medium text-slate-900">Nothing new right now</p>
                <p className="mt-1 text-sm text-slate-500">Team updates will appear here.</p>
              </div>
            )}
          </div>

          <Link href="/admin-center/notifications" onClick={() => setOpen(false)} className="flex items-center justify-between border-t border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-700">
            View all notifications <LuChevronRight aria-hidden="true" />
          </Link>
        </section>
      ) : null}
    </div>
  )
}
