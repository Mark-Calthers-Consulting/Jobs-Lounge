'use client'

import { useUser } from '@/hooks/useUsers'
import {
  landingPageForRole,
  roleCanAccessArea,
  type ProtectedArea,
} from '@/utils/authRouting'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import RouteAccessState from './RouteAccessState'

type GuestOnlyRouteProps = {
  area: ProtectedArea
  children: React.ReactNode
  nextPath?: string
}

const GuestOnlyRoute = ({ area, children, nextPath }: GuestOnlyRouteProps) => {
  const router = useRouter()
  const { data: user, isPending, isError, refetch } = useUser()

  useEffect(() => {
    if (!isPending && !isError && user) {
      const destination = nextPath && roleCanAccessArea(user.role, area)
        ? nextPath
        : landingPageForRole(user.role)
      router.replace(destination)
    }
  }, [area, isError, isPending, nextPath, router, user])

  if (isError) return <RouteAccessState error retry={() => { void refetch() }} />
  if (isPending || user) return <RouteAccessState />

  return children
}

export default GuestOnlyRoute
