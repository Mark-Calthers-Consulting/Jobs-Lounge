import type { AnalyticsDaily } from '@/types/types'
import { calendarDate, chartPoints, count, lineCoordinates, shortDate } from './reporting'

export default function ActivityTrend({
  title,
  id,
  daily,
  previousDaily,
  current,
  previous,
  colour = '#173b75',
}: {
  title: string
  id: string
  daily: AnalyticsDaily
  previousDaily: AnalyticsDaily
  current: number
  previous: number
  colour?: string
}) {
  const points = chartPoints(daily, previousDaily)
  const highest = Math.max(1, ...points.flatMap((point) => [point.current, point.previous]))
  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="rounded-xl border border-slate-200 bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 id={`${id}-heading`} className="text-xl font-semibold text-slate-950 text-balance">
          {title}
        </h2>
        <div className="flex flex-wrap gap-4 text-xs text-slate-600" aria-hidden="true">
          <span>
            <span className="mr-2 inline-block h-2 w-4 rounded" style={{ background: colour }} />
            Selected period
          </span>
          <span>
            <span className="mr-2 inline-block h-2 w-4 rounded bg-slate-400" />
            Previous period
          </span>
        </div>
      </div>
      <p className="mt-2 text-sm text-slate-600">
        {count(current)} in the selected period, compared with {count(previous)} previously.
      </p>
      {current === 0 && previous === 0 ? (
        <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
          No activity in either period.
        </p>
      ) : (
        <svg
          viewBox="0 0 720 210"
          className="mt-4 w-full"
          role="img"
          aria-labelledby={`${id}-chart-title ${id}-chart-description`}
        >
          <title id={`${id}-chart-title`}>{title}: selected and previous periods</title>
          <desc id={`${id}-chart-description`}>
            {current} compared with {previous}. Previous period is aligned by elapsed day. Exact
            counts are available in the daily data table below.
          </desc>
          {[0, 0.5, 1].map((fraction) => (
            <g key={fraction}>
              <line
                x1="48"
                x2="704"
                y1={16 + 156 * fraction}
                y2={16 + 156 * fraction}
                stroke="#e2e8f0"
              />
              <text x="38" y={20 + 156 * fraction} textAnchor="end" fontSize="12" fill="#64748b">
                {count(Math.round(highest * (1 - fraction)))}
              </text>
            </g>
          ))}
          <g transform="translate(48 16)">
            <polyline
              points={lineCoordinates(
                points.map((point) => point.previous),
                656,
                156,
                highest,
              )}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="2"
              strokeDasharray="5 4"
            />
            <polyline
              points={lineCoordinates(
                points.map((point) => point.current),
                656,
                156,
                highest,
              )}
              fill="none"
              stroke={colour}
              strokeWidth="3"
            />
            {points.length === 1 && (
              <>
                <circle
                  cx="328"
                  cy={156 - (points[0].previous / highest) * 156}
                  r="5"
                  fill="white"
                  stroke="#94a3b8"
                  strokeWidth="2"
                />
                <circle
                  cx="328"
                  cy={156 - (points[0].current / highest) * 156}
                  r="4"
                  fill={colour}
                />
              </>
            )}
          </g>
          {points
            .filter(
              (_, index) =>
                index === 0 ||
                index === points.length - 1 ||
                index === Math.floor(points.length / 2),
            )
            .map((point) => (
              <text
                key={point.date}
                x={
                  points.length === 1
                    ? 376
                    : 48 + (points.indexOf(point) / (points.length - 1)) * 656
                }
                y="198"
                textAnchor={
                  points.length === 1
                    ? 'middle'
                    : point === points[0]
                      ? 'start'
                      : point === points.at(-1)
                        ? 'end'
                        : 'middle'
                }
                fontSize="12"
                fill="#64748b"
              >
                {shortDate(point.date)}
              </text>
            ))}
        </svg>
      )}
      <p className="mt-2 text-xs text-slate-500">
        {daily.length > 62
          ? 'Weekly chart totals follow calendar weeks; previous activity is aligned by day. Partial weeks are included.'
          : 'Daily counts; previous activity is aligned by day.'}
      </p>
      <details className="mt-4 rounded-lg border border-slate-200">
        <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-700">
          View daily {id === 'applications' ? 'application' : 'registration'} counts
        </summary>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">{title}: daily data</caption>
            <thead className="bg-slate-50">
              <tr>
                {['Date', 'Count', 'Previous date', 'Previous count'].map((label) => (
                  <th key={label} scope="col" className="whitespace-nowrap px-4 py-2">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {daily.map((row, index) => (
                <tr key={row.date}>
                  <th scope="row" className="whitespace-nowrap px-4 py-2 font-normal">
                    {calendarDate(row.date)}
                  </th>
                  <td className="px-4 py-2 tabular-nums">{count(row.count)}</td>
                  <td className="whitespace-nowrap px-4 py-2">
                    {previousDaily[index] ? calendarDate(previousDaily[index].date) : '—'}
                  </td>
                  <td className="px-4 py-2 tabular-nums">
                    {count(previousDaily[index]?.count || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  )
}
