import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamPageTable from './TeamPageTable'

const suspensionMutation = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAdmin', () => ({
    useCancelStaffInvitation: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useCreateStaffMember: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useGetTeamMembers: () => ({
        data: {
            status: 'success',
            count: 1,
            data: [{
                _id: 'member-1',
                name: 'Ada Recruiter',
                email: 'ada@example.com',
                telephone: '+2348012345678',
                role: 'recruiter',
                setupStatus: 'active',
                suspendedAt: null,
                lastLoginAt: '2026-09-05T09:00:00.000Z',
                lastActiveAt: '2026-09-06T09:00:00.000Z',
                createdAt: '2026-08-01T09:00:00.000Z',
                updatedAt: '2026-09-05T09:00:00.000Z',
            }],
            pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPreviousPage: false,
            },
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
    useResendStaffInvitation: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useUpdateStaffRole: () => ({ isPending: false, mutateAsync: vi.fn() }),
    useUpdateStaffSuspension: () => ({
        isPending: false,
        mutateAsync: suspensionMutation,
    }),
}))

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({ data: { _id: 'super-admin-1', role: 'super-admin' } }),
}))

vi.mock('./PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}))

describe('team account suspension', () => {
    beforeEach(() => {
        suspensionMutation.mockReset()
        suspensionMutation.mockResolvedValue({})
    })

    it('requires confirmation before suspending an active team member', async () => {
        const now = vi.spyOn(Date, 'now').mockReturnValue(
            new Date('2026-09-06T09:03:00.000Z').getTime(),
        )
        render(<TeamPageTable />)

        expect(screen.getByRole('columnheader', { name: 'Last active' })).toBeInTheDocument()
        expect(screen.getByText('Active now')).toBeInTheDocument()
        fireEvent.click(screen.getByRole('button', { name: 'Suspend access' }))
        const dialog = screen.getByRole('dialog', { name: 'Suspend this account?' })
        expect(dialog).toHaveTextContent('account and work will remain intact')
        fireEvent.click(within(dialog).getByRole('button', { name: 'Suspend account' }))

        await waitFor(() => expect(suspensionMutation).toHaveBeenCalledWith({
            userId: 'member-1',
            suspended: true,
        }))
        now.mockRestore()
    })
})
