import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminSettingsClient from './AdminSettingsClient'

let currentRole: 'admin' | 'recruiter' | 'super-admin' = 'admin'
let currentSection = ''

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
            defaultJobStatus: 'Draft',
            defaultDeadlineMode: 'none',
            revision: 1,
        },
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
    }),
    useUpdateOrganizationSettings: () => ({
        isPending: false,
        mutateAsync: vi.fn(),
    }),
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn() },
}))

describe('role-aware admin settings', () => {
    beforeEach(() => {
        currentRole = 'admin'
        currentSection = ''
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
        expect(screen.getByRole('tab', { name: 'Organization' })).toHaveAttribute('aria-selected', 'true')
        expect(screen.getByRole('heading', { name: 'Support and region' })).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Vacancy creation defaults' })).toBeInTheDocument()
    })
})
