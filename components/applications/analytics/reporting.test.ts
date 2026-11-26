import { describe, expect, it } from 'vitest'
import { chartPoints, changeLabel, lineCoordinates, reportFilename } from './reporting'
import { recruitmentReport } from '@/test/fixtures/recruitmentReport'

describe('report calculations and labels', () => {
  it('handles zero baselines, growth, decline and unchanged activity', () => {
    expect(changeLabel({ current: 4, previous: 0, change: 4, percentageChange: null })).toBe(
      'No previous activity',
    )
    expect(changeLabel({ current: 6, previous: 4, change: 2, percentageChange: 50 })).toBe(
      '+2 (+50%)',
    )
    expect(changeLabel({ current: 0, previous: 4, change: -4, percentageChange: -100 })).toBe(
      '−4 (-100%)',
    )
    expect(changeLabel({ current: 4, previous: 4, change: 0, percentageChange: 0 })).toBe(
      'No change (0%)',
    )
  })
  it('uses daily points for shorter ranges and calendar weeks for longer ones without losing counts', () => {
    for (const days of [1, 30, 62, 90, 366]) {
      const report = recruitmentReport({ days })
      const source = report.recruitment.applications
      const points = chartPoints(source.daily, source.previousDaily)
      expect(points.reduce((total, point) => total + point.current, 0)).toBe(source.current)
      expect(points.reduce((total, point) => total + point.previous, 0)).toBe(source.previous)
      expect(points.length).toBeLessThanOrEqual(days > 62 ? 54 : days)
    }
  })
  it('handles a one day range and empty counts without invalid SVG coordinates', () => {
    expect(lineCoordinates([0], 100, 40, 0)).toBe('50,40')
    expect(lineCoordinates([1, 2], 100, 40, 2)).toBe('0,20 100,0')
  })
  it('uses dates rather than candidate data in the report filename', () => {
    expect(reportFilename(recruitmentReport(), 'pdf')).toBe(
      'jobs-lounge-recruitment-2026-08-28-to-2026-09-26.pdf',
    )
  })
})
