import { afterEach, expect, it, vi } from 'vitest'

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules() })

it('allows the bundled PDF WASM without enabling general JavaScript eval or external conversion hosts', async () => {
  vi.stubEnv('API_ORIGIN', 'https://api.example.test')
  vi.stubEnv('NEXT_PUBLIC_API_ORIGIN', '')
  vi.stubEnv('NODE_ENV', 'production')
  const { default: config } = await import('../next.config')
  const rules = await config.headers!()
  const policy = rules.flatMap((rule) => rule.headers).find((header) => header.key === 'Content-Security-Policy')!.value
  const script = policy.split(';').find((directive) => directive.trim().startsWith('script-src'))!
  const connections = policy.split(';').find((directive) => directive.trim().startsWith('connect-src'))!
  expect(script).toContain("'wasm-unsafe-eval'")
  expect(script.split(/\s+/)).not.toContain("'unsafe-eval'")
  expect(connections.split(/\s+/)).toContain('data:')
  expect(connections.split(/\s+/)).not.toContain('*')
  expect(policy).toContain("object-src 'none'")
  expect(policy).toContain("frame-ancestors 'none'")
})
