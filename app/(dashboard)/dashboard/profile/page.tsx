import { useUser } from '@/hooks/useUsers'
import React from 'react'

const Profile: React.FC = () => {
    // const { data, isLoading, error, isError } = useUser()
    
    return (
        <div>
            <h1>My Profile</h1>
            <p>Manage your personal information</p>
            <section>
                <h3>General Information</h3>
                <div className=""></div>
            </section>
        </div>
    )
}

export default Profile
