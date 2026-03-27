'use client'

import { useAdminApplications, useGetTeamMembers } from "@/hooks/useAdmin"
import {
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { FiMoreVertical } from "react-icons/fi"

type Application = {
    applicantId: string
    name: string
    email: string
    jobId: string
    title: string
    createdAt: string
    status: string
}

const TeamPageTable = () => {
    const { data: applications, isLoading, isError } = useGetTeamMembers()
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    const columns = [
        {
            header: "Member",
            accessorKey: "name",
        },
        {
            header: "Role",
            accessorKey: "role",
        },
        {
            header: "Email",
            accessorKey: "email",
        },
        // {
        //   header: "Status",
        //   accessorKey: "status",
        //   cell: ({ getValue }: { getValue: () => unknown }) => (
        //     <span className="capitalize">{String(getValue())}</span>
        //   ),
        // },
        {
            header: "Date Joined",
            accessorKey: "createdAt",
            cell: ({ getValue }: { getValue: () => unknown }) => {
                const date = new Date(String(getValue()))
                return date.toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                })
            },
        },
        {
            header: "Actions",
            id: "actions",
            cell: ({ row }: { row: Row<Application> }) => (
                <div className="relative">
                    <button
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={() =>
                            setOpenMenuId(openMenuId === row.id ? null : row.id)
                        }
                    >
                        <FiMoreVertical size={18} />
                    </button>

                    {openMenuId === row.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded shadow-md z-10">
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => alert(`Update status for ${row.original.name}`)}
                            >
                                Update Status
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ]

    const table = useReactTable({
        data: applications || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (isLoading) return <div className="p-4">Loading applications...</div>
    if (isError) return <div className="p-4 text-red-500">Error loading applications.</div>

    return (
        <div className="w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th
                                    key={header.id}
                                    className="p-4 text-sm font-medium text-gray-500"
                                >
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                <tbody className="bg-white">
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <tr
                                key={row.id}
                                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-4 text-sm text-gray-900">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                No applications found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}

export default TeamPageTable