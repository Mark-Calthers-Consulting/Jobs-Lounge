import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image as PdfImage,
  Svg,
  G,
  Line,
  Polyline,
  Rect,
  Circle,
  Font,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer'
import type {
  AnalyticsComparison,
  AnalyticsDaily,
  ApplicationAnalyticsSummary,
} from '@/types/types'
import {
  calendarDate,
  changeLabel,
  chartPoints,
  count,
  lineCoordinates,
  reportFilename,
  shortDate,
} from './reporting'
import { saveDownloadedFile } from '@/api/applicationWorkspace'

const navy = '#10264b'
const muted = '#617086'
const red = '#c6283d'
const stages = [
  ['pending', 'New', navy],
  ['reviewed', 'In review', '#bd7b16'],
  ['shortlisted', 'Shortlisted', '#237c69'],
  ['rejected', 'Rejected', red],
] as const
const s = StyleSheet.create({
  page: {
    width: 595.28,
    height: 841.89,
    padding: 36,
    paddingBottom: 48,
    fontFamily: 'GeistReport',
    fontSize: 9,
    color: navy,
    backgroundColor: '#ffffff',
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { fontSize: 9, color: muted, letterSpacing: 1 },
  title: { fontSize: 24, fontWeight: 600, marginTop: 12, marginBottom: 4 },
  subtitle: { fontSize: 9, color: muted, lineHeight: 1.5 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 12, fontWeight: 600, marginBottom: 4 },
  footnote: { fontSize: 9, color: muted, lineHeight: 1.5 },
  metric: { width: '32%', borderRadius: 8, padding: 12, backgroundColor: '#f2f5fa' },
  metricLabel: { fontSize: 9, color: muted },
  metricValue: { fontSize: 24, fontWeight: 600, marginTop: 4, marginBottom: 4 },
  metricChange: { fontSize: 9, fontWeight: 600 },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    color: muted,
    fontSize: 9,
  },
  box: { borderRadius: 8, padding: 12, border: '1px solid #dce3ec' },
})

export const registerReportFonts = (root: string) => {
  Font.register({
    family: 'GeistReport',
    fonts: [
      { src: `${root}/fonts/geist/Geist-Regular.ttf`, fontWeight: 400 },
      { src: `${root}/fonts/geist/Geist-SemiBold.ttf`, fontWeight: 600 },
    ],
  })
  Font.registerHyphenationCallback((word) => [word])
}

const truncate = (text: string, length: number) =>
  text.length > length ? `${text.slice(0, length - 1)}…` : text
const Footer = ({ page, report }: { page: number; report: ApplicationAnalyticsSummary }) => (
  <View fixed style={s.footer}>
    <Text>Jobs Lounge · Recruitment report · {report.timeZone}</Text>
    <Text>{page} / 2</Text>
  </View>
)
const Stat = ({ label, value }: { label: string; value: AnalyticsComparison }) => (
  <View style={s.metric}>
    <Text style={s.metricLabel}>{label}</Text>
    <Text style={s.metricValue}>{count(value.current)}</Text>
    <Text style={s.metricChange}>{changeLabel(value)}</Text>
    <Text style={{ ...s.footnote, marginTop: 4 }}>
      Previous: {count(value.previous)}
      {value.previous === 0 ? ` · Δ +${count(value.change)}` : ''}
    </Text>
  </View>
)

function Trend({
  daily,
  previousDaily,
  colour = navy,
}: {
  daily: AnalyticsDaily
  previousDaily: AnalyticsDaily
  colour?: string
}) {
  const points = chartPoints(daily, previousDaily)
  const max = Math.max(1, ...points.flatMap((point) => [point.current, point.previous]))
  const width = 475,
    height = 88
  return (
    <View style={{ marginTop: 8 }}>
      <Svg width="523" height="116" viewBox="0 0 523 116">
        {[0, 0.5, 1].map((fraction) => (
          <Line
            key={fraction}
            x1="36"
            x2="511"
            y1={8 + fraction * height}
            y2={8 + fraction * height}
            stroke="#e2e8f0"
            strokeWidth="0.7"
          />
        ))}
        <G transform="translate(36 8)">
          <Polyline
            points={lineCoordinates(
              points.map((point) => point.previous),
              width,
              height,
              max,
            )}
            fill="none"
            stroke="#99a5b5"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
          <Polyline
            points={lineCoordinates(
              points.map((point) => point.current),
              width,
              height,
              max,
            )}
            fill="none"
            stroke={colour}
            strokeWidth="2"
          />
          {points.length === 1 && (
            <>
              <Circle
                cx={width / 2}
                cy={height - (points[0].previous / max) * height}
                r="3"
                fill="#ffffff"
                stroke="#99a5b5"
                strokeWidth="1"
              />
              <Circle
                cx={width / 2}
                cy={height - (points[0].current / max) * height}
                r="2"
                fill={colour}
              />
            </>
          )}
        </G>
      </Svg>
      <View style={{ ...s.row, marginTop: -12 }}>
        <Text style={s.footnote}>{shortDate(daily[0].date)}</Text>
        <Text style={s.footnote}>
          Peak {count(max)} · {daily.length > 62 ? 'Weekly totals' : 'Daily counts'}
        </Text>
        <Text style={s.footnote}>{shortDate(daily.at(-1)!.date)}</Text>
      </View>
      <View style={{ ...s.row, justifyContent: 'flex-start', gap: 12, marginTop: 4 }}>
        <Text style={{ fontSize: 9, color: colour }}>━━ Selected period</Text>
        <Text style={{ fontSize: 9, color: muted }}>┄┄ Previous period, aligned by day</Text>
      </View>
    </View>
  )
}

export function RecruitmentReportDocument({
  report,
  assetRoot,
}: {
  report: ApplicationAnalyticsSummary
  assetRoot: string
}) {
  const r = report.recruitment
  const leaders = r.topVacancies.slice(0, 10)
  const largest = Math.max(1, ...leaders.map((row) => row.applications))
  const generated = new Intl.DateTimeFormat('en-NG', {
    timeZone: report.timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(report.generatedAt))
  return (
    <Document
      title="Jobs Lounge recruitment report"
      author="Jobs Lounge"
      subject={`${r.period.fromDate} to ${r.period.throughDate}`}
      language="en-NG"
    >
      <Page size="A4" style={s.page}>
        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>RECRUITMENT INTELLIGENCE</Text>
            <Text style={s.title}>Applications, in perspective.</Text>
          </View>
          <PdfImage src={`${assetRoot}/report-logo.png`} style={{ width: 59, height: 40 }} />
        </View>
        <Text style={s.subtitle}>
          {calendarDate(r.period.fromDate)} to {calendarDate(r.period.throughDate)} ·{' '}
          {r.period.dayCount} calendar days
        </Text>
        <Text style={s.subtitle}>
          Compared with {calendarDate(r.period.previousFromDate)} to{' '}
          {calendarDate(r.period.previousThroughDate)}
        </Text>
        {r.period.incomplete && (
          <Text style={{ ...s.subtitle, color: '#986116' }}>
            Includes today; selected period is incomplete. Previous days are complete.
          </Text>
        )}
        <View style={{ ...s.row, alignItems: 'stretch', marginTop: 18 }}>
          <Stat label="Applications received" value={r.applications.comparison} />
          <Stat label="Distinct applicants" value={r.applications.applicantComparison} />
          <Stat label="New registrations" value={r.registrations} />
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Application activity</Text>
          <Text style={s.footnote}>
            Applications received, compared with the preceding equally sized period.
          </Text>
          <Trend daily={r.applications.daily} previousDaily={r.applications.previousDaily} />
        </View>
        <View style={s.section}>
          <View style={s.row}>
            <Text style={s.sectionTitle}>Where applications are going</Text>
            <Text style={s.footnote}>Top {leaders.length || 10} vacancies</Text>
          </View>
          {leaders.length ? (
            leaders.map((vacancy, index) => (
              <View key={vacancy.jobId} style={{ marginTop: 8 }}>
                <View style={s.row}>
                  <Text style={{ fontSize: 9, width: 455 }}>
                    {index + 1}.{' '}
                    {truncate(
                      `${vacancy.title}${vacancy.company ? ` · ${vacancy.company}` : ''}`,
                      95,
                    )}
                  </Text>
                  <Text style={{ fontSize: 9, fontWeight: 600 }}>
                    {count(vacancy.applications)}
                  </Text>
                </View>
                <Svg width="523" height="5" style={{ marginTop: 3 }}>
                  <Rect x="0" y="0" width="523" height="4" rx="2" fill="#edf1f7" />
                  <Rect
                    x="0"
                    y="0"
                    width={(vacancy.applications / largest) * 523}
                    height="4"
                    rx="2"
                    fill={navy}
                  />
                </Svg>
              </View>
            ))
          ) : (
            <View style={{ ...s.box, marginTop: 12 }}>
              <Text>No vacancies received applications in the selected period.</Text>
            </View>
          )}
          <Text style={{ ...s.footnote, marginTop: 8 }}>
            Ranked by application count, not views. The CSV includes the complete vacancy breakdown.
          </Text>
        </View>
        <Footer page={1} report={report} />
      </Page>
      <Page size="A4" style={s.page}>
        <View style={s.row}>
          <View>
            <Text style={s.eyebrow}>CANDIDATES &amp; REVIEW WORKLOAD</Text>
            <Text style={s.title}>Candidates and review.</Text>
          </View>
          <PdfImage src={`${assetRoot}/report-logo.png`} style={{ width: 59, height: 40 }} />
        </View>
        <Text style={s.subtitle}>
          {calendarDate(r.period.fromDate)} to {calendarDate(r.period.throughDate)}
        </Text>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Candidate registrations</Text>
          <Text style={s.footnote}>
            {count(r.registrations.current)} registrations · {changeLabel(r.registrations)} ·{' '}
            {count(r.registrations.previous)} previously
          </Text>
          <Trend
            daily={r.registrations.daily}
            previousDaily={r.registrations.previousDaily}
            colour={red}
          />
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Current review stages</Text>
          <Text style={s.footnote}>
            Current state of applications received in the selected period, not a historical funnel.
          </Text>
          <View style={{ ...s.row, marginTop: 12, alignItems: 'flex-start' }}>
            {stages.map(([key, label, colour]) => (
              <View key={key} style={{ width: '24%' }}>
                <Text style={{ fontSize: 9, color: colour }}>{label}</Text>
                <Text style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>
                  {count(r.applications.currentStages[key])}
                </Text>
              </View>
            ))}
          </View>
          <Svg width="523" height="12" style={{ marginTop: 12 }}>
            {stages.map(([key, , colour], index) => (
              <Rect
                key={key}
                x={
                  (stages
                    .slice(0, index)
                    .reduce((total, [stage]) => total + r.applications.currentStages[stage], 0) /
                    Math.max(1, r.applications.current)) *
                  523
                }
                y="0"
                width={
                  (r.applications.currentStages[key] / Math.max(1, r.applications.current)) * 523
                }
                height="10"
                fill={colour}
              />
            ))}
          </Svg>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Candidate snapshot · current accounts</Text>
          <View style={{ ...s.row, alignItems: 'stretch', marginTop: 8 }}>
            {[
              ['Registered candidates', r.candidates.registered],
              ['Profiles complete now', r.candidates.profilesComplete],
              ['Have applied at least once', r.candidates.everApplied],
            ].map(([label, value]) => (
              <View key={label} style={s.metric}>
                <Text style={s.metricLabel}>{label}</Text>
                <Text style={{ ...s.metricValue, fontSize: 18 }}>{count(value as number)}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Current workload · all applications</Text>
          <View style={{ ...s.row, gap: 12, alignItems: 'stretch', marginTop: 8 }}>
            <View style={{ ...s.box, width: '49%' }}>
              <Text style={s.metricLabel}>Awaiting first review over seven days</Text>
              <Text style={{ ...s.metricValue, fontSize: 18 }}>
                {count(r.workload.pendingOlderThanSevenDays)}
              </Text>
            </View>
            <View style={{ ...s.box, width: '49%' }}>
              <Text style={s.metricLabel}>Open vacancies with no lifetime applications</Text>
              <Text style={{ ...s.metricValue, fontSize: 18 }}>
                {count(r.workload.openVacanciesWithoutApplications)}
              </Text>
            </View>
          </View>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>Reading this report</Text>
          <Text style={s.footnote}>
            Distinct applicants counts each candidate once per period. Registrations count accounts
            created in the period that still exist. Deleted accounts and historical profile states
            cannot be reconstructed.
          </Text>
          <Text style={{ ...s.footnote, marginTop: 4 }}>
            Snapshots and workload reflect current records, not the selected historical period. No
            hiring outcomes are inferred. Longer trends show calendar week totals; previous activity
            is aligned by elapsed day.
          </Text>
          <Text style={{ ...s.footnote, marginTop: 8 }}>
            Generated {generated} · {report.timeZone}
          </Text>
        </View>
        <Footer page={2} report={report} />
      </Page>
    </Document>
  )
}

export async function downloadRecruitmentPdf(report: ApplicationAnalyticsSummary) {
  const assetRoot = window.location.origin
  registerReportFonts(assetRoot)
  const blob = await pdf(
    <RecruitmentReportDocument report={report} assetRoot={assetRoot} />,
  ).toBlob()
  saveDownloadedFile({ blob, filename: reportFilename(report, 'pdf') })
}
