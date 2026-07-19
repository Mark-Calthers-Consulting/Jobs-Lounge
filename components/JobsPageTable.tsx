'use client'

import { useAdminVacancies, useDeleteAdminJob } from '@/hooks/useAdmin'
import type { Job } from '@/types/types'
import { downloadCsv } from '@/utils/csv'
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
    const { data: vacancies, isLoading, isError } = useAdminVacancies(page)
    const deleteJob = useDeleteAdminJob()
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

    const columns = [
        { header: 'Job Title', accessorKey: 'title' },
        { header: 'Status', accessorKey: 'status' },
        { header: 'Applicants', accessorKey: 'totalApplicants' },
        { header: 'Date Posted', accessorKey: 'createdAt', cell: ({ getValue }: { getValue: () => unknown }) => new Date(String(getValue())).toLocaleDateString('en-NG') },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }: { row: { original: Job } }) => (
                <div className="flex flex-wrap gap-3">
                    <Link className="underline" href={`/vacancies/${row.original._id}`}>View</Link>
                    <Link className="underline" href={`/admin-center/jobs/${row.original._id}/edit`}>Edit</Link>
                    <button type="button" className="text-red-700 underline" onClick={() => setJobToDelete(row.original)}>Delete</button>
                </div>
            ),
        },
    ]
    const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

    if (isLoading) return <p role="status" className="p-4">Loading jobs…</p>
    if (isError) return <p role="alert" className="p-4 text-red-700">Error loading jobs.</p>

    return (
        <div>
            <TableToolbar label="jobs" value={search} onChange={setSearch} exportDisabled={!rows.length} onExport={() => downloadCsv('jobs-current-page.csv', [
                { header: 'Title', value: (job: Job) => job.title },
                { header: 'Company', value: (job: Job) => job.company.name },
                { header: 'Status', value: (job: Job) => job.status },
                { header: 'Applicants', value: (job: Job) => job.totalApplicants ?? 0 },
                { header: 'Created', value: (job: Job) => job.createdAt },
            ], rows)} />
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Job listings</caption>
                    <thead className="border-b border-gray-200 bg-gray-50">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-600">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
                    <tbody className="bg-white">{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-gray-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No jobs found on this page.</td></tr>}</tbody>
                </table>
                <PaginationControls pagination={vacancies?.pagination} onPageChange={setPage} />
            </div>
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
