import type {
  AnalyticsComparison,
  AnalyticsDaily,
  ApplicationAnalyticsSummary,
} from '@/types/types'

export const count = (value: number) => value.toLocaleString('en-NG')
export const calendarDate = (date: string) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
export const shortDate = (date: string) =>
  new Intl.DateTimeFormat('en-NG', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`))
export const changeLabel = ({ previous, change, percentageChange }: AnalyticsComparison) => {
  if (previous === 0) return 'No previous activity'
  if (change === 0) return 'No change (0%)'
  return `${change > 0 ? '+' : '−'}${count(Math.abs(change))} (${percentageChange! > 0 ? '+' : ''}${percentageChange}%)`
}
export const reportFilename = (report: ApplicationAnalyticsSummary, extension: 'pdf' | 'csv') =>
  `jobs-lounge-recruitment-${report.recruitment.period.fromDate}-to-${report.recruitment.period.throughDate}.${extension}`

export const chartPoints = (daily: AnalyticsDaily, previousDaily: AnalyticsDaily) => {
  if (daily.length <= 62)
    return daily.map((row, index) => ({
      date: row.date,
      current: row.count,
      previous: previousDaily[index]?.count || 0,
    }))
  const points = new Map<string, { date: string; current: number; previous: number }>()
  daily.forEach((row, index) => {
    const date = new Date(`${row.date}T12:00:00Z`)
    date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7))
    const week = date.toISOString().slice(0, 10)
    const point = points.get(week) || { date: row.date, current: 0, previous: 0 }
    point.current += row.count
    point.previous += previousDaily[index]?.count || 0
    points.set(week, point)
  })
  return [...points.values()]
}

export const lineCoordinates = (values: number[], width: number, height: number, highest: number) =>
  values
    .map(
      (value, index) =>
        `${values.length === 1 ? width / 2 : (index / (values.length - 1)) * width},${height - (value / Math.max(1, highest)) * height}`,
    )
    .join(' ')
