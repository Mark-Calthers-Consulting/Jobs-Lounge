'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const views = [
  { href: '/admin-center/applications', label: 'Overview', active: (path: string) => path === '/admin-center/applications' },
  { href: '/admin-center/applications/inbox', label: 'Application inbox', active: (path: string) => path.startsWith('/admin-center/applications/inbox') },
  {
    href: '/admin-center/applications/by-vacancy',
    label: 'Vacancy inbox',
    active: (path: string) => path.startsWith('/admin-center/applications/by-vacancy') || path.startsWith('/admin-center/applications/jobs/'),
  },
]

export default function ApplicationWorkspaceNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Application workspace" className="overflow-x-auto border-b border-slate-200">
      <div className="flex min-w-max gap-7">
        {views.map((view) => {
          const current = view.active(pathname)
          return (
            <Link
              key={view.href}
              href={view.href}
              aria-current={current ? 'page' : undefined}
              className={`-mb-px border-b-2 px-0.5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 ${
                current
                  ? 'border-slate-950 text-slate-950'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900'
              }`}
            >
              {view.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
