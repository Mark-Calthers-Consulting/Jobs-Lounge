'use client'
import type { Job } from "@/types/types"
import Link from "next/link"
import JobFilters from "@/components/JobFilters"
import { useVacancies } from "@/hooks/useVacancies"
import { useEffect, useMemo, useState } from "react"
import PaginationControls from "@/components/PaginationControls"

const Vacancies: React.FC = () => {
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [page, setPage] = useState(1)

  const [filterData, setFilterData] = useState<{ datePosted: string, level: string[] }>({
    datePosted: '',
    level: []
  })

  const { data: vacancyPage, isLoading, isError } = useVacancies(searchTerm, page)
  const data = vacancyPage?.data ?? []
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    const trimmed = inputValue.trim()

    const timer = setTimeout(() => {
      if (trimmed.length < 3) {
        setSearchTerm("")
        setPage(1)
        return
      }

      setSearchTerm(trimmed)
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [inputValue])


  const filteredJobs = useMemo(() => {
    let result = [...data]

    if (filterData.level.length > 0) {
      result = result.filter(job => filterData.level.includes(job.level))
    }

    if (filterData.datePosted) {
      const now = new Date()

      result = result.filter(job => {
        const postedDate = new Date(job.createdAt)
        const diffMs = now.getTime() - postedDate.getTime()
        const diffDays = diffMs / (1000 * 60 * 60 * 24)

        if (filterData.datePosted === "24h") return diffDays <= 1
        if (filterData.datePosted === "7d") return diffDays <= 7
        if (filterData.datePosted === "30d") return diffDays <= 30
        return true
      })
    }

    return result
  }, [data, filterData])

  return (
    <div className="max-w-7xl mx-auto">
      <section className="px-12 py-4 mb-8 bg-[#003B6D] flex items-center justify-between">
        <p className="text-white">Find Jobs</p>
        <input type="search" maxLength={80} value={inputValue} onChange={handleSearchChange} className=" bg-white placeholder:text-sm w-65 rounded px-4 py-2 outline-none" placeholder="Search jobs by title (min. 3 letters)" aria-label="Search jobs by title" />
        <p className="text-white hidden sm:block">Home <span className="">/ Vacancies</span></p>
      </section>
      <section className="flex flex-col sm:flex-row px-12 gap-4 mb-6">
        <section>
          <JobFilters
            filterData={filterData}
            setFilterData={setFilterData}
          />
        </section>
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start">

          {isLoading && <p className="col-span-full mx-auto text-xl">Loading jobs...</p>}

          {isError && <p className="col-span-full">Could not load jobs.</p>}
          {!isLoading && filteredJobs?.length == 0
            ?(
              <div className="col-span-full flex items-center justify-center py-16">
                <div className="text-center px-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M9.172 9.172a4 4 0 115.656 5.656M15 15l5 5m-5-5A7 7 0 1110 3a7 7 0 015 12z" />
                    </svg>
                  </div>

                  <h3 className="mt-4 text-lg font-semibold text-gray-900">
                    No matching jobs
                  </h3>

                  <p className="mt-2 text-sm text-gray-500 max-w-sm mx-auto">
                    Try changing your search keywords or removing some filters to see more results.
                  </p>
                </div>
              </div>
            )
            : filteredJobs.map((job: Job) => (
              <div key={job._id} className=" ring-2 ring-gray-100 p-5 rounded ">
                <p className="text-[#959595] text-sm">{job.company.name}</p>
                <h3 className="font-semibold ">{job.title}</h3>
                <p className="text-[#959595] my-2 leading-5">{job.description.slice(0, 90)}...</p>
                <div className="flex gap-2">
                  <p className="text-[#222] bg-[#e3e3e3] px-2 py-1 rounded text-sm ">{job.jobType}</p>
                  <p className="text-[#222] bg-[#e3e3e3] px-2 py-1 rounded text-sm ">{job.level} level</p>
                </div>
                <hr className="my-3 text-[#d4d4d4]" />
                <div className="flex justify-between items-center">
                  <p className="text-sm max-w-1/2 text-[#7f7f7f]">{job.location}</p>
                  <Link className="" key={job._id} href={`/vacancies/${job._id}`}>
                    <button className="cursor-pointer rounded text-sm px-5 py-2  bg-[#003B6D] text-white">Apply Now</button>
                  </Link>
                </div>
              </div>
            ))}
        </section>
      </section>
      <PaginationControls pagination={vacancyPage?.pagination} onPageChange={setPage} />
    </div>
  )
}

export default Vacancies
