'use client'
import { useUser } from '@/hooks/useUsers'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'
import { RxHamburgerMenu } from "react-icons/rx";
import { IoClose } from "react-icons/io5";

const Navbar: React.FC = () => {
  const { data: user } = useUser()
  const pathname = usePathname()

  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isMenuOpen) return

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsMenuOpen(false)
      menuButtonRef.current?.focus()
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [isMenuOpen])
  const isAuthed = !!user
  return (
    <nav aria-label="Primary navigation" className='relative flex max-w-7xl mx-auto w-full justify-between items-center px-5 md:px-20 py-4'>
      <Link href='/' aria-label="Jobs Lounge home"><Image width={70} height={70} src='/logo.svg' alt="" /></Link>
      <div className="hidden md:flex items-center text-[#222] text-lg gap-10">
        <Link href='/' aria-current={pathname === '/' ? 'page' : undefined} className={pathname === "/" ? "text-[#111] font-bold border-b-2" : ""}>Home</Link>
        <Link href='/vacancies' aria-current={pathname === '/vacancies' ? 'page' : undefined} className={pathname === "/vacancies" ? "text-[#111] font-bold border-b-2" : ""}>Vacancies</Link>
        <Link href='/contact' aria-current={pathname === '/contact' ? 'page' : undefined} className={pathname === "/contact" ? "text-[#111] font-bold border-b-2" : ""}>Contact</Link>
      </div>
      <div className="hidden md:block">
        {isAuthed
          ? <Link href={user.role === 'user' ? '/dashboard' : '/admin-center'} className='inline-block bg-[#1B1F87] font-semibold rounded text-white px-6 py-3'>Dashboard</Link>
          : <Link href='/auth' className='inline-block bg-[#003B6D] font-semibold rounded text-white px-6 py-3'>Sign in</Link>
        }
      </div>

      <button
        ref={menuButtonRef}
        type="button"
        className='block md:hidden cursor-pointer rounded p-2'
        onClick={() => setIsMenuOpen((open) => !open)}
        aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-navigation-menu"
      >
        {isMenuOpen
          ? <IoClose aria-hidden="true" size={28} color='#1B1F87' />
          : <RxHamburgerMenu aria-hidden="true" size={28} color='#1B1F87' />
        }
      </button>
      {isMenuOpen && (
        <div id="mobile-navigation-menu" className='absolute md:hidden top-full px-6 bg-white rounded py-4 right-2 ring-1 ring-gray-300 shadow flex flex-col gap-4 z-200'>
          <Link onClick={() => setIsMenuOpen(false)} href='/' aria-current={pathname === '/' ? 'page' : undefined} className={pathname === "/" ? "text-[#1B1F87] font-bold" : ""}>Home</Link>
          <Link onClick={() => setIsMenuOpen(false)} href='/vacancies' aria-current={pathname === '/vacancies' ? 'page' : undefined} className={pathname === "/vacancies" ? "text-[#1B1F87] font-bold" : ""}>Vacancies</Link>
          <Link onClick={() => setIsMenuOpen(false)} href='/contact' aria-current={pathname === '/contact' ? 'page' : undefined} className={pathname === "/contact" ? "text-[#1B1F87] font-bold" : ""}>Contact</Link>
          <div>
            {isAuthed
              ? <Link href={user.role === 'user' ? '/dashboard' : '/admin-center'} className='inline-block bg-[#1B1F87] font-semibold text-sm rounded text-white px-5 py-2'>Dashboard</Link>
              : <Link href='/auth' className='inline-block bg-[#1B1F87] font-semibold text-sm rounded text-white px-5 py-2'>Sign in</Link>
            }
          </div>
        </div>
      )
      }
    </nav>

  )
}

export default Navbar
