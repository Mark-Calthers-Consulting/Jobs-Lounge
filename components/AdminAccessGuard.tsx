'use client'

import { useUser } from '@/hooks/useUsers'
import { useStaffFeatureSettings } from '@/hooks/useSettings'
import {
  hasStaffPermission,
  permissionForAdminPath,
} from '@/utils/staffPermissions'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import RouteAccessState from './RouteAccessState'

const AdminAccessGuard = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname()
  const router = useRouter()
  const { data: user, isPending } = useUser()
  const featureSettings = useStaffFeatureSettings(user?.role === 'recruiter' || user?.role === 'admin', user?._id)
  const permission = permissionForAdminPath(pathname)
  const emailRoute = pathname === '/admin-center/emails' || pathname.startsWith('/admin-center/emails/')
  const waitingForFeature = emailRoute && user?.role !== 'super-admin' && featureSettings.isPending
  const allowed = Boolean(
    user
    && (emailRoute
      ? user.role === 'super-admin' || (['admin', 'recruiter'].includes(user.role) && featureSettings.data?.candidateEmail?.enabled === true)
      : hasStaffPermission(user.role, permission)),
  )

  useEffect(() => {
    if (isPending || waitingForFeature || !user || allowed) return
    router.replace('/admin-center?access=denied')
  }, [allowed, isPending, router, user, waitingForFeature])

  if (isPending || waitingForFeature || !allowed) return <RouteAccessState />
  return children
}

export default AdminAccessGuard
