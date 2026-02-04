'use client'
import { useUser } from '@/hooks/useUsers'

const ProfileClient: React.FC = () => {
    const { data, isLoading, error, isError } = useUser()
    return (
        <div>
            <h1 className='text-3xl'>My Profile</h1>
            <p className='my-3'>Manage your personal information</p>
            <section className='ring-1 ring-black/10 p-5 rounded'>
                <h3 className='font-semibold text-2xl'>General Information</h3>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                    <div className="">
                        <h4>Full Name</h4>
                        <p className='bg-gray-200 rounded px-4 py-2'>Yinka Adebayo</p>
                    </div>
                    <div className="">
                        <h4>Email Address</h4>
                        <p className='bg-gray-200 rounded px-4 py-2'>yinka@jobs.com</p>
                    </div>
                    <div className="">
                        <h4>Phone Number</h4>
                        <p className='bg-gray-200 rounded px-4 py-2'>+2348012345678</p>
                    </div>
                    <div className="">
                        <h4>Current Job Title</h4>
                        <p className='bg-gray-200 rounded px-4 py-2'>Software Engineer</p>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default ProfileClient