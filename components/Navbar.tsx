'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { FiMenu, FiX } from 'react-icons/fi'

import { useUser } from '@/hooks/useUsers'

const navigationItems = [
  { href: '/', label: 'Home' },
  { href: '/vacancies', label: 'Vacancies' },
  { href: '/blog', label: 'Career insights' },
  { href: '/contact', label: 'Contact' },
]

const Navbar = (): React.JSX.Element => {
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

  const isActive = (href: string) => (
    href === '/' ? pathname === href : pathname.startsWith(href)
  )
  const accountHref = user?.role === 'user' ? '/dashboard' : '/admin-center'
  const accountLabel = user ? 'Dashboard' : 'Sign in'
  const accountButtonTone = user
    ? 'bg-[#1B1F87] hover:bg-[#15196D]'
    : 'bg-[#003B6D] hover:bg-[#002F57]'

  return (
    <header className="relative z-[100] w-full bg-white">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-6 md:grid md:h-[92px] md:grid-cols-[1fr_auto_1fr] lg:px-8"
      >
        <Link
          href="/"
          aria-label="Jobs Lounge home"
          className="inline-flex w-fit rounded-md"
          onClick={() => setIsMenuOpen(false)}
        >
          <Image
            width={84}
            height={58}
            src="/logo.svg"
            alt=""
            priority
            className="h-auto w-[84px]"
          />
        </Link>

        <div className="hidden items-center gap-7 md:flex lg:gap-9">
          {navigationItems.map(({ href, label }) => {
            const active = isActive(href)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 px-0.5 py-2 text-sm font-medium transition-colors ${
                  active
                    ? 'border-[#1B1F87] text-[#101A35]'
                    : 'border-transparent text-slate-600 hover:text-[#101A35]'
                }`}
              >
                {label}
              </Link>
            )
          })}
        </div>

        <div className="hidden justify-self-end md:block">
          <Link
            href={user ? accountHref : '/auth'}
            className={`inline-flex min-h-10 items-center justify-center rounded-lg px-5 py-2 text-sm font-semibold text-white transition-colors focus-visible:outline-[#1B1F87] ${accountButtonTone}`}
          >
            {accountLabel}
          </Link>
        </div>

        <button
          ref={menuButtonRef}
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-slate-200 text-[#101A35] transition-colors hover:border-slate-300 hover:bg-slate-50 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-navigation-menu"
        >
          {isMenuOpen
            ? <FiX aria-hidden="true" className="text-xl" />
            : <FiMenu aria-hidden="true" className="text-xl" />
          }
        </button>
      </nav>

      {isMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="absolute inset-x-0 top-full border-y border-slate-200 bg-white shadow-[0_14px_28px_rgba(15,23,42,0.08)] md:hidden"
        >
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-1">
              {navigationItems.map(({ href, label }) => {
                const active = isActive(href)
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setIsMenuOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`rounded-md px-3 py-3 text-sm transition-colors ${
                      active
                        ? 'bg-slate-100 font-semibold text-[#101A35]'
                        : 'font-medium text-slate-600 hover:bg-slate-50 hover:text-[#101A35]'
                    }`}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            <div className="mt-4 border-t border-slate-200 pt-4">
              <Link
                href={user ? accountHref : '/auth'}
                onClick={() => setIsMenuOpen(false)}
                className={`inline-flex min-h-11 w-full items-center justify-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition-colors focus-visible:outline-[#1B1F87] ${accountButtonTone}`}
              >
                {accountLabel}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

export default Navbar
