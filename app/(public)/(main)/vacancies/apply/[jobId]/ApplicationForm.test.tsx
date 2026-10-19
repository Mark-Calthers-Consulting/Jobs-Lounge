import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApplicationForm from './ApplicationForm'
import { ApiError } from '@/api/errors'

const mutateAsync = vi.fn()
const replace = vi.fn()
const invalidateQueries = vi.fn()
let profileComplete = false
let remaining = 5
let profileCoverLetterLink: string | undefined
let highestEducation = "Bachelor's degree"
let academicEnforcementEnabled = false
const refetchUser = vi.fn()

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({
        data: {
            cvLink: 'https://drive.google.com/file/d/example/view',
            coverLetterLink: profileCoverLetterLink,
            role: 'user',
            profileCompleted: profileComplete,
            profileCompletion: { complete: profileComplete, percentage: profileComplete ? 100 : 75 },
            highestEducation,
        },
        isLoading: false,
        isFetching: false,
        refetch: refetchUser,
    }),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({
        academicQualificationEnforcementEnabled: academicEnforcementEnabled,
    }),
}))

vi.mock('@/hooks/useVacancies', () => ({
    useCheckApplicationStatus: () => ({ data: false, isLoading: false }),
}))

vi.mock('@/hooks/useApplications', () => ({
    useApplyToJob: () => ({ mutateAsync, isPending: false }),
    useWeeklyApplicationLimit: () => ({
        data: {
            limit: 5,
            used: 5 - remaining,
            remaining,
            resetsAt: '2026-09-20T23:00:00.000Z',
            timeZone: 'Africa/Lagos',
        },
        isLoading: false,
        isError: false,
    }),
}))

vi.mock('@tanstack/react-query', () => ({
    useQueryClient: () => ({ invalidateQueries }),
}))

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace }),
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock('@/components/CvLinkGuidance', () => ({
    default: () => null,
}))

describe('ApplicationForm profile completion prompt', () => {
    beforeEach(() => {
        profileComplete = false
        remaining = 5
        profileCoverLetterLink = undefined
        highestEducation = "Bachelor's degree"
        academicEnforcementEnabled = false
        refetchUser.mockReset().mockResolvedValue({})
        mutateAsync.mockReset().mockResolvedValue({})
        replace.mockReset()
        invalidateQueries.mockReset().mockResolvedValue(undefined)
    })

    it('appears only after an incomplete candidate tries to apply and does not block submission', async () => {
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        expect(screen.queryByText('Review before you apply')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(screen.getByRole('heading', { name: 'Review before you apply' })).toBeInTheDocument()
        expect(screen.getByText(/Your profile is 75% complete/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Complete profile/ })).toHaveAttribute('href', '/dashboard/profile')
        expect(mutateAsync).not.toHaveBeenCalled()

        fireEvent.click(screen.getByRole('button', { name: 'Apply anyway' }))
        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
            jobId: 'job-1',
            cvLink: 'https://drive.google.com/file/d/example/view',
            coverLetterLink: '',
        }))
    })

    it('submits directly when the profile is complete', async () => {
        profileComplete = true
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
        expect(mutateAsync).toHaveBeenCalledWith({
            jobId: 'job-1',
            cvLink: 'https://drive.google.com/file/d/example/view',
            coverLetterLink: '',
        })
        expect(screen.queryByText('Review before you apply')).not.toBeInTheDocument()
    })

    it.each([
        { savedLink: 'https://example.com/letter.pdf', complete: true },
        { savedLink: 'not-a-valid-link', complete: true },
        { savedLink: 'https://example.com/letter.pdf', complete: false },
        { savedLink: 'not-a-valid-link', complete: false },
    ])('can remove a saved cover letter ($savedLink, complete profile: $complete)', async ({ savedLink, complete }) => {
        profileComplete = complete
        profileCoverLetterLink = savedLink
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        const input = screen.getByLabelText(/Cover letter link/)
        expect(input).not.toBeRequired()
        expect(input).toHaveValue(savedLink)
        fireEvent.change(input, { target: { value: '' } })
        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))
        if (!complete) fireEvent.click(screen.getByRole('button', { name: 'Apply anyway' }))

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
            jobId: 'job-1',
            cvLink: 'https://drive.google.com/file/d/example/view',
            coverLetterLink: '',
        }))
    })

    it('keeps an unchanged profile cover letter and trims a replacement', async () => {
        profileComplete = true
        profileCoverLetterLink = 'https://example.com/letter.pdf'
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))
        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({
            coverLetterLink: profileCoverLetterLink,
        })))

        fireEvent.change(screen.getByLabelText(/Cover letter link/), { target: { value: '  https://example.com/replacement.pdf  ' } })
        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))
        await waitFor(() => expect(mutateAsync).toHaveBeenLastCalledWith(expect.objectContaining({
            coverLetterLink: 'https://example.com/replacement.pdf',
        })))
    })

    it('prevents a sixth application and shows the reset date', () => {
        remaining = 0
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        expect(screen.getByRole('heading', { name: 'You have used your five applications this week' })).toBeInTheDocument()
        expect(screen.getByText(/Monday, 21 September 2026/)).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Submit application for Designer' })).not.toBeInTheDocument()
    })

    it('shows a server limit conflict inline when another tab uses the final slot', async () => {
        profileComplete = true
        mutateAsync.mockRejectedValue(new ApiError({
            status: 'error',
            code: 'WEEKLY_APPLICATION_LIMIT_REACHED',
            message: 'You have used all five applications for this week.',
        }, 429))
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(await screen.findByRole('alert')).toHaveTextContent('You have used all five applications for this week.')
        expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['weeklyApplicationLimit'] })
    })

    it('warns a below-minimum candidate only after submit and allows an advisory application', async () => {
        profileComplete = true
        highestEducation = 'Higher National Diploma (HND)'
        render(
            <ApplicationForm
                jobId="job-1"
                jobTitle="Designer"
                minimumAcademicQualification="Bachelor's degree"
            />,
        )

        expect(screen.queryByText(/one level below/)).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(screen.getByText(/one level below the requirement/)).toBeInTheDocument()
        expect(mutateAsync).not.toHaveBeenCalled()
        fireEvent.click(screen.getByRole('button', { name: 'Apply anyway' }))
        await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
    })

    it('blocks a below-minimum candidate when enforcement is enabled', () => {
        profileComplete = true
        highestEducation = 'National Diploma (ND)'
        academicEnforcementEnabled = true
        render(
            <ApplicationForm
                jobId="job-1"
                jobTitle="Designer"
                minimumAcademicQualification="Bachelor's degree"
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(screen.getByText(/two or more levels below the requirement/)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: /Update profile/ })).toHaveAttribute('href', '/dashboard/profile')
        expect(screen.getByRole('button', { name: 'Recheck qualification' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Apply anyway' })).not.toBeInTheDocument()
        expect(mutateAsync).not.toHaveBeenCalled()
    })

    it('uses the server assessment when the browser profile is stale', async () => {
        profileComplete = true
        highestEducation = "Master's degree"
        mutateAsync.mockRejectedValue(new ApiError({
            status: 'error',
            code: 'ACADEMIC_QUALIFICATION_BELOW_MINIMUM',
            message: 'Your saved academic qualification is below this vacancy’s minimum.',
            details: {
                academicAssessment: {
                    result: 'two-or-more-levels-below',
                    candidateQualification: 'National Diploma (ND)',
                    minimumQualification: "Bachelor's degree",
                    levelDifference: -3,
                },
            },
        }, 409))
        render(
            <ApplicationForm
                jobId="job-1"
                jobTitle="Designer"
                minimumAcademicQualification="Bachelor's degree"
            />,
        )

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(await screen.findByText(/Your profile lists National Diploma \(ND\)/)).toBeInTheDocument()
        expect(screen.getByText(/two or more levels below the requirement/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Recheck qualification' })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Apply anyway' })).not.toBeInTheDocument()
    })
})
