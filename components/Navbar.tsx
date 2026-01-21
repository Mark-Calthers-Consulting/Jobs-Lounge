'use client'
import { useUser } from '@/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navbar: React.FC = () => {
  const { data: user, isLoading } = useUser()
  const isAuthed = !!user
  return (
    <div className='flex justify-between items-center px-20 py-4'>
      <Image width={70} height={70} src='/logo.svg' alt='logo' />
      <div className="flex items-center text-[#1B1F87] gap-12">
        <Link href={'/'}>Home</Link>
        <Link href={'/vacancies'}>Vacancies</Link>
        <Link href={'/contact'}>Contact</Link>
        {isAuthed
          ? <Link href={'/dashboard'}> <button className='bg-[#1B1F87] font-semibold rounded  text-white px-8 py-3'>Dashboard</button></Link>
          : <Link href={'/auth'}> <button className='bg-[#1B1F87] font-semibold  rounded  text-white px-8 py-3'>Sign In</button></Link>}
      </div>
    </div>
  )
}

export default Navbar
