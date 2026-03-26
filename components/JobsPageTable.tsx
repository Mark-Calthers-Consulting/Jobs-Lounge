'use client'
import { useAdminVacancies } from "@/hooks/useAdmin"
import { useVacancies } from "@/hooks/useVacancies"
import { Job } from "@/types/types"
import {
    flexRender,
    getCoreRowModel,
    Row,
    useReactTable,
} from '@tanstack/react-table'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FiMoreVertical } from "react-icons/fi"

const data = []
const JobsPageTable = () => {
    const { data: vacancies, isLoading, error, isError } = useAdminVacancies()
    console.log(vacancies)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const router = useRouter()

    const columns = [
        {
            header: 'Job Title',
            accessorKey: 'title',
        },
        {
            header: 'Status',
            accessorKey: 'status',
        },
        {
            header: 'Applicants',
            accessorKey: 'totalApplicants',
        },
        {
            header: 'Date Posted',
            accessorKey: 'createdAt',
            cell: ({ getValue }) => {
                const date = new Date(getValue())
                return date.toLocaleDateString('en-NG', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                })
            },
        },
        {
            header: 'Actions',
            id: 'actions',
            cell: ({ row }: { row: Row<Job> }) => (
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
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow-md z-10">
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => router.push(`/vacancies/${row.original._id}`)}
                            >
                                View Job
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                                onClick={() => alert(`Edit job ${row.original.title}`)}
                            >
                                Edit Job
                            </button>
                            <button
                                className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                onClick={() => alert(`Delete job ${row.original.title}`)}
                            >
                                Delete Job
                            </button>
                        </div>
                    )}
                </div>
            ),
        },
    ]
    const table = useReactTable({
        data: vacancies || [],
        columns,
        getCoreRowModel: getCoreRowModel()
    })
    if (isLoading) return <div className="p-4">Loading jobs...</div>
    if (isError) return <div className="p-4 text-red-500">Error loading jobs.</div>
    return (
        <div className="w-full overflow-hidden border border-gray-200 rounded-lg shadow-sm">
            <table className="w-full text-left border-collapse">

                {/* Table Header */}
                <thead className="bg-gray-50 border-b border-gray-200">
                    {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <th key={header.id} className="p-4 text-sm font-medium text-gray-500">
                                    {/* flexRender puts the 'header' text from your columns array into the HTML */}
                                    {flexRender(
                                        header.column.columnDef.header,
                                        header.getContext()
                                    )}
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>

                {/* Table Body */}
                <tbody className="bg-white">
                    {table.getRowModel().rows.length > 0 ? (
                        table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-4 text-sm text-gray-900">
                                        {/* flexRender pulls the data from your accessorKey and puts it in the cell */}
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className="p-8 text-center text-gray-500">
                                No jobs found.
                            </td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    )
}

export default JobsPageTable