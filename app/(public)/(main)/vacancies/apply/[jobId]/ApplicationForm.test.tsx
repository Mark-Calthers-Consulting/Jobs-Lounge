import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApplicationForm from './ApplicationForm'
import { ApiError } from '@/api/errors'

const mutateAsync = vi.fn()
const replace = vi.fn()
const invalidateQueries = vi.fn()
let profileComplete = false
let remaining = 5

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({
        data: {
            cvLink: 'https://drive.google.com/file/d/example/view',
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
        }))
    })

    it('submits directly when the profile is complete', async () => {
        profileComplete = true
        render(<ApplicationForm jobId="job-1" jobTitle="Designer" />)

        fireEvent.click(screen.getByRole('button', { name: 'Submit application for Designer' }))

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledOnce())
        expect(screen.queryByText('One thing before you apply')).not.toBeInTheDocument()
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
