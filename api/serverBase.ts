import 'server-only'

const normalizePath = (path: string) => path.startsWith('/') ? path : `/${path}`

const configuredApiOrigin = () => {
  const origin = process.env.API_ORIGIN?.replace(/\/+$/, '')

  if (!origin) {
    throw new Error('API_ORIGIN is required for server-side API requests')
  }

  return origin
}

export const serverApiUrl = (path: string) => (
  `${configuredApiOrigin()}/api${normalizePath(path)}`
)
