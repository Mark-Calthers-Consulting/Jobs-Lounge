import { describe, expect, it } from 'vitest'

import { dateInputValueInTimeZone, formatDateInTimeZone } from './dateTime'

describe('organization time-zone presentation', () => {
    it('formats the same timestamp on the organization calendar day', () => {
        const timestamp = '2026-07-29T23:30:00.000Z'
        expect(formatDateInTimeZone(timestamp, 'Africa/Lagos')).toContain('30 Jul 2026')
        expect(formatDateInTimeZone(timestamp, 'America/New_York')).toContain('29 Jul 2026')
    })

    it('produces the correct date input value without changing date-only fields', () => {
        expect(dateInputValueInTimeZone('2026-07-29', 'America/New_York')).toBe('2026-07-29')
        expect(dateInputValueInTimeZone(
            '2026-07-29T23:30:00.000Z',
            'Africa/Lagos',
        )).toBe('2026-07-30')
    })

    it('uses the safe Lagos fallback when a time zone is invalid', () => {
        expect(formatDateInTimeZone(
            '2026-07-29T23:30:00.000Z',
            'Not/AZone',
        )).toContain('30 Jul 2026')
    })
})
