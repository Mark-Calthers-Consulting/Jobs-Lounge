const configuredApiOrigin = process.env.NEXT_PUBLIC_API_ORIGIN?.replace(/\/+$/, '')
const BROWSER_API_BASE = configuredApiOrigin
  ? `${configuredApiOrigin}/api`
  : '/api/backend'

const normalizePath = (path: string) => path.startsWith('/') ? path : `/${path}`

export const apiPath = (path: string) => `${BROWSER_API_BASE}${normalizePath(path)}`
