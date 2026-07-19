'use client'

import { useGetJobCandidates } from '@/hooks/useAdmin'
import type { User } from '@/types/types'
import { downloadCsv } from '@/utils/csv'
import { useMemo, useState } from 'react'
import { BsTelephone } from 'react-icons/bs'
import { CiMail } from 'react-icons/ci'
import { PiSuitcase } from 'react-icons/pi'
import PaginationControls from './PaginationControls'
import TableToolbar from './TableToolbar'

const CandidatesGrid = () => {
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const { data: candidates, isLoading, error } = useGetJobCandidates(page)
    const rows = useMemo(() => {
        const query = search.trim().toLowerCase()
        return (candidates?.data ?? []).filter((candidate) => !query || [
            candidate.name,
            candidate.email,
            candidate.telephone,
        ].some((value) => value?.toLowerCase().includes(query)))
    }, [candidates?.data, search])

    if (isLoading) return <p role="status">Loading candidates…</p>
    if (error) return <p role="alert" className="text-red-700">{error.message}</p>

    return (
        <>
            <TableToolbar label="candidates" value={search} onChange={setSearch} exportDisabled={!rows.length} onExport={() => downloadCsv('candidates-current-page.csv', [
                { header: 'Name', value: (candidate: User) => candidate.name ?? '' },
                { header: 'Email', value: (candidate: User) => candidate.email },
                { header: 'Telephone', value: (candidate: User) => candidate.telephone },
                { header: 'Applications', value: (candidate: User) => candidate.applicationCount ?? 0 },
                { header: 'Joined', value: (candidate: User) => candidate.createdAt },
            ], rows)} />
            <div aria-label="Candidates" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {rows.map((candidate) => (
                    <article className="flex flex-col gap-2 rounded bg-white p-4 shadow ring-1 ring-gray-200" key={candidate._id}>
                        <div><h2>{candidate.name}</h2><p className="text-sm text-gray-600">Joined {new Date(candidate.createdAt).toLocaleDateString('en-NG')}</p></div>
                        <p className="flex items-center gap-2 text-sm text-gray-600"><CiMail aria-hidden="true" /><a className="underline" href={`mailto:${candidate.email}`}>{candidate.email}</a></p>
                        <p className="flex items-center gap-2 text-sm text-gray-600"><BsTelephone aria-hidden="true" /><a className="underline" href={`tel:${candidate.telephone}`}>{candidate.telephone}</a></p>
                        <hr className="border-[#79797923]" />
                        <p className="flex items-center gap-1 text-sm text-gray-600"><PiSuitcase aria-hidden="true" className="mr-2" size={16} color="#155DFC" /><span className="font-semibold text-[#111]">{candidate.applicationCount ?? 0}</span> applications</p>
                    </article>
                ))}
                {!rows.length && <p className="text-gray-600">No candidates found on this page.</p>}
            </div>
            <PaginationControls pagination={candidates?.pagination} onPageChange={setPage} />
        </>
    )
}

export default CandidatesGrid
