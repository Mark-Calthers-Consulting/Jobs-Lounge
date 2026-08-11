import { describe, expect, it } from 'vitest'

import {
    CUSTOM_JOB_LOCATION_OPTION,
    NIGERIAN_STATE_OPTIONS,
} from '@/constants/nigeria'
import { buildJobLocation, locationToFormValue } from './jobLocation'

describe('job location form helpers', () => {
    it('provides all 36 states and the Federal Capital Territory once', () => {
        expect(NIGERIAN_STATE_OPTIONS).toHaveLength(37)
        expect(new Set(NIGERIAN_STATE_OPTIONS.map(({ value }) => value)).size).toBe(37)
        expect(NIGERIAN_STATE_OPTIONS).toContainEqual({
            value: 'Abuja',
            label: 'Abuja (Federal Capital Territory)',
        })
    })

    it('submits either the selected state or the custom location, never both', () => {
        expect(buildJobLocation('Lagos', 'ignored custom value')).toBe('Lagos')
        expect(buildJobLocation(CUSTOM_JOB_LOCATION_OPTION, 'Gbagada, Lagos')).toBe('Gbagada, Lagos')
        expect(buildJobLocation(CUSTOM_JOB_LOCATION_OPTION, '  Multiple   locations  ')).toBe('Multiple locations')
    })

    it('restores exact state locations into the dropdown', () => {
        expect(locationToFormValue('Lagos')).toEqual({ option: 'Lagos', custom: '' })
        expect(locationToFormValue('Lagos, Nigeria')).toEqual({ option: 'Lagos', custom: '' })
        expect(locationToFormValue('FCT')).toEqual({ option: 'Abuja', custom: '' })
    })

    it('restores specific and non-state locations into the manual option', () => {
        expect(locationToFormValue('Gbagada, Lagos')).toEqual({
            option: CUSTOM_JOB_LOCATION_OPTION,
            custom: 'Gbagada, Lagos',
        })
        expect(locationToFormValue('Nationwide')).toEqual({
            option: CUSTOM_JOB_LOCATION_OPTION,
            custom: 'Nationwide',
        })
    })
})
