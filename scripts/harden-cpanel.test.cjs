const assert = require('node:assert/strict')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const test = require('node:test')
const { hardenDirectory, secureConfiguration } = require('./harden-cpanel.cjs')

const cpanel = '# cPanel configuration\nPassengerEnabled on\nPassengerAppRoot /home/account/jobslounge\n'

test('preserves hosting directives and puts access restrictions before existing rewrites', () => {
  const existing = `${cpanel}RewriteRule ^ old-handler [L]\n`
  const updated = secureConfiguration(existing)
  assert.ok(updated.endsWith(existing))
  assert.ok(updated.indexOf('[F,END,NC]') < updated.indexOf('old-handler'))
  assert.equal(secureConfiguration(updated), updated)
})

test('upgrades only its own managed block and refuses damaged or duplicate markers', () => {
  const old = `${cpanel}# BEGIN JOBS LOUNGE SECURITY\nold rules\n# END JOBS LOUNGE SECURITY\n`
  const updated = secureConfiguration(old)
  assert.ok(updated.endsWith(cpanel))
  assert.ok(!updated.includes('old rules'))
  assert.equal(secureConfiguration(updated), updated)
  for (const damaged of [
    '# BEGIN JOBS LOUNGE SECURITY\n',
    '# END JOBS LOUNGE SECURITY\n# BEGIN JOBS LOUNGE SECURITY',
    updated + updated,
  ]) assert.throws(() => secureConfiguration(damaged))
})

test('installs atomically with a one-time original backup and preserves permissions', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jobslounge-hardening-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  fs.writeFileSync(path.join(root, 'package.json'), '{}')
  fs.writeFileSync(path.join(root, 'app.js'), '')
  const target = path.join(root, '.htaccess')
  fs.writeFileSync(target, cpanel, { mode: 0o640 })
  assert.equal(hardenDirectory(root).changed, true)
  assert.equal(fs.statSync(target).mode & 0o777, 0o640)
  assert.equal(fs.readFileSync(`${target}.jobslounge-before-security`, 'utf8'), cpanel)
  assert.equal(hardenDirectory(root).changed, false)
  assert.equal(fs.readFileSync(`${target}.jobslounge-before-security`, 'utf8'), cpanel)
})

test('protects applications without an existing .htaccess and rejects unsafe targets', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jobslounge-hardening-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  assert.throws(() => hardenDirectory('relative/path'))
  assert.throws(() => hardenDirectory(root))
  fs.writeFileSync(path.join(root, 'package.json'), '{}')
  fs.writeFileSync(path.join(root, 'server.js'), '')
  assert.equal(hardenDirectory(root).changed, true)
  const outside = path.join(root, 'original-config')
  fs.renameSync(path.join(root, '.htaccess'), outside)
  fs.symlinkSync(outside, path.join(root, '.htaccess'))
  assert.throws(() => hardenDirectory(root), /non-regular/)
})

test('protects a separately configured document root only when explicitly selected', (t) => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'jobslounge-document-root-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  assert.throws(() => hardenDirectory(root))
  assert.equal(hardenDirectory(root, { documentRoot: true }).changed, true)
  assert.equal(hardenDirectory(root, { documentRoot: true }).changed, false)
  assert.throws(() => hardenDirectory(path.parse(root).root, { documentRoot: true }))
  assert.throws(() => hardenDirectory(os.homedir(), { documentRoot: true }))
})
