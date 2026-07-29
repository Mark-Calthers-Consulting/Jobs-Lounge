'use client'

import { useUser } from '@/hooks/useUsers'
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
  const permission = permissionForAdminPath(pathname)
  const allowed = Boolean(user && hasStaffPermission(user.role, permission))

  useEffect(() => {
    if (isPending || !user || allowed) return
    router.replace('/admin-center?access=denied')
  }, [allowed, isPending, router, user])

  if (isPending || !allowed) return <RouteAccessState />
  return children
}

export default AdminAccessGuard
