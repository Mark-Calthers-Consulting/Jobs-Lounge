import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AuthForm from './AuthForm'

let registrationEnabled = true

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace: vi.fn() }),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
    usePlatformSettings: () => ({
        supportEmail: 'support@example.com',
        timeZone: 'Africa/Lagos',
        candidateRegistrationEnabled: registrationEnabled,
    }),
}))

vi.mock('@/hooks/useAuth', () => ({
    useLogin: () => ({ isPending: false, mutateAsync: vi.fn(), reset: vi.fn() }),
    useRegister: () => ({ isPending: false, mutateAsync: vi.fn(), reset: vi.fn() }),
}))

vi.mock('sonner', () => ({
    toast: {
        dismiss: vi.fn(),
        error: vi.fn(),
        loading: vi.fn(),
        success: vi.fn(),
    },
}))

describe('candidate registration availability', () => {
    beforeEach(() => {
        registrationEnabled = true
    })

    it('shows the registration form while candidate registration is open', () => {
        render(<AuthForm initialMode="register" />)
        expect(screen.getByRole('heading', { name: 'Create a Jobs Lounge account' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument()
    })

    it('replaces the registration form with a clear paused state', () => {
        registrationEnabled = false
        render(<AuthForm initialMode="register" />)

        expect(screen.getByRole('heading', { name: 'Candidate registration is paused' })).toBeInTheDocument()
        expect(screen.getByText('Existing candidates can still sign in.', { exact: false })).toBeInTheDocument()
        expect(screen.queryByRole('button', { name: 'Sign up' })).not.toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument()
    })
})
