import type { AcquisitionSource } from '@/types/types'

export const ACQUISITION_OPTIONS: ReadonlyArray<{
    value: AcquisitionSource
    label: string
    acceptsDetail?: boolean
    detailLabel?: string
    detailPlaceholder?: string
}> = [
    { value: 'search', label: 'Search engine' },
    { value: 'linkedin', label: 'LinkedIn' },
    {
        value: 'other-social-media',
        label: 'Other social media',
        acceptsDetail: true,
        detailLabel: 'Which platform? (optional)',
        detailPlaceholder: 'For example, Instagram',
    },
    {
        value: 'referral',
        label: 'Friend or colleague',
        acceptsDetail: true,
        detailLabel: 'Who referred you? (optional)',
        detailPlaceholder: 'Name or relationship',
    },
    {
        value: 'school-community',
        label: 'School or community',
        acceptsDetail: true,
        detailLabel: 'Which school or community? (optional)',
        detailPlaceholder: 'School or community name',
    },
    {
        value: 'event',
        label: 'Event',
        acceptsDetail: true,
        detailLabel: 'Which event? (optional)',
        detailPlaceholder: 'Event name',
    },
    {
        value: 'employer',
        label: 'Employer',
        acceptsDetail: true,
        detailLabel: 'Which employer? (optional)',
        detailPlaceholder: 'Employer name',
    },
    {
        value: 'mark-calthers-network',
        label: 'Mark Calthers network',
        acceptsDetail: true,
        detailLabel: 'Where in the network? (optional)',
        detailPlaceholder: 'For example, Mark Calthers Connect',
    },
    {
        value: 'other',
        label: 'Other',
        acceptsDetail: true,
        detailLabel: 'Tell us where you heard about us',
        detailPlaceholder: 'Enter a short answer',
    },
    { value: 'prefer-not-to-say', label: 'Prefer not to say' },
]

export const acquisitionOption = (source?: AcquisitionSource) => (
    ACQUISITION_OPTIONS.find(({ value }) => value === source)
)
