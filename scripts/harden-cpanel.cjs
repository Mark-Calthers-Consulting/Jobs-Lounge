'use strict'

// Keep this deployment utility identical to backend/scripts/harden-cpanel.cjs.
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const BEGIN = '# BEGIN JOBS LOUNGE SECURITY'
const END = '# END JOBS LOUNGE SECURITY'
const SECURITY_BLOCK = [
  BEGIN,
  '# Deny runtime files before Apache can serve them instead of Passenger.',
  'RewriteEngine On',
  'RewriteRule (^|/)\\.(?!well-known(?:/|$)) - [F,END,NC]',
  'RewriteRule ^(?:node_modules|logs|tmp|scripts|deploy|test|tests|controllers|middleware|models|routes|services|utils|config|constants|observability|uploads)(?:/|$) - [F,END,NC]',
  '# Public assets and Next.js browser chunks may contain JavaScript or JSON.',
  'RewriteRule ^(?!(?:_next/static|public|\\.well-known)/).+\\.(?:[cm]?js|jsx|tsx?|json|map|ya?ml|toml|ini|conf|sh|sql|log|bak|zip|gz|tgz|tar)(?:/|$) - [F,END,NC]',
  'RewriteRule ^(?:DEPLOYMENT\\.txt|README(?:\\.[^/]*)?|Dockerfile|Procfile|LICENSE(?:\\.[^/]*)?|yarn\\.lock|pnpm-lock\\.yaml)(?:/|$) - [F,END,NC]',
  '<IfModule mod_headers.c>',
  '  Header onsuccess unset X-Powered-By',
  '  Header always unset X-Powered-By',
  '</IfModule>',
  END,
].join('\n')

function secureConfiguration(existing) {
  const beginCount = existing.split(BEGIN).length - 1
  const endCount = existing.split(END).length - 1
  if (beginCount !== endCount || beginCount > 1) {
    throw new Error('Malformed Jobs Lounge security markers; refusing to replace hosting configuration')
  }

  let preserved = existing
  if (beginCount === 1) {
    const start = existing.indexOf(BEGIN)
    const end = existing.indexOf(END)
    if (end < start) throw new Error('Jobs Lounge security markers are out of order')
    preserved = existing.slice(0, start) + existing.slice(end + END.length).replace(/^\r?\n/, '')
  }

  return `${SECURITY_BLOCK}\n${preserved}`
}

function hardenDirectory(directory, { documentRoot = false } = {}) {
  if (!directory || !path.isAbsolute(directory)) throw new Error('Provide an absolute application directory')
  const root = fs.realpathSync(directory)
  if (root === path.parse(root).root || root === os.homedir()) {
    throw new Error('Refusing to modify a filesystem root or home directory')
  }
  if (!fs.statSync(root).isDirectory() || (!documentRoot && (
    !fs.existsSync(path.join(root, 'package.json'))
    || !['app.js', 'server.js'].some((file) => fs.existsSync(path.join(root, file)))
  ))) {
    throw new Error('The target must be an existing Node.js application with package.json and an entry point')
  }

  const target = path.join(root, '.htaccess')
  const stat = fs.existsSync(target) ? fs.lstatSync(target) : null
  if (stat && (!stat.isFile() || stat.isSymbolicLink())) throw new Error('Refusing to replace a non-regular .htaccess')
  const existing = stat ? fs.readFileSync(target, 'utf8') : ''
  const updated = secureConfiguration(existing)
  if (existing === updated) return { changed: false, target }

  const backup = `${target}.jobslounge-before-security`
  if (stat && !fs.existsSync(backup)) fs.copyFileSync(target, backup, fs.constants.COPYFILE_EXCL)
  const temporary = `${target}.jobslounge-next-${process.pid}`
  try {
    fs.writeFileSync(temporary, updated, { flag: 'wx', mode: stat ? stat.mode & 0o777 : 0o644 })
    fs.renameSync(temporary, target)
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary)
  }
  return { changed: true, target }
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2)
    const documentRoot = args[0] === '--document-root'
    if (args.length !== (documentRoot ? 2 : 1)) {
      throw new Error('Usage: node harden-cpanel.cjs [--document-root] /absolute/directory')
    }
    const { changed, target } = hardenDirectory(args[documentRoot ? 1 : 0], { documentRoot })
    console.log(`${changed ? 'Installed' : 'Already installed'} Jobs Lounge Apache security rules: ${target}`)
  } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}

module.exports = { hardenDirectory, secureConfiguration }
