import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SupportCenter from './SupportCenter'

const mockUseUser = vi.fn()

vi.mock('@/hooks/useUsers', () => ({
  useUser: () => mockUseUser(),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({
    supportEmail: 'support@example.com',
    timeZone: 'Africa/Lagos',
  }),
}))

describe('SupportCenter', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ data: { role: 'user' } })
  })

  it('shows candidate-specific help and configured contact details', () => {
    render(<SupportCenter area="candidate" />)

    expect(screen.getByRole('heading', { name: 'Support Center' })).toBeInTheDocument()
    expect(screen.getByText('Upload and share your CV')).toBeInTheDocument()
    expect(screen.queryByText('Create and publish a vacancy')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'support@example.com' })).toHaveAttribute('href', 'mailto:support@example.com')
    expect(screen.getByRole('link', { name: '+234 902 888 8885' })).toHaveAttribute('href', 'tel:+2349028888885')
  })

  it('filters help topics and provides a clear no-results state', () => {
    render(<SupportCenter area="candidate" />)

    fireEvent.change(screen.getByRole('searchbox', { name: 'What do you need help with?' }), {
      target: { value: 'password' },
    })
    expect(screen.getByText('Change or reset your password')).toBeInTheDocument()
    expect(screen.queryByText('Upload and share your CV')).not.toBeInTheDocument()

    fireEvent.change(screen.getByRole('searchbox', { name: 'What do you need help with?' }), {
      target: { value: 'something impossible to find' },
    })
    expect(screen.getByText(/No help topics match/)).toBeInTheDocument()
  })

  it('limits staff topics to the current role permissions', () => {
    mockUseUser.mockReturnValue({ data: { role: 'admin' } })
    const { rerender } = render(<SupportCenter area="staff" />)

    expect(screen.getByText('Create and publish a vacancy')).toBeInTheDocument()
    expect(screen.queryByText('Review applications for one vacancy')).not.toBeInTheDocument()
    expect(screen.queryByText('Manage staff accounts and invitations')).not.toBeInTheDocument()

    mockUseUser.mockReturnValue({ data: { role: 'super-admin' } })
    rerender(<SupportCenter area="staff" />)
    expect(screen.getByText('Review applications for one vacancy')).toBeInTheDocument()
    expect(screen.getByText('Manage staff accounts and invitations')).toBeInTheDocument()
  })
})
