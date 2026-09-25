'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LuBell, LuCheck, LuChevronRight, LuRefreshCw } from 'react-icons/lu'
import PaginationControls from '@/components/PaginationControls'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { useMarkAllTeamNotificationsRead, useTeamNotifications } from '@/hooks/useTeamNotifications'
import { formatDateInTimeZone } from '@/utils/dateTime'
import { announcementTypeTone } from './announcementStyles'

export default function NotificationsPageClient() {
  const [page, setPage] = useState(1)
  const query = useTeamNotifications(page, 20)
  const markAll = useMarkAllTeamNotificationsRead()
  const { timeZone } = usePlatformSettings()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold text-blue-800">Team updates</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Notifications</h1>
          <p className="mt-2 max-w-2xl text-slate-600">Announcements and operational updates for the Jobs Lounge team.</p>
        </div>
        {(query.data?.unreadCount || 0) > 0 ? (
          <button type="button" disabled={markAll.isPending} onClick={() => markAll.mutate()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:opacity-60">
            <LuCheck aria-hidden="true" />
            {markAll.isPending ? 'Updating…' : `Mark all as read (${query.data?.unreadCount})`}
          </button>
        ) : null}
      </header>

      {markAll.isError ? <p role="alert" className="border-l-2 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800">{markAll.error.message}</p> : null}

      <section aria-label="Team notifications" className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {query.isLoading ? (
          <div role="status" aria-label="Loading notifications" className="space-y-4 p-5">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : query.isError ? (
          <div className="px-5 py-14 text-center">
            <p className="font-semibold text-slate-950">Notifications could not be loaded</p>
            <p className="mt-1 text-sm text-slate-500">Check your connection and try again.</p>
            <button type="button" onClick={() => query.refetch()} className="mt-4 inline-flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
              <LuRefreshCw aria-hidden="true" /> Try again
            </button>
          </div>
        ) : query.data?.data.length ? (
          <>
            <ul className="divide-y divide-slate-100">
              {query.data.data.map((announcement) => (
                <li key={announcement._id} className={`relative p-5 sm:p-6 ${announcement.isRead ? '' : 'bg-blue-50/30'}`}>
                  {!announcement.isRead ? <span aria-label="Unread" className="absolute left-2 top-7 size-2 rounded-full bg-blue-700" /> : null}
                  <article>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded px-2 py-1 text-xs font-semibold ${announcementTypeTone[announcement.type]}`}>{announcement.type}</span>
                      {announcement.priority === 'Important' ? <span className="rounded bg-red-50 px-2 py-1 text-xs font-semibold text-red-800">Important</span> : null}
                      <time className="ml-auto text-xs text-slate-500" dateTime={announcement.publishedAt || announcement.createdAt}>
                        {formatDateInTimeZone(announcement.publishedAt || announcement.createdAt, timeZone, { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })}
                      </time>
                    </div>
                    <h2 className="mt-3 text-lg font-semibold text-slate-950">{announcement.title}</h2>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">{announcement.message}</p>
                    {announcement.action?.href && announcement.action.label ? (
                      <Link href={announcement.action.href} className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-800 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">
                        {announcement.action.label}<LuChevronRight aria-hidden="true" />
                      </Link>
                    ) : null}
                  </article>
                </li>
              ))}
            </ul>
            <PaginationControls pagination={query.data.pagination} onPageChange={setPage} />
          </>
        ) : (
          <div className="px-5 py-16 text-center">
            <LuBell aria-hidden="true" className="mx-auto text-slate-300" size={32} />
            <h2 className="mt-3 font-semibold text-slate-950">No notifications yet</h2>
            <p className="mt-1 text-sm text-slate-500">Team announcements will appear here when they are published.</p>
          </div>
        )}
      </section>
    </div>
  )
}
