import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminSettingsClient from './AdminSettingsClient'

let currentRole: 'admin' | 'recruiter' | 'super-admin' = 'admin'
let currentSection = ''
const signOutAll = vi.hoisted(() => vi.fn())
const updateOrganization = vi.hoisted(() => vi.fn())

vi.mock('next/navigation', () => ({
    usePathname: () => '/admin-center/settings',
    useRouter: () => ({ replace: vi.fn() }),
    useSearchParams: () => new URLSearchParams(currentSection),
}))

vi.mock('@/hooks/useUsers', () => ({
    useUser: () => ({
        data: {
            _id: 'staff-id',
            name: 'Ada Lovelace',
            email: 'ada@example.com',
            emailVerified: true,
            role: currentRole,
        },
        isLoading: false,
        isError: false,
    }),
}))

vi.mock('@/hooks/useAuth', () => ({
    useEmailVerificationRequest: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('@/hooks/useSettings', () => ({
    useOrganizationSettings: () => ({
        data: {
            supportEmail: 'support@example.com',
            timeZone: 'Africa/Lagos',
            candidateRegistrationEnabled: true,
            staffSessionDurationHours: {
                admin: 720,
                recruiter: 720,
                superAdmin: 720,
            },
            revision: 1,
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
    useUpdateOrganizationSettings: () => ({
        isPending: false,
        mutateAsync: updateOrganization,
    }),
}))

vi.mock('@/hooks/useAdmin', () => ({
    useSignOutAllTeamMembers: () => ({
        isPending: false,
        mutateAsync: signOutAll,
    }),
}))

vi.mock('sonner', () => ({
    toast: { error: vi.fn(), success: vi.fn() },
}))

describe('role-aware admin settings', () => {
    beforeEach(() => {
        currentRole = 'admin'
        currentSection = ''
        signOutAll.mockReset()
        updateOrganization.mockReset()
    })

    it('shows personal account settings to an Administrator without Organization access', () => {
        render(<AdminSettingsClient />)
        expect(screen.getByRole('heading', { name: 'Staff account' })).toBeInTheDocument()
        expect(screen.queryByRole('tab', { name: 'Organization' })).not.toBeInTheDocument()
        expect(screen.getByText('Create vacancies')).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Change password' }))
            .toHaveAttribute('href', '/admin-center/settings/change-password')
    })

    it('shows the Organization section only to a Super-admin', () => {
        currentRole = 'super-admin'
        currentSection = 'section=organization'
        render(<AdminSettingsClient />)
        expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual(['Organization', 'Personal'])
        expect(screen.getByRole('tab', { name: 'Organization' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('heading', { name: 'Candidate access' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Team access' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Support and region' })).toBeInTheDocument()
        expect(screen.getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent))
            .toEqual(['Candidate access', 'Team access', 'Support and region'])
        expect(screen.getByRole('button', { name: 'Sign out team' })).toBeInTheDocument()
        expect(screen.queryByRole('heading', { name: 'Vacancy creation defaults' })).not.toBeInTheDocument()
    })

    it('requires confirmation before pausing candidate registration', async () => {
        currentRole = 'super-admin'
        currentSection = 'section=organization'
        updateOrganization.mockResolvedValue({})
        render(<AdminSettingsClient />)

        fireEvent.click(screen.getByRole('button', { name: 'Pause registration' }))
        const dialog = screen.getByRole('dialog', { name: 'Pause candidate registration?' })
        expect(dialog).toHaveTextContent('Existing candidate accounts, staff access, and staff invitations will continue to work.')
        fireEvent.click(within(dialog).getByRole('button', { name: 'Pause registration' }))

        await waitFor(() => expect(updateOrganization).toHaveBeenCalledWith({
            candidateRegistrationEnabled: false,
            revision: 1,
        }))
    })

    it('saves controlled session durations for each staff role', async () => {
        currentRole = 'super-admin'
        currentSection = 'section=organization'
        updateOrganization.mockResolvedValue({})
        render(<AdminSettingsClient />)

        expect(screen.getByLabelText('Administrators')).toHaveValue('720')
        expect(screen.getByLabelText('Recruiters')).toHaveValue('720')
        expect(screen.getByLabelText('Super-admins')).toHaveValue('720')
        const saveButton = screen.getByRole('button', { name: 'Save session policy' })
        expect(saveButton).toBeDisabled()

        fireEvent.change(screen.getByLabelText('Administrators'), { target: { value: '72' } })
        expect(saveButton).toBeEnabled()
        fireEvent.click(saveButton)

        await waitFor(() => expect(updateOrganization).toHaveBeenCalledWith({
            staffSessionDurationHours: {
                admin: 72,
                recruiter: 720,
                superAdmin: 720,
            },
            revision: 1,
        }))
    })

    it('confirms that team-wide sign-out excludes candidates and Super-admins', async () => {
        currentRole = 'super-admin'
        currentSection = 'section=organization'
        signOutAll.mockResolvedValue({ affectedAccounts: 3 })
        render(<AdminSettingsClient />)

        fireEvent.click(screen.getByRole('button', { name: 'Sign out team' }))
        const dialog = screen.getByRole('dialog', { name: 'Sign out all team members?' })
        expect(dialog).toHaveTextContent('Candidate and Super-admin sessions will remain active')
        fireEvent.click(within(dialog).getByRole('button', { name: 'Sign out team' }))

        await waitFor(() => expect(signOutAll).toHaveBeenCalledTimes(1))
    })
})
