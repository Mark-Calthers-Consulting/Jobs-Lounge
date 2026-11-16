import assert from 'node:assert/strict'

const frontend = new URL(process.argv[2] || 'https://jobslounge.markcalthers.com')
const api = new URL(process.argv[3] || 'https://jobsapi.markcalthers.com')

async function check(origin, pathname, statuses) {
  const url = new URL(pathname, origin)
  const response = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(15000) })
  assert.ok(statuses.includes(response.status), `${url}: unexpected HTTP ${response.status}`)
  assert.equal(response.headers.get('x-powered-by'), null, `${url}: X-Powered-By is still exposed`)
  console.log(`PASS ${response.status} ${url}`)
  return response
}

try {
  const home = await check(frontend, '/', [200])
  const html = await home.text()
  const chunk = html.match(/<script[^>]*\bsrc="(\/_next\/static\/[^"?#]+\.js(?:\?[^"#]*)?)"/)
  assert.ok(chunk, 'The homepage did not reference a Next.js JavaScript chunk')

  const checks = [
    check(frontend, chunk[1], [200]),
    check(frontend, '/logo.svg', [200]),
    check(frontend, '/vacancies', [200]),
    check(frontend, '/auth', [200]),
    check(frontend, '/api/backend/health/live', [200]),
    check(api, '/health/live', [200]),
    check(api, '/api/auth/csrf-token', [200]),
    ...['/package.json', '/package.json?download=1', '/app.js', '/server.js', '/server.js/extra',
      '/DEPLOYMENT.txt', '/node_modules/next/package.json', '/.next/server/app-paths-manifest.json',
      '/scripts/harden-cpanel.cjs', '/.env', '/.git/config', '/.htaccess.jobslounge-before-security',
    ].map((pathname) => check(frontend, pathname, [403, 404])),
    ...['/package.json', '/app.js', '/controllers/authController.js', '/.env', '/.git/config']
      .map((pathname) => check(api, pathname, [403, 404])),
  ]
  const results = await Promise.allSettled(checks)
  const failures = results.filter((result) => result.status === 'rejected')
  if (failures.length) throw new AggregateError(failures.map((result) => result.reason), 'Security verification failed')
  console.log('All public-file, header, page, asset, and API checks passed.')
} catch (error) {
  console.error(error.message)
  if (error instanceof AggregateError) {
    for (const failure of error.errors) console.error(failure.message)
  }
  process.exitCode = 1
}
