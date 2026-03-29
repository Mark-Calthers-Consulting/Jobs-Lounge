import CreateJobForm from '@/components/CreateJobForm'
import React from 'react'

const page = () => {
    return (
        <div>
            <div className="">
                <h1 className="font-bold text-2xl">Create New Job</h1>
                <p>Fill in the details below to post a new job listing</p>
            </div>
            <CreateJobForm />
        </div>
    )
}

export default page