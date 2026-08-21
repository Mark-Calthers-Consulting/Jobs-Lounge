import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import ChangePasswordForm from './ChangePasswordForm'

const mutateAsync = vi.fn()

vi.mock('@/hooks/useAuth', () => ({
    usePasswordChange: () => ({
        isPending: false,
        mutateAsync,
    }),
}))

vi.mock('sonner', () => ({
    toast: { success: vi.fn() },
}))

describe('ChangePasswordForm', () => {
    beforeEach(() => {
        mutateAsync.mockReset()
        mutateAsync.mockResolvedValue('Password changed. Your other sessions have been signed out.')
    })

    it('submits the current and new password and keeps recovery as a fallback', async () => {
        render(<ChangePasswordForm area="candidate" backHref="/dashboard/settings" />)

        fireEvent.change(screen.getByLabelText('Current password'), {
            target: { value: 'current-password' },
        })
        fireEvent.change(screen.getByLabelText('New password'), {
            target: { value: 'replacement-password' },
        })
        fireEvent.change(screen.getByLabelText('Confirm new password'), {
            target: { value: 'replacement-password' },
        })
        fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

        await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
            currentPassword: 'current-password',
            newPassword: 'replacement-password',
        }))
        expect(await screen.findByText(/other sessions have been signed out/i)).toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'Forgot your current password?' }))
            .toHaveAttribute('href', '/forgot-password?area=candidate')
    })

    it('rejects reusing the current password before calling the API', async () => {
        render(<ChangePasswordForm area="admin" backHref="/admin-center/settings" />)

        for (const label of ['Current password', 'New password', 'Confirm new password']) {
            fireEvent.change(screen.getByLabelText(label), {
                target: { value: 'same-password' },
            })
        }
        fireEvent.click(screen.getByRole('button', { name: 'Change password' }))

        expect(await screen.findByText(/different from your current password/i)).toBeInTheDocument()
        expect(mutateAsync).not.toHaveBeenCalled()
    })
})
