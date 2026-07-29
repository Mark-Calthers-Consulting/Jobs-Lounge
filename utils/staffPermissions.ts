import type { UserRole } from '@/constants/enums'

export type StaffPermission =
  | 'admin:access'
  | 'jobs:manage'
  | 'jobs:archive'
  | 'applications:review'
  | 'candidates:view'
  | 'blogs:create'
  | 'team:manage'

const permissionsByRole: Partial<Record<UserRole, readonly StaffPermission[]>> = {
  admin: ['admin:access', 'jobs:manage'],
  recruiter: [
    'admin:access',
    'jobs:manage',
    'jobs:archive',
    'applications:review',
    'candidates:view',
    'blogs:create',
  ],
  'super-admin': [
    'admin:access',
    'jobs:manage',
    'jobs:archive',
    'applications:review',
    'candidates:view',
    'blogs:create',
    'team:manage',
  ],
}

export const hasStaffPermission = (
  role: UserRole | undefined,
  permission: StaffPermission,
) => Boolean(role && permissionsByRole[role]?.includes(permission))

export const permissionForAdminPath = (pathname: string): StaffPermission => {
  if (pathname === '/admin-center/team' || pathname.startsWith('/admin-center/team/')) {
    return 'team:manage'
  }
  if (
    pathname === '/admin-center/applications'
    || pathname.startsWith('/admin-center/applications/')
  ) {
    return 'applications:review'
  }
  if (
    pathname === '/admin-center/candidates'
    || pathname.startsWith('/admin-center/candidates/')
  ) {
    return 'candidates:view'
  }
  return 'admin:access'
}
