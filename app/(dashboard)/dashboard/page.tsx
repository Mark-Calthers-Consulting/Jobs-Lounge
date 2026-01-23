'use client'
import { useUser } from '@/hooks/useAuth'
import React from 'react'

const Dashboard: React.FC = () => {
const {data, isLoading, error, isError} = useUser()

if(isLoading){
    return <h1>Loading</h1>
}

console.log(data)
console.log('error', isError)
console.log(error)

    return (
        <div>
            <h1 className='text-3xl'>Welcome back, {data.name}</h1>

        </div>
    )
}

export default Dashboard
