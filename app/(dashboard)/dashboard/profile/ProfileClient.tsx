'use client'
import { useEditUserDetails, useUser } from '@/hooks/useUsers'
import { useState } from 'react'
import { FaLink } from 'react-icons/fa'

const ProfileClient: React.FC = () => {
    const [cvLink, setCvLink] = useState('')
    const { data: user, isLoading, error, isError } = useUser()

    const resumeValue = cvLink || user?.cvLink || '';

    const editDetailsMutation = useEditUserDetails()

    //TODO - EXPAND TO BE ABLE TO EDIT OTHER FIELD APART FROM RESUME

    const saveDetails = async () => {
        await editDetailsMutation.mutateAsync({
            cvLink
        })
    }

    return (
        <div>
            <h1 className='text-3xl'>My Profile</h1>
            <p className='my-3'>Manage your personal information</p>

            <div className="my-4">
                <section className='bg-white ring-1 ring-black/10 p-5 rounded'>
                    <h3 className='font-semibold text-xl my-3'>General Information</h3>
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div className="">
                            <h4>Full Name</h4>
                            <p className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.name}</p>
                        </div>
                        <div className="">
                            <h4>Email Address</h4>
                            <p className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.email}</p>
                        </div>
                        <div className="">
                            <h4>Phone Number</h4>
                            <p className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.telephone}</p>
                        </div>
                        {/* <div className="">
                            <h4>Gender</h4>
                            <p className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.gender}</p>
                        </div> */}
                    </div>
                </section>
                <section className='bg-white ring-1 ring-black/10 p-5 rounded my-4'>
                    <h3 className='font-semibold text-xl my-3'>Resume</h3>
                    <p>Add a link to your resume (Google Drive, Dropbox, personal website, etc.). This helps you quickly access it when applying through Google Forms.</p>
                    <div className="flex gap-3 my-2">
                        <div className="flex-1 relative">
                            <FaLink color='99A1AF' size={14} className='absolute left-3 top-1/2 -translate-y-1/2' />

                            <input value={resumeValue} onChange={(e) => setCvLink(e.target.value)} placeholder={resumeValue ? '' : 'Put your cv link here'} className='w-full px-8 py-2 focus:outline-none bg-[#F3F3F5]' type="text" />
                        </div>
                        <button className='cursor-pointer hover:bg-white w-max ring-1 ring-black/10 px-3 py-1 rounded-sm'>View</button>
                    </div>
                    <p className='text-xs'>Make sure your resume link is publicly accessible or shareable</p>
                </section>
            </div>

            <button onClick={saveDetails} className='cursor-pointer hover:bg-[#003a6dbb] bg-[#184aa2] text-white px-4 py-2 rounded-sm'>Save Link</button>
        </div>
    )
}

export default ProfileClient