import { describe, expect, it } from 'vitest'

import {
  publicEmployerName,
  publicJobLocations,
  publicJobLocationSummary,
} from './jobPresentation'

describe('publicEmployerName', () => {
  it('uses polished public copy for undisclosed employers', () => {
    expect(publicEmployerName('Undisclosed employer')).toBe('Confidential employer')
    expect(publicEmployerName(' undisclosed company ')).toBe('Confidential employer')
    expect(publicEmployerName('')).toBe('Confidential employer')
  })

  it('preserves disclosed employer names', () => {
    expect(publicEmployerName(' Mark Calthers Consulting ')).toBe('Mark Calthers Consulting')
  })
})

describe('public vacancy locations', () => {
  const groupedJob = {
    _id: 'job-abuja',
    location: 'Abuja',
    locationOptions: [
      { jobId: 'job-ilorin', location: 'Ilorin' },
      { jobId: 'job-abuja', location: 'Abuja' },
      { jobId: 'job-lagos', location: 'Lagos' },
      { jobId: 'job-duplicate', location: ' abuja ' },
    ],
  }

  it('sorts and safely de-duplicates explicit location variants', () => {
    expect(publicJobLocations(groupedJob)).toEqual([
      { jobId: 'job-abuja', location: 'Abuja' },
      { jobId: 'job-ilorin', location: 'Ilorin' },
      { jobId: 'job-lagos', location: 'Lagos' },
    ])
  })

  it('formats full and compact public summaries', () => {
    expect(publicJobLocationSummary(groupedJob)).toBe('Abuja, Ilorin and Lagos')
    expect(publicJobLocationSummary(groupedJob, { compact: true })).toBe('Abuja, Ilorin and 1 more')
  })

  it('falls back to the vacancy location for standalone and legacy jobs', () => {
    expect(publicJobLocationSummary({ _id: 'job-one', location: 'Nationwide' })).toBe('Nationwide')
  })
})
