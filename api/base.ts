const BROWSER_API_BASE = '/api/backend'

const normalizePath = (path: string) => path.startsWith('/') ? path : `/${path}`

export const apiPath = (path: string) => `${BROWSER_API_BASE}${normalizePath(path)}`
