'use client'

import { APPLICATION_STATUSES, type ApplicationStatus } from '@/constants/enums'
import { useAdminApplications } from '@/hooks/useAdmin'
import { useUpdateApplicationStatus } from '@/hooks/useApplications'
import type { AdminApplication } from '@/types/types'
import { downloadCsv } from '@/utils/csv'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import Link from 'next/link'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'

const ApplicationsPageTable = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const { data: applications, isLoading, isError } = useAdminApplications(page)
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
        { header: 'Job Title', accessorKey: 'title', cell: ({ row }: { row: { original: AdminApplication } }) => <Link className="underline" href={`/vacancies/${row.original.jobId}`}>{row.original.title}</Link> },
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

    if (isLoading) return <p role="status" className="p-4">Loading applications…</p>
    if (isError) return <p role="alert" className="p-4 text-red-700">Error loading applications.</p>

    return (
        <div>
            <TableToolbar label="applications" value={search} onChange={setSearch} exportDisabled={rows.length === 0} onExport={() => downloadCsv('applications-current-page.csv', [
                { header: 'Applicant', value: (row: AdminApplication) => row.name },
                { header: 'Email', value: (row: AdminApplication) => row.email },
                { header: 'Job', value: (row: AdminApplication) => row.title },
                { header: 'Status', value: (row: AdminApplication) => row.status },
                { header: 'Applied', value: (row: AdminApplication) => row.createdAt },
                { header: 'CV', value: (row: AdminApplication) => row.cvLink ?? '' },
                { header: 'Note', value: (row: AdminApplication) => row.note ?? '' },
            ], rows)} />
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Candidate applications</caption>
                    <thead className="border-b border-gray-200 bg-gray-50">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-500">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
                    <tbody className="bg-white">{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-gray-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No applications found on this page.</td></tr>}</tbody>
                </table>
                <PaginationControls pagination={applications?.pagination} onPageChange={setPage} />
            </div>
        </div>
    )
}

export default ApplicationsPageTable
