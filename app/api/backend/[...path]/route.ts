import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HOP_BY_HOP_HEADERS = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
])

type GatewayContext = {
  params: Promise<{ path: string[] }>
}

const getApiOrigin = () => {
  const configuredOrigin = process.env.API_ORIGIN?.trim().replace(/\/+$/, '')

  if (!configuredOrigin) {
    throw new Error('API_ORIGIN is not configured')
  }

  const origin = new URL(configuredOrigin)
  if (origin.protocol !== 'http:' && origin.protocol !== 'https:') {
    throw new Error('API_ORIGIN must use HTTP or HTTPS')
  }

  return origin.origin
}

const buildUpstreamUrl = (request: NextRequest, pathSegments: string[]) => {
  const encodedPath = pathSegments.map(encodeURIComponent).join('/')
  const isHealthEndpoint = encodedPath === 'health/live' || encodedPath === 'health/ready'
  const apiPath = isHealthEndpoint ? encodedPath : `api/${encodedPath}`
  return `${getApiOrigin()}/${apiPath}${request.nextUrl.search}`
}

const buildRequestHeaders = (request: NextRequest) => {
  const headers = new Headers()

  request.headers.forEach((value, name) => {
    const normalizedName = name.toLowerCase()
    if (
      HOP_BY_HOP_HEADERS.has(normalizedName)
      || normalizedName === 'host'
      || normalizedName === 'content-length'
    ) return

    headers.set(name, value)
  })

  headers.set('accept-encoding', 'identity')
  return headers
}

const buildResponseHeaders = (upstreamResponse: Response) => {
  const headers = new Headers()

  upstreamResponse.headers.forEach((value, name) => {
    const normalizedName = name.toLowerCase()
    if (HOP_BY_HOP_HEADERS.has(normalizedName) || normalizedName === 'set-cookie') return
    headers.set(name, value)
  })

  const headersWithCookies = upstreamResponse.headers as Headers & {
    getSetCookie?: () => string[]
  }
  const cookies = headersWithCookies.getSetCookie?.()

  if (cookies?.length) {
    cookies.forEach(cookie => headers.append('set-cookie', cookie))
  } else {
    const cookie = upstreamResponse.headers.get('set-cookie')
    if (cookie) headers.append('set-cookie', cookie)
  }

  headers.set('cache-control', 'no-store, max-age=0')
  return headers
}

const proxyRequest = async (request: NextRequest, context: GatewayContext) => {
  try {
    const { path } = await context.params
    const method = request.method.toUpperCase()
    const hasBody = method !== 'GET' && method !== 'HEAD'
    const upstreamResponse = await fetch(buildUpstreamUrl(request, path), {
      method,
      headers: buildRequestHeaders(request),
      body: hasBody ? await request.arrayBuffer() : undefined,
      cache: 'no-store',
      redirect: 'manual',
      signal: request.signal,
    })

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: buildResponseHeaders(upstreamResponse),
    })
  } catch (error) {
    console.error('backend_gateway_failed', {
      errorName: error instanceof Error ? error.name : 'UnknownError',
    })

    return Response.json(
      {
        status: 'error',
        code: 'BACKEND_GATEWAY_UNAVAILABLE',
        message: 'The service is temporarily unavailable. Please try again.',
      },
      {
        status: 502,
        headers: { 'cache-control': 'no-store, max-age=0' },
      },
    )
  }
}

export const GET = proxyRequest
export const HEAD = proxyRequest
export const POST = proxyRequest
export const PUT = proxyRequest
export const PATCH = proxyRequest
export const DELETE = proxyRequest
export const OPTIONS = proxyRequest
