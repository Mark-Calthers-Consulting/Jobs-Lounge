import type { User } from '@/types/types'

export type ProtectedArea = 'candidate' | 'admin'

export const landingPageForRole = (role?: User['role']) => {
  if (role === 'admin' || role === 'recruiter' || role === 'super-admin') return '/admin-center'
  return '/dashboard'
}

export const loginPageForArea = (area: ProtectedArea) => (
  area === 'admin' ? '/admin-center/login' : '/auth'
)

export const roleCanAccessArea = (role: User['role'] | undefined, area: ProtectedArea) => (
  area === 'admin'
    ? role === 'admin' || role === 'recruiter' || role === 'super-admin'
    : role === 'user'
)

export const safeNextPath = (
  value: string | string[] | undefined,
  area: ProtectedArea,
) => {
  const path = Array.isArray(value) ? value[0] : value
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return undefined
  }

  const allowedPrefix = area === 'admin' ? '/admin-center' : '/dashboard'
  if (path !== allowedPrefix && !path.startsWith(`${allowedPrefix}/`)) return undefined
  if (area === 'admin' && path === '/admin-center/login') return undefined

  return path
}
