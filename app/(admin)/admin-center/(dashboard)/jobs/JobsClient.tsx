'use client'
import JobsPageTable from '@/components/JobsPageTable'
import Link from 'next/link'
import { LuPlus } from 'react-icons/lu'

const JobsClient = () => {
    return (
        <div className="space-y-6">
            <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
                <div>
                    <h1 className="text-2xl font-bold text-slate-950">Jobs</h1>
                    <p className="mt-1 text-sm text-slate-600">
                        Manage your job listings and applications.
                    </p>
                </div>
                <Link
                    href="/admin-center/jobs/create"
                    className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-md bg-[#184aa2] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#123d88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 sm:self-auto"
                >
                    <LuPlus aria-hidden="true" />
                    Create job
                </Link>
            </header>

            <div>
                <JobsPageTable />
            </div>
        </div>
    )
}

export default JobsClient
