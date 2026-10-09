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

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({
        data: {
            cvLink: 'https://drive.google.com/file/d/example/view',
            coverLetterLink: profileCoverLetterLink,
            role: 'user',
            profileCompleted: profileComplete,
            profileCompletion: { complete: profileComplete, percentage: profileComplete ? 100 : 75 },
        },
        isLoading: false,
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
        mutateAsync.mockReset().mockResolvedValue({})
        replace.mockReset()
        invalidateQueries.mockReset().mockResolvedValue(undefined)
    })

    it('appears only after an incomplete candidate tries to apply and does not block submission', async () => {
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        expect(screen.queryByText('One thing before you apply')).not.toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        expect(screen.getByRole('heading', { name: 'One thing before you apply' })).toBeInTheDocument()
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
        expect(screen.queryByText('One thing before you apply')).not.toBeInTheDocument()
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
})
