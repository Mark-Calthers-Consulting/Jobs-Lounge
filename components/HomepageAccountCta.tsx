'use client'

import Link from 'next/link'

import { useUser } from '@/hooks/useUsers'

const ctaClassName = 'inline-flex min-h-12 min-w-44 items-center justify-center border border-[#071a3d] px-6 text-sm font-semibold text-[#071a3d] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-slate-100 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2'

export default function HomepageAccountCta() {
  const { data: user, isPending } = useUser()

  if (isPending) {
    return (
      <span role="status" className={`${ctaClassName} cursor-wait`}>
        <span aria-hidden="true" className="h-4 w-28 animate-pulse bg-slate-200" />
        <span className="sr-only">Checking your account</span>
      </span>
    )
  }

  if (!user) {
    return <Link href="/auth?mode=register" className={ctaClassName}>Create your profile</Link>
  }

  if (user.role !== 'user') {
    return <Link href="/admin-center" className={ctaClassName}>Go to dashboard</Link>
  }

  const profileIsComplete = user.profileCompletion?.complete
    ?? user.profileCompleted
    ?? false

  return (
    <Link href="/dashboard/profile" className={ctaClassName}>
      {profileIsComplete ? 'Go to your profile' : 'Complete your profile'}
    </Link>
  )
}
