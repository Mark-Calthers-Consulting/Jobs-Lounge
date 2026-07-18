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
  if (isLoading) return <p>Loading...</p>
  if (error) {
    return <p>{error.message}</p>
  }

  return (
    <>
      <div>CandidatesGrid</div>
      <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {candidates?.data.map((candidate: User) => (
          <div className="bg-white flex flex-col gap-2  rounded p-4 ring-1 ring-gray-200 shadow" key={candidate._id}>
            <div className="">
              <h2>{candidate.name}</h2>
              {candidate.createdAt && (
                <p className='text-sm text-[#5e5e5e]'>
                  Joined       {new Date(candidate.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              )}
            </div>
            <p className='text-[#797979] flex items-center gap-2 text-sm'> <CiMail color='797979' /> {candidate.email}</p>
            <p className='text-[#797979] flex items-center gap-2 text-sm'> <BsTelephone color='797979' /> {candidate.telephone}</p>
            <hr className='border-[#79797923]' />
            <div className="">
              <p className='text-[#797979] text-sm flex gap-1 items-center'><PiSuitcase className='mr-2' size={16} color='155DFC' /><span className='font-semibold text-[#111]'>{candidate.applicationCount ?? 0}</span> applications</p>
            </div>
          </div>
        ))
        }
      </div>
      <PaginationControls pagination={candidates?.pagination} onPageChange={setPage} />
    </>
  )
}

export default CandidatesGrid
