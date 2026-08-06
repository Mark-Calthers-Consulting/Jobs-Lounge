'use client'

import { useState } from 'react'
import { LuDownload } from 'react-icons/lu'
import { toast } from 'sonner'
import { downloadVacancySummary, saveDownloadedFile } from '@/api/applicationWorkspace'
import type { ApplicationJobDirectoryFilters } from '@/types/types'

export default function VacancySummaryButton({
  filters = {},
  variant = 'button',
  onAction,
}: {
  filters?: ApplicationJobDirectoryFilters
  variant?: 'button' | 'menu'
  onAction?: () => void
}) {
  const [pending, setPending] = useState(false)

  const download = async () => {
    onAction?.()
    setPending(true)
    try {
      const file = await downloadVacancySummary(filters)
      saveDownloadedFile(file)
      toast.success('Vacancy summary downloaded')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to download vacancy summary')
    } finally {
      setPending(false)
    }
  }

  return (
    <button
      type="button"
      role={variant === 'menu' ? 'menuitem' : undefined}
      onClick={() => void download()}
      disabled={pending}
      className={variant === 'menu'
        ? 'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-blue-50 disabled:cursor-wait disabled:opacity-60'
        : 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:cursor-wait disabled:opacity-60'}
    >
      <LuDownload aria-hidden="true" className={variant === 'menu' ? 'mt-0.5 shrink-0 text-slate-500' : undefined} />
      {variant === 'menu' ? (
        <span>
          <span className="block text-sm font-semibold text-slate-950">
            {pending ? 'Preparing summary…' : 'Vacancy summary'}
          </span>
          <span className="mt-0.5 block text-xs font-normal text-slate-500">
            Vacancy totals and stage counts; no candidate identities.
          </span>
        </span>
      ) : (pending ? 'Preparing summary…' : 'Download vacancy summary')}
    </button>
  )
}
