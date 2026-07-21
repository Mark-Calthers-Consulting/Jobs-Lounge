'use client'
import { useAdminVacancies } from "@/hooks/useAdmin"
import { CellContext } from '@tanstack/react-table'
import type { Job } from '@/types/types'
import { isJobDeadlinePast } from '@/utils/jobDeadline'
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'

type Status = 'Open' | 'Closed' | 'Draft'
const columns = [
  {
    header: 'Job Title',
    accessorKey: 'title',
  },
  {
    header: 'Status',
    accessorKey: 'status',
    cell: ({ getValue, row }: CellContext<Job, unknown>) => {
      const status = getValue() as Status


      const styles = {
        Open: 'bg-green-100 text-green-700',
        Closed: 'bg-red-100 text-red-700',
        Draft: 'bg-gray-100 text-gray-700',
      }

      return (
        <div className="flex flex-wrap gap-2">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-700'}`}
          >
            {status}
          </span>
          {isJobDeadlinePast(row.original) ? (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900">
              Deadline passed
            </span>
          ) : null}
        </div>
      )
    },
  },
  {
    header: 'Applicants',
    accessorKey: 'totalApplicants',
  },
  {
    header: 'Date Posted',
    accessorKey: 'createdAt',
    cell: ({ getValue }: CellContext<Job, unknown>) => {
      const date = new Date(getValue() as string)
      return date.toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    },
  },
]

const DashboardJobsTable = () => {
  const { data: vacancies, isLoading, isError } = useAdminVacancies(1, 5)

  const table = useReactTable({
    data: vacancies?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel()
  })
  if (isLoading) return <p role="status" className="p-4">Loading jobs…</p>
  if (isError) return <p role="alert" className="p-4 text-red-700">Error loading jobs.</p>
  return (
    <div className="w-full overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
      <table className="w-full text-left border-collapse">
        <caption className="sr-only">Recent job listings</caption>

        {/* Table Header */}
        <thead className="bg-gray-50 border-b border-gray-200">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th scope="col" key={header.id} className="p-4 text-sm font-medium text-gray-600">
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

export default DashboardJobsTable
