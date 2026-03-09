'use client'
import { useUser } from '@/hooks/useUsers'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";

const Navbar: React.FC = () => {
  const { data: user, isLoading } = useUser()
  const pathname = usePathname()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const closeMenu = () => setIsMenuOpen(false)

  console.log(user)

  const isAuthed = !!user
  return (
    <nav className='relative flex md:w-[85%] md:mx-auto justify-between items-center px-20 py-4'>
      <Link href='/'><Image width={70} height={70} src='/logo.svg' alt='logo' /></Link>
      <div className="hidden md:flex items-center text-[#1B1F87] gap-10">
        <Link href={'/'} className={pathname === "/" ? "text-[#1b1f87a0] font-bold" : ""}>Home</Link>
        <Link href={'/vacancies'} className={pathname === "/vacancies" ? "text-[#1b1f87a0] font-bold" : ""}>Vacancies</Link>
        <Link href={'/contact'} className={pathname === "/contact" ? "text-[#1b1f87a0] font-bold" : ""}>Contact</Link>
      </div>
      <div className="hidden md:block">
        {isAuthed
          ? <Link href={`${user.role == 'user' ? '/dashboard' : '/admin-center'}`}> <button className='bg-[#1B1F87] font-semibold rounded cursor-pointer  text-white px-6 py-3'>Dashboard</button></Link>
          : <Link href={'/auth'}> <button className='bg-[#1B1F87] font-semibold  rounded cursor-pointer  text-white px-6 py-3'>Sign In</button></Link>
        }
      </div>

      <button className='block md:hidden cursor-pointer' onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
        {isMenuOpen
          ? <IoClose size={28} color='1B1F87' />
          : <RxHamburgerMenu size={28} color='1B1F87' />
        }
      </button>
      {isMenuOpen && (
        <div className='absolute md:hidden top-full px-6 bg-white rounded py-4 right-2 ring-1 ring-gray-300 shadow flex flex-col gap-4 z-200'>
          <Link href={'/'} className={pathname === "/" ? "text-[#1b1f87a0] font-bold" : ""}>Home</Link>
          <Link href={'/vacancies'} className={pathname === "/vacancies" ? "text-[#1b1f87a0] font-bold" : ""}>Vacancies</Link>
          <Link href={'/contact'} className={pathname === "/contact" ? "text-[#1b1f87a0] font-bold" : ""}>Contact</Link>
          <div className="md:block">
            {isAuthed
              ? <Link href={`${user.role == 'user' ? '/dashboard' : '/admin-center'}`}> <button className='bg-[#1B1F87] font-semibold text-sm rounded cursor-pointer  text-white px-5 py-2'>Dashboard</button></Link>
              : <Link href={'/auth'}> <button className='bg-[#1B1F87] font-semibold text-sm  rounded cursor-pointer  text-white px-5 py-2'>Sign In</button></Link>
            }
          </div>
        </div>
      )
      }
    </nav>

  )
}

export default Navbar
