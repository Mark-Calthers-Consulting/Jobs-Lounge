'use client'
import { useGetJobCandidates } from '@/hooks/useAdmin'
import { User } from '@/types/types'
import React from 'react'
import { useState } from 'react'
import { BsTelephone } from 'react-icons/bs'
import { CiMail } from 'react-icons/ci'
import { PiSuitcase } from 'react-icons/pi'
import PaginationControls from './PaginationControls'

const CandidatesGrid = () => {

  const [page, setPage] = useState(1)
  const { data: candidates, isLoading, error } = useGetJobCandidates(page)
  if (isLoading) return <p role="status">Loading candidates…</p>
  if (error) {
    return <p role="alert" className="text-red-700">{error.message}</p>
  }

  return (
    <>
      <div aria-label="Candidates" className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {candidates?.data.map((candidate: User) => (
          <article className="bg-white flex flex-col gap-2 rounded p-4 ring-1 ring-gray-200 shadow" key={candidate._id}>
            <div className="">
              <h2>{candidate.name}</h2>
              {candidate.createdAt && (
                <p className='text-sm text-gray-600'>
                  Joined       {new Date(candidate.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <p className='text-gray-600 flex items-center gap-2 text-sm'><CiMail aria-hidden="true" /><a className="underline" href={`mailto:${candidate.email}`}>{candidate.email}</a></p>
            <p className='text-gray-600 flex items-center gap-2 text-sm'><BsTelephone aria-hidden="true" /><a className="underline" href={`tel:${candidate.telephone}`}>{candidate.telephone}</a></p>
            <hr className='border-[#79797923]' />
            <div className="">
              <p className='text-gray-600 text-sm flex gap-1 items-center'><PiSuitcase aria-hidden="true" className='mr-2' size={16} color='#155DFC' /><span className='font-semibold text-[#111]'>{candidate.applicationCount ?? 0}</span> applications</p>
            </div>
          </article>
        ))
        }
      </div>
      <PaginationControls pagination={candidates?.pagination} onPageChange={setPage} />
    </>
  )
}

export default CandidatesGrid
