'use client'

import type { Job } from '@/types/types'
import { useState } from 'react'
import { FiAlertTriangle } from 'react-icons/fi'
import Modal from './Modal'

type PermanentDeleteJobModalProps = {
    job: Job
    pending: boolean
    error?: string
    onClose: () => void
    onConfirm: (confirmationTitle: string) => void
}

const PermanentDeleteJobModal = ({
    job,
    pending,
    error,
    onClose,
    onConfirm,
}: PermanentDeleteJobModalProps) => {
    const [confirmationTitle, setConfirmationTitle] = useState('')
    const matches = confirmationTitle.trim() === job.title.trim()

    return (
        <Modal
            isOpen
            title="Delete vacancy permanently?"
            actionLabel={pending ? 'Deleting…' : 'Delete permanently'}
            actionTone="danger"
            actionDisabled={!matches}
            disabled={pending}
            size="compact"
            onClose={onClose}
            onSubmit={() => onConfirm(confirmationTitle)}
            body={(
                <div className="space-y-4">
                    <div className="flex gap-3 rounded-lg border border-red-400/30 bg-red-500/10 p-3">
                        <FiAlertTriangle aria-hidden="true" className="mt-0.5 shrink-0 text-red-300" />
                        <p className="text-sm leading-6 text-white/85">
                            This permanently removes the vacancy, its applications and related records.
                            This cannot be undone.
                        </p>
                    </div>

                    <div>
                        <p className="text-xs font-medium text-white/65">Vacancy title</p>
                        <p className="mt-1 break-words rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-white">
                            {job.title}
                        </p>
                    </div>

                    <div>
                        <label htmlFor="permanent-delete-job-title" className="text-sm font-medium text-white">
                            Type the vacancy title to confirm
                        </label>
                        <input
                            id="permanent-delete-job-title"
                            type="text"
                            value={confirmationTitle}
                            onChange={(event) => setConfirmationTitle(event.target.value)}
                            disabled={pending}
                            autoComplete="off"
                            aria-invalid={Boolean(error)}
                            aria-describedby={error ? 'permanent-delete-job-error' : undefined}
                            className="mt-2 min-h-11 w-full rounded-md border border-white/25 bg-white px-3 py-2 text-sm text-gray-950 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-300/30 disabled:cursor-wait disabled:opacity-70"
                        />
                        {error ? (
                            <p id="permanent-delete-job-error" role="alert" className="mt-2 text-sm text-red-300">
                                {error}
                            </p>
                        ) : null}
                    </div>
                </div>
            )}
            footer={(
                <button
                    type="button"
                    disabled={pending}
                    onClick={onClose}
                    className="w-full rounded-md border border-white/30 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-wait disabled:opacity-60"
                >
                    Cancel
                </button>
            )}
        />
    )
}

export default PermanentDeleteJobModal
