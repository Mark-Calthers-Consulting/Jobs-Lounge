'use client'
import { useEditUserDetails, useUser } from '@/hooks/useUsers'
import { useState } from 'react'
import { FaLink } from 'react-icons/fa'
import { toast } from 'sonner'

const ProfileClient: React.FC = () => {
    const [cvLink, setCvLink] = useState<string | null>(null)
    const { data: user, isLoading, error, isError } = useUser()

    const resumeValue = cvLink ?? user?.cvLink ?? ''

    const editDetailsMutation = useEditUserDetails()

    //TODO - EXPAND TO BE ABLE TO EDIT OTHER FIELD APART FROM RESUME
    const saveDetails = async () => {
        const trimmedLink = resumeValue.trim()
        try {
            await editDetailsMutation.mutateAsync({ cvLink: trimmedLink })
            toast.success('Resume link updated!')
        } catch {
            toast.error('Failed to update resume link')
        }
    }

    const openResumeLink = () => {
        const trimmedLink = resumeValue.trim()

        if (!trimmedLink) return

        const formattedLink = /^https?:\/\//i.test(trimmedLink)
            ? trimmedLink
            : `https://${trimmedLink}`

        window.open(formattedLink, '_blank', 'noopener,noreferrer')
    }

    if (isLoading) return <p role="status">Loading profile…</p>
    if (isError) return <p role="alert" className="text-red-700">{error?.message || 'Unable to load your profile.'}</p>

    return (
        <div>
            <h1 className='text-3xl'>My Profile</h1>
            <p className='my-3'>Manage your personal information</p>

            <div className="my-4">
                <section className='bg-white ring-1 ring-black/10 p-5 rounded'>
                    <h2 className='font-semibold text-xl my-3'>General information</h2>
                    <dl className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <div><dt className="font-medium">Full name</dt><dd className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.name}</dd></div>
                        <div><dt className="font-medium">Email address</dt><dd className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.email}</dd></div>
                        <div><dt className="font-medium">Phone number</dt><dd className='bg-[#F3F3F5] rounded px-4 py-2'>{user?.telephone}</dd></div>
                    </dl>
                </section>
                <section className='bg-white ring-1 ring-black/10 p-5 rounded my-4'>
                    <h2 className='font-semibold text-xl my-3'>Resume</h2>
                    <p id="resume-link-help">Add a link to your resume (Google Drive, Dropbox, personal website, etc.). Make sure it is publicly accessible or shareable.</p>
                    <div className="flex gap-3 my-2">
                        <div className="flex-1 relative">
                            <FaLink aria-hidden="true" color='#6B7280' size={14} className='absolute left-3 top-1/2 -translate-y-1/2' />

                            <label htmlFor="resume-link" className="sr-only">Resume link</label>
                            <input id="resume-link" name="resumeLink" value={resumeValue} onChange={(e) => setCvLink(e.target.value)} placeholder="https://example.com/my-resume" aria-describedby="resume-link-help" className='w-full px-8 py-2 bg-[#F3F3F5]' type="url" inputMode="url" />
                        </div>
                        <button disabled={!resumeValue.trim()}
                            onClick={openResumeLink}
                            type='button'
                            className="cursor-pointer hover:bg-white w-max ring-1 ring-black/10 px-3 py-1 rounded-sm disabled:opacity-50 disabled:cursor-not-allowed" >View</button>
                    </div>
                </section>
            </div>

            <button disabled={editDetailsMutation.isPending} type='button' onClick={saveDetails} className='cursor-pointer hover:bg-[#003a6dbb] bg-[#184aa2] text-white px-4 py-2 rounded-sm disabled:cursor-wait disabled:opacity-70'>{editDetailsMutation.isPending ? 'Saving…' : 'Save link'}</button>
        </div>
    )
}

export default ProfileClient
