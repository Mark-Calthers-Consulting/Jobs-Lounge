'use client'

import { APPLICATION_STATUSES, type ApplicationStatus } from '@/constants/enums'
import { useAdminApplications } from '@/hooks/useAdmin'
import { useUpdateApplicationStatus } from '@/hooks/useApplications'
import type { AdminApplication } from '@/types/types'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'

const ApplicationsPageTable = () => {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()
    const rawPage = searchParams.get('page')
    const page = rawPage && /^\d+$/.test(rawPage) && Number(rawPage) > 0
        ? Number(rawPage)
        : 1
    const rawStatus = searchParams.get('status')
    const status = APPLICATION_STATUSES.includes(rawStatus as ApplicationStatus)
        ? rawStatus as ApplicationStatus
        : undefined
    const jobId = searchParams.get('jobId') || undefined
    const [search, setSearch] = useState('')
    const {
        data: applications,
        isLoading,
        isError,
        error,
        refetch,
    } = useAdminApplications({ page, limit: 20, jobId, status })
    const updateStatus = useUpdateApplicationStatus()
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        return (applications?.data ?? []).filter((application) => !query || [
            application.name,
            application.email,
            application.title,
            application.status,
        ].some((value) => value?.toLowerCase().includes(query)))
    }, [applications?.data, search])

    const updateParams = (
        updates: Record<string, string | undefined>,
        resetPage = true,
    ) => {
        const params = new URLSearchParams(searchParams.toString())
        for (const [key, value] of Object.entries(updates)) {
            if (value) params.set(key, value)
            else params.delete(key)
        }
        if (resetPage) params.delete('page')
        const query = params.toString()
        router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    }

    const changeStatus = async (applicationId: string, status: ApplicationStatus) => {
        try {
            await updateStatus.mutateAsync({ applicationId, status })
            toast.success('Application status updated')
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Unable to update application')
        }
    }

    const columns = [
        { header: 'Applicant Name', accessorKey: 'name' },
        { header: 'Email', accessorKey: 'email', cell: ({ row }: { row: { original: AdminApplication } }) => <a className="underline" href={`mailto:${row.original.email}`}>{row.original.email}</a> },
        { header: 'Job Title', accessorKey: 'title', cell: ({ row }: { row: { original: AdminApplication } }) => <Link className="font-medium text-[#184aa2] hover:underline" href={`/admin-center/jobs/${row.original.jobId}`}>{row.original.title}</Link> },
        {
            header: 'Status',
            accessorKey: 'status',
            cell: ({ row }: { row: { original: AdminApplication } }) => (
                <select aria-label={`Status for ${row.original.name}`} value={row.original.status} disabled={updateStatus.isPending} onChange={(event) => void changeStatus(row.original.applicationId, event.target.value as ApplicationStatus)} className="rounded border border-gray-300 px-2 py-1 capitalize">
                    {APPLICATION_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
            ),
        },
        { header: 'Date Applied', accessorKey: 'createdAt', cell: ({ getValue }: { getValue: () => unknown }) => new Date(String(getValue())).toLocaleDateString('en-NG') },
        { header: 'Note', accessorKey: 'note', cell: ({ getValue }: { getValue: () => unknown }) => String(getValue() || '—') },
        {
            header: 'Documents',
            id: 'documents',
            cell: ({ row }: { row: { original: AdminApplication } }) => (
                <div className="flex gap-3">
                    {row.original.cvLink ? <a className="underline" href={row.original.cvLink} target="_blank" rel="noreferrer">CV</a> : <span className="text-gray-500">No CV link</span>}
                    {row.original.coverLetterLink && <a className="underline" href={row.original.coverLetterLink} target="_blank" rel="noreferrer">Cover letter</a>}
                </div>
            ),
        },
    ]
    const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

    if (isLoading) return <p role="status" className="rounded-xl border border-gray-200 bg-white p-8 text-center">Loading applications…</p>
    if (isError) {
        return (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">
                <p className="font-semibold">Unable to load applications</p>
                <p className="mt-1 text-sm">{error.message}</p>
                <button type="button" onClick={() => void refetch()} className="mt-3 rounded-md border border-red-300 px-3 py-2 text-sm font-semibold hover:bg-red-100">Try again</button>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {(applications?.filterContext.job || status) ? (
                <section className="rounded-xl border border-blue-100 bg-blue-50/50 p-4" aria-label="Active application filters">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-[#184aa2]">Filtered applications</p>
                            <p className="mt-1 font-semibold text-gray-950">
                                {applications?.filterContext.job?.title || 'All vacancies'}
                            </p>
                            {applications?.filterContext.job?.company ? (
                                <p className="mt-0.5 text-sm text-gray-600">{applications.filterContext.job.company}</p>
                            ) : null}
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">
                                <span className="sr-only">Filter applications by status</span>
                                <select
                                    value={status || ''}
                                    onChange={(event) => updateParams({ status: event.target.value || undefined })}
                                    className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 capitalize"
                                >
                                    <option value="">All statuses</option>
                                    {APPLICATION_STATUSES.map((option) => (
                                        <option key={option} value={option}>{option}</option>
                                    ))}
                                </select>
                            </label>
                            <button
                                type="button"
                                onClick={() => updateParams({ jobId: undefined, status: undefined })}
                                className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                            >
                                Clear filters
                            </button>
                        </div>
                    </div>
                </section>
            ) : null}
            <TableToolbar label="applications" value={search} onChange={setSearch} />
            <p className="text-sm text-gray-600" aria-live="polite">
                {(applications?.pagination.total ?? 0).toLocaleString()} {
                    applications?.pagination.total === 1 ? 'application' : 'applications'
                }
            </p>
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Candidate applications</caption>
                    <thead className="border-b border-gray-200 bg-gray-50">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-500">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
                    <tbody className="bg-white">{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-gray-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No applications found on this page.</td></tr>}</tbody>
                </table>
                <PaginationControls
                    pagination={applications?.pagination}
                    onPageChange={(nextPage) => updateParams({ page: String(nextPage) }, false)}
                />
            </div>
        </div>
    )
}

export default ApplicationsPageTable
