'use client'

import { useGetTeamMembers } from '@/hooks/useAdmin'
import type { User } from '@/types/types'
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'

const TeamPageTable = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const { data: members, isLoading, isError } = useGetTeamMembers(page)
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        return (members?.data ?? []).filter((member) => !query || [
            member.name,
            member.email,
            member.role,
        ].some((value) => value?.toLowerCase().includes(query)))
    }, [members?.data, search])
    const columns = [
        { header: 'Member', accessorKey: 'name' },
        { header: 'Role', accessorKey: 'role' },
        { header: 'Email', accessorKey: 'email', cell: ({ row }: { row: { original: User } }) => <a className="underline" href={`mailto:${row.original.email}`}>{row.original.email}</a> },
        { header: 'Date Joined', accessorKey: 'createdAt', cell: ({ getValue }: { getValue: () => unknown }) => new Date(String(getValue())).toLocaleDateString('en-NG') },
    ]
    const table = useReactTable({ data: rows, columns, getCoreRowModel: getCoreRowModel() })

    if (isLoading) return <p role="status" className="p-4">Loading team members…</p>
    if (isError) return <p role="alert" className="p-4 text-red-700">Error loading team members.</p>

    return (
        <div>
            <TableToolbar label="team" value={search} onChange={setSearch} />
            <div className="w-full overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full border-collapse text-left">
                    <caption className="sr-only">Administration team members</caption>
                    <thead className="border-b border-gray-200 bg-gray-50">{table.getHeaderGroups().map((group) => <tr key={group.id}>{group.headers.map((header) => <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-500">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr>)}</thead>
                    <tbody className="bg-white">{table.getRowModel().rows.length ? table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-gray-100">{row.getVisibleCells().map((cell) => <td key={cell.id} className="p-4 text-sm">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>) : <tr><td colSpan={columns.length} className="p-8 text-center text-gray-500">No team members found on this page.</td></tr>}</tbody>
                </table>
                <PaginationControls pagination={members?.pagination} onPageChange={setPage} />
            </div>
        </div>
    )
}

export default TeamPageTable
