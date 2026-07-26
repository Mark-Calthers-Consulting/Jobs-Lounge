'use client'

import { useAdminVacancies, useDeleteAdminJob, useUpdateAdminJobStatus } from '@/hooks/useAdmin'
import type { Job } from '@/types/types'
import { formatJobDeadline, isJobDeadlinePast } from '@/utils/jobDeadline'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import Modal from './Modal'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'

const JobsPageTable = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
    const [jobToClose, setJobToClose] = useState<Job | null>(null)
    const [jobToPublish, setJobToPublish] = useState<Job | null>(null)
    const { data: vacancies, isLoading, isError } = useAdminVacancies(page)
    const deleteJob = useDeleteAdminJob()
    const updateJobStatus = useUpdateAdminJobStatus()
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        return (vacancies?.data ?? []).filter((job) => !query || [
            job.title,
            job.company.name,
            job.location,
            job.status,
        ].some((value) => value.toLowerCase().includes(query)))
    }, [search, vacancies?.data])

    const confirmDelete = async () => {
        if (!jobToDelete) return
        try {
            await deleteJob.mutateAsync(jobToDelete._id)
            toast.success('Job removed from listings')
            setJobToDelete(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to delete job')
        }
    }

    const confirmClose = async () => {
        if (!jobToClose) return
        try {
            await updateJobStatus.mutateAsync({ jobId: jobToClose._id, status: 'Closed' })
            toast.success('Vacancy closed')
            setJobToClose(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to close vacancy')
        }
    }

    const confirmPublish = async () => {
        if (!jobToPublish) return
        try {
            await updateJobStatus.mutateAsync({ jobId: jobToPublish._id, status: 'Open' })
            toast.success('Vacancy published')
            setJobToPublish(null)
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to publish vacancy')
        }
    }

    const columns = [
        { header: 'Job Title', accessorKey: 'title' },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }: { row: { original: Job } }) => (
                <div className="flex flex-wrap items-center gap-2">
                    <span>{row.original.status}</span>
                    {isJobDeadlinePast(row.original) ? (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-900">
                            Deadline passed
                        </span>
                    ) : null}
                </div>
            ),
        },
        {
            header: 'Deadline',
            accessorKey: 'deadline',
            cell: ({ row }: { row: { original: Job } }) => row.original.deadline
                ? formatJobDeadline(row.original.deadline)
                : 'No deadline',
        },
        { header: 'Applicants', accessorKey: 'totalApplicants' },
        { header: 'Date Posted', accessorKey: 'createdAt', cell: ({ getValue }: { getValue: () => unknown }) => new Date(String(getValue())).toLocaleDateString('en-NG') },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }: { row: { original: Job } }) => (
                <div className="flex flex-wrap items-center gap-2" aria-label={`Actions for ${row.original.title}`}>
                    {row.original.status === 'Open' ? (
                        <Link className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50" href={`/vacancies/${row.original._id}`}>View</Link>
                    ) : null}
                    <Link className="rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50" href={`/admin-center/jobs/${row.original._id}/edit`}>Edit</Link>
                    {row.original.status === 'Draft' ? (
                        <button type="button" className="rounded-md bg-[#003B6D] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#002B50]" onClick={() => setJobToPublish(row.original)}>Publish</button>
                    ) : null}
                    {row.original.status === 'Open' ? (
                        <button type="button" className="rounded-md border border-amber-300 px-2.5 py-1.5 text-xs font-medium text-amber-800 transition hover:bg-amber-50" onClick={() => setJobToClose(row.original)}>Close</button>
                    ) : null}
                    <button type="button" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-50" onClick={() => setJobToDelete(row.original)}>Delete</button>
                </div>
            ),
        },
    ]
    const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

    if (isLoading) return <p role="status" className="p-4">Loading jobs…</p>
    if (isError) return <p role="alert" className="p-4 text-red-700">Error loading jobs.</p>

    return (
        <div>
            <TableToolbar label="jobs" value={search} onChange={setSearch} />
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Job listings</caption>
                    <thead className="border-b border-gray-200 bg-gray-50">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-600">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
                    <tbody className="bg-white">{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-gray-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No jobs found on this page.</td></tr>}</tbody>
                </table>
                <PaginationControls pagination={vacancies?.pagination} onPageChange={setPage} />
            </div>
            <Modal
                isOpen={Boolean(jobToPublish)}
                title="Publish vacancy?"
                body={<p><strong>{jobToPublish?.title}</strong> will become visible in public vacancies and begin accepting applications.</p>}
                actionLabel={updateJobStatus.isPending ? 'Publishing…' : 'Publish vacancy'}
                disabled={updateJobStatus.isPending}
                size="compact"
                onClose={() => setJobToPublish(null)}
                onSubmit={() => void confirmPublish()}
            />
            <Modal
                isOpen={Boolean(jobToClose)}
                title="Close vacancy?"
                body={<p><strong>{jobToClose?.title}</strong> will disappear from public listings and stop accepting applications. Its application history will be preserved.</p>}
                actionLabel={updateJobStatus.isPending ? 'Closing…' : 'Close vacancy'}
                disabled={updateJobStatus.isPending}
                onClose={() => setJobToClose(null)}
                onSubmit={() => void confirmClose()}
            />
            <Modal
                isOpen={Boolean(jobToDelete)}
                title="Delete job?"
                body={<p>This removes <strong>{jobToDelete?.title}</strong> from all listings while preserving its application history.</p>}
                actionLabel={deleteJob.isPending ? 'Deleting…' : 'Delete job'}
                disabled={deleteJob.isPending}
                onClose={() => setJobToDelete(null)}
                onSubmit={() => void confirmDelete()}
            />
        </div>
    )
}

export default JobsPageTable
