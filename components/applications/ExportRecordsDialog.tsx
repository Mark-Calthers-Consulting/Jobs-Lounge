'use client'

import Link from 'next/link'
import { useState } from 'react'
import { LuDownload, LuLock } from 'react-icons/lu'
import { toast } from 'sonner'
import Modal from '@/components/Modal'
import { downloadComprehensiveExport, saveDownloadedFile } from '@/api/applicationWorkspace'
import { useCreateApplicationExportRequest } from '@/hooks/useApplicationWorkspace'
import { useUser } from '@/hooks/useUsers'
import type { ApplicationExportScope, ApplicationWorkspaceFilters } from '@/types/types'

export default function ExportRecordsDialog({
  filters,
  selectedIds,
  matchingTotal,
  variant = 'button',
  onDialogClose,
}: {
  filters: ApplicationWorkspaceFilters
  selectedIds: string[]
  matchingTotal: number
  variant?: 'button' | 'menu'
  onDialogClose?: () => void
}) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<ApplicationExportScope>('filtered')
  const [downloading, setDownloading] = useState(false)
  const createRequest = useCreateApplicationExportRequest()
  const user = useUser()
  const isSuperAdmin = user.data?.role === 'super-admin'
  const selectedAvailable = selectedIds.length > 0
  const exportCount = scope === 'selected' ? selectedIds.length : matchingTotal
  const pending = createRequest.isPending || downloading

  const submit = async () => {
    try {
      const request = await createRequest.mutateAsync({
        scope,
        filters,
        ...(scope === 'selected' ? { applicationIds: selectedIds } : {}),
      })
      if (isSuperAdmin && request.status === 'approved') {
        setDownloading(true)
        const file = await downloadComprehensiveExport(request.exportId)
        saveDownloadedFile(file)
        toast.success('Comprehensive application export downloaded')
      } else {
        toast.success('Export request sent for approval')
      }
      setOpen(false)
      onDialogClose?.()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to prepare this export')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        role={variant === 'menu' ? 'menuitem' : undefined}
        onClick={() => {
          setScope(selectedAvailable ? 'selected' : 'filtered')
          setOpen(true)
        }}
        disabled={matchingTotal === 0 && !selectedAvailable}
        className={variant === 'menu'
          ? 'flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 focus-visible:outline-none focus-visible:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50'
          : 'inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 disabled:cursor-not-allowed disabled:opacity-50'}
      >
        <LuDownload aria-hidden="true" className={variant === 'menu' ? 'mt-0.5 shrink-0 text-slate-500' : undefined} />
        {variant === 'menu' ? (
          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-950">
              Comprehensive records
              {!isSuperAdmin ? <LuLock aria-hidden="true" className="text-xs text-slate-400" /> : null}
            </span>
            <span className="mt-0.5 block text-xs font-normal text-slate-500">
              Candidate-level data; {isSuperAdmin ? 'downloads immediately.' : 'requires approval.'}
            </span>
          </span>
        ) : 'Export records'}
      </button>
      <Modal
        isOpen={open}
        onClose={() => {
          setOpen(false)
          onDialogClose?.()
        }}
        onSubmit={() => void submit()}
        title="Export application records"
        actionLabel={pending
          ? (downloading ? 'Downloading…' : 'Preparing…')
          : isSuperAdmin ? 'Download comprehensive CSV' : 'Request comprehensive CSV'}
        disabled={pending}
        actionDisabled={exportCount < 1}
        size="compact"
        body={(
          <div className="space-y-5 text-sm text-slate-200">
            <p>
              This file contains candidate names, contact details, qualifications,
              submitted document links and application notes. Store and share it securely.
            </p>
            <fieldset className="space-y-2">
              <legend className="mb-2 font-semibold text-white">Export scope</legend>
              <label aria-label="Current filtered results" htmlFor="export-filtered-results" className="flex cursor-pointer gap-3 rounded-lg border border-white/20 p-3">
                <input
                  id="export-filtered-results"
                  type="radio"
                  name="export-scope"
                  value="filtered"
                  checked={scope === 'filtered'}
                  onChange={() => setScope('filtered')}
                  className="mt-0.5"
                />
                <span>
                  <strong className="block text-white">Current filtered results</strong>
                  <span>{matchingTotal.toLocaleString()} matching applications</span>
                </span>
              </label>
              <label aria-label="Selected applications" htmlFor="export-selected-applications" className={`flex gap-3 rounded-lg border border-white/20 p-3 ${selectedAvailable ? 'cursor-pointer' : 'opacity-50'}`}>
                <input
                  id="export-selected-applications"
                  type="radio"
                  name="export-scope"
                  value="selected"
                  checked={scope === 'selected'}
                  disabled={!selectedAvailable}
                  onChange={() => setScope('selected')}
                  className="mt-0.5"
                />
                <span>
                  <strong className="block text-white">Selected applications</strong>
                  <span>{selectedIds.length.toLocaleString()} explicitly selected</span>
                </span>
              </label>
            </fieldset>
            <p className="flex items-start gap-1.5 text-xs text-slate-300">
              {!isSuperAdmin ? <LuLock aria-hidden="true" className="mt-0.5 shrink-0" /> : null}
              <span>
                Maximum 10,000 applications per export.
                {!isSuperAdmin ? ' Requires approval before download.' : ''}
              </span>
            </p>
          </div>
        )}
        footer={(
          <Link
            href="/admin-center/applications/exports"
            onClick={() => setOpen(false)}
            className="text-center text-sm font-semibold text-slate-200 hover:text-white hover:underline"
          >
            View export requests
          </Link>
        )}
      />
    </>
  )
}
