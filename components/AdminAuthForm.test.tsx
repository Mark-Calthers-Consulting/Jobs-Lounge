import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import AdminAuthForm from './AdminAuthForm'

const mutateAsync = vi.fn()
const replace = vi.fn()

vi.mock('next/navigation', () => ({
    useRouter: () => ({ replace }),
}))

vi.mock('@/hooks/useAuth', () => ({
    useLogin: () => ({ isPending: false, mutateAsync }),
}))

vi.mock('sonner', () => ({
    toast: {
        error: vi.fn(),
        loading: vi.fn(),
        success: vi.fn(),
    },
}))

describe('AdminAuthForm', () => {
    beforeEach(() => {
        mutateAsync.mockReset()
        replace.mockReset()
    })

    it('provides accessible staff credentials and password visibility controls', () => {
        render(<AdminAuthForm />)

        expect(screen.getByRole('heading', { name: 'Team sign in' })).toBeInTheDocument()
        expect(screen.getByLabelText('Email address')).toHaveAttribute('type', 'email')
        const password = screen.getByLabelText('Password')
        expect(password).toHaveAttribute('type', 'password')

        fireEvent.click(screen.getByRole('button', { name: 'Show password' }))
        expect(password).toHaveAttribute('type', 'text')
        expect(screen.getByRole('button', { name: 'Hide password' })).toBeInTheDocument()
    })

    it('preserves the requested staff destination after a successful login', async () => {
        mutateAsync.mockResolvedValue({ role: 'recruiter' })
        render(<AdminAuthForm nextPath="/admin-center/applications" />)

        fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'staff@example.com' } })
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'safe-password' } })
        fireEvent.click(screen.getByRole('button', { name: 'Sign in' }))

        await waitFor(() => {
            expect(mutateAsync).toHaveBeenCalledWith({
                email: 'staff@example.com',
                password: 'safe-password',
            })
            expect(replace).toHaveBeenCalledWith('/admin-center/applications')
        })
    })
})
