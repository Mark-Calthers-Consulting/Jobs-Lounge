import { describe, expect, it } from 'vitest'

import {
    dateInputValueInTimeZone,
    dateTimeInputToUtc,
    dateTimeInputValueInTimeZone,
    formatDateInTimeZone,
} from './dateTime'

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

describe('organization-time-zone date and time inputs', () => {
    it('formats instants for a datetime-local control', () => {
        expect(dateTimeInputValueInTimeZone(
            new Date('2026-09-10T13:30:00.000Z'),
            'Africa/Lagos',
        )).toBe('2026-09-10T14:30')
    })

    it('converts organization wall time to an ISO UTC instant', () => {
        expect(dateTimeInputToUtc('2026-09-10T14:30', 'Africa/Lagos'))
            .toBe('2026-09-10T13:30:00.000Z')
        expect(dateTimeInputToUtc('2026-07-10T09:00', 'America/New_York'))
            .toBe('2026-07-10T13:00:00.000Z')
    })

    it('rejects malformed and nonexistent local times', () => {
        expect(dateTimeInputToUtc('not-a-date', 'Africa/Lagos')).toBeUndefined()
        expect(dateTimeInputToUtc('2026-02-31T12:00', 'Africa/Lagos')).toBeUndefined()
        expect(dateTimeInputToUtc('2026-03-08T02:30', 'America/New_York')).toBeUndefined()
    })
})
