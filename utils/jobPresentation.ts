export const publicEmployerName = (name: string) => {
  const normalizedName = name.trim()

  if (!normalizedName || /^undisclosed (employer|company)$/i.test(normalizedName)) {
    return 'Confidential employer'
  }

  return normalizedName
}

type LocationAwareJob = {
  _id: string
  location: string
  locationOptions?: Array<{
    jobId: string
    location: string
  }>
}

export const publicJobLocations = (job: LocationAwareJob) => {
  const options = job.locationOptions?.length
    ? job.locationOptions
    : [{ jobId: job._id, location: job.location }]
  const seen = new Set<string>()

  return options
    .filter(({ location }) => {
      const key = location.trim().toLocaleLowerCase('en-NG')
      if (!key || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((left, right) => left.location.localeCompare(right.location, 'en-NG'))
}

export const publicJobLocationSummary = (
  job: LocationAwareJob,
  { compact = false }: { compact?: boolean } = {},
) => {
  const locations = publicJobLocations(job).map(({ location }) => location)
  if (locations.length <= 1) return locations[0] || job.location
  if (compact && locations.length > 2) {
    return `${locations.slice(0, 2).join(', ')} and ${locations.length - 2} more`
  }
  return new Intl.ListFormat('en-NG', {
    style: 'long',
    type: 'conjunction',
  }).format(locations)
}
