'use client'
import type { Job } from "@/types/types"
import Link from "next/link"
import JobFilters from "@/components/JobFilters"
import { useVacancies } from "@/hooks/useVacancies"
import { useEffect, useState } from "react"

const Vacancies: React.FC = () => {
  const [inputValue, setInputValue] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  const { data = [], isLoading, error, isError } = useVacancies(searchTerm)
  console.log(data)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }

  useEffect(() => {
    const trimmed = inputValue.trim()

    const timer = setTimeout(() => {
      if (trimmed.length < 3) {
        setSearchTerm("")
        return
      }

      setSearchTerm(trimmed)
    }, 400)

    return () => clearTimeout(timer)
  }, [inputValue])

  return (
    <div className="max-w-7xl mx-auto">
      <section className="px-12 py-4 mb-8 bg-[#003B6D] flex items-center justify-between">
        <p className="text-white">Find Jobs</p>
        <input type="text" value={inputValue} onChange={handleSearchChange} className=" bg-white placeholder:text-sm w-65 rounded px-4 py-2 outline-none" placeholder="Search jobs by title (min. 3 letters)" />
        <p className="text-white hidden sm:block">Home <span className="fontbo">/ Vacancies</span></p>
      </section>
      <section className="flex flex-col sm:flex-row px-12 gap-4 mb-6">
        <section>
          <JobFilters />
        </section>
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start">
          {isLoading && <p className="col-span-full">Loading jobs...</p>}
          {isError && <p className="col-span-full">Could not load jobs.</p>}
          {data.map((job: Job) => (
            <div key={job._id} className=" ring-2 ring-gray-100 p-5 rounded ">
              <p className="text-[#959595] text-sm">{job.company.name}</p>
              <h3 className="font-semibold ">{job.title}</h3>
              {/* <p>{job.location}</p> */}
              <p className="text-[#959595] my-2 leading-5">{job.description.slice(0, 90)}...</p>
              <div className="flex gap-2">
                {/* <p className="text-white bg-[#B9D6FF] px-2 py-1 rounded text-sm ">{job.jobType}</p>
                <p className="text-white bg-[#B9D6FF] px-2 py-1 rounded text-sm ">{job.level} level</p> */}
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
    </div>
  )
}

export default Vacancies
