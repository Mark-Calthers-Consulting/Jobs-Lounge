import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url))
const projectDirectory = path.resolve(scriptDirectory, '..')
const nextDirectory = path.join(projectDirectory, '.next')
const standaloneDirectory = path.join(nextDirectory, 'standalone')
const staticDirectory = path.join(nextDirectory, 'static')
const publicDirectory = path.join(projectDirectory, 'public')
const deployDirectory = path.join(projectDirectory, 'cpanel-deploy')

function requireDirectory(directory, label) {
  if (!fs.existsSync(directory) || !fs.statSync(directory).isDirectory()) {
    throw new Error(`${label} was not found at ${directory}. Run npm run build first.`)
  }
}

function findStandaloneServer(directory, depth = 0) {
  if (depth > 4) return null

  const directServer = path.join(directory, 'server.js')
  if (fs.existsSync(directServer)) return directServer

  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name === '.next') continue
    const server = findStandaloneServer(path.join(directory, entry.name), depth + 1)
    if (server) return server
  }

  return null
}

function removeEnvironmentFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      removeEnvironmentFiles(entryPath)
      continue
    }

    if (entry.name === '.env' || entry.name.startsWith('.env.')) {
      fs.rmSync(entryPath, { force: true })
    }
  }
}

requireDirectory(standaloneDirectory, 'The standalone Next.js build')
requireDirectory(staticDirectory, 'The Next.js static asset directory')

fs.rmSync(deployDirectory, { recursive: true, force: true })
fs.mkdirSync(deployDirectory, { recursive: true })
fs.cpSync(standaloneDirectory, deployDirectory, { recursive: true })

const serverPath = findStandaloneServer(deployDirectory)
if (!serverPath) {
  throw new Error('The generated standalone server.js could not be located.')
}

const serverDirectory = path.dirname(serverPath)
const packagedNextDirectory = path.join(serverDirectory, '.next')

fs.mkdirSync(packagedNextDirectory, { recursive: true })
fs.cpSync(staticDirectory, path.join(packagedNextDirectory, 'static'), { recursive: true })

if (fs.existsSync(publicDirectory)) {
  fs.cpSync(publicDirectory, path.join(serverDirectory, 'public'), { recursive: true })
}

removeEnvironmentFiles(deployDirectory)

const relativeServerPath = `./${path.relative(deployDirectory, serverPath).split(path.sep).join('/')}`
const passengerEntry = `'use strict'\n\nprocess.env.NODE_ENV ||= 'production'\nprocess.env.HOSTNAME ||= '127.0.0.1'\n\nrequire(${JSON.stringify(relativeServerPath)})\n`

fs.writeFileSync(path.join(deployDirectory, 'app.js'), passengerEntry, 'utf8')
fs.writeFileSync(
  path.join(deployDirectory, 'DEPLOYMENT.txt'),
  [
    'Jobs Lounge frontend cPanel bundle',
    '',
    'Upload the CONTENTS of this directory to the cPanel frontend application path.',
    'Application mode: Production',
    'Startup file: app.js',
    '',
    'Configure API_ORIGIN and the public environment variables in cPanel.',
    'No .env files are included in this bundle.',
    '',
  ].join('\n'),
  'utf8',
)

console.log(`cPanel bundle created at ${deployDirectory}`)
console.log(`Passenger startup file will load ${relativeServerPath}`)
