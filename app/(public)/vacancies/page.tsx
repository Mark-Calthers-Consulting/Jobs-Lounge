'use client'
import type { Job } from "@/types/types"
import Link from "next/link"
import JobFilters from "@/components/JobFilters"
import { useVacancies } from "@/hooks/useVacancies"

const Vacancies: React.FC = () => {

  const { data = [], isLoading, error, isError } = useVacancies()
  console.log(data)

  return (
    <div>
      <section className="px-12 py-4 mb-8 bg-[#003B6D] flex items-center justify-between">
        <p className="text-white">Find Jobs</p>
        <input type="text" className="bg-white rounded px-4 py-2 outline-none" placeholder="Search Jobs" />
        <p className="text-white">Home <span className="fontbo">/ Vacancies</span></p>
      </section>
      <section className="flex px-12 gap-4 mb-6">
        <section>
          <JobFilters />
        </section>
        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 content-start">
          {isLoading && <p className="col-span-full">Loading jobs...</p>}
          {isError && <p className="col-span-full">Could not load jobs.</p>}
          {data.map((job: Job) => (
            <div key={job._id} className="shadow p-5 rounded">
              <p className="text-[#959595] text-sm">{job.company.name}</p>
              <h3 className="font-semibold ">{job.title}</h3>
              <p>{job.location}</p>
              <p className="text-[#959595] my-2 leading-5">{job.description.slice(0,90)}...</p>
              <div className="flex gap-2">
                <p className="text-white bg-[#B9D6FF] px-2 py-1 rounded text-sm ">{job.jobType}</p>
                <p className="text-white bg-[#B9D6FF] px-2 py-1 rounded text-sm ">{job.level} level</p>
              </div>
              <Link key={job._id} href={`/vacancies/${job._id}`}>
                <button className="cursor-pointer rounded text-sm px-5 py-1 mt-3 bg-[#003B6D] text-white">View Job</button>
              </Link>
            </div>
          ))}
        </section>
      </section>
    </div>
  )
}

export default Vacancies
