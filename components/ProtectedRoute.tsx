'use client'

import { useUser } from '@/hooks/useUsers'
import {
  landingPageForRole,
  loginPageForArea,
  roleCanAccessArea,
  type ProtectedArea,
} from '@/utils/authRouting'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RouteAccessState from './RouteAccessState'

type ProtectedRouteProps = {
  area: ProtectedArea
  children: React.ReactNode
}

const ProtectedRoute = ({ area, children }: ProtectedRouteProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isPending, isError, refetch } = useUser()
  const allowed = Boolean(user && roleCanAccessArea(user.role, area))

  useEffect(() => {
    if (isPending || isError || allowed) return

    if (!user) {
      const loginPage = loginPageForArea(area)
      router.replace(`${loginPage}?next=${encodeURIComponent(pathname)}`)
      return
    }

    router.replace(landingPageForRole(user.role))
  }, [allowed, area, isError, isPending, pathname, router, user])

  if (isError) return <RouteAccessState error retry={() => { void refetch() }} />
  if (isPending || !allowed) return <RouteAccessState />

  return children
}

export default ProtectedRoute
