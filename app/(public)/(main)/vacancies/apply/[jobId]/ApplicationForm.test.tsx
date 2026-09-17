import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ApplicationForm from './ApplicationForm'

const mutateAsync = vi.fn()
const replace = vi.fn()
const invalidateQueries = vi.fn()
let profileComplete = false

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({
        data: {
            cvLink: 'https://drive.google.com/file/d/example/view',
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
})
