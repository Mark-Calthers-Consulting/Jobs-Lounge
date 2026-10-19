import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import HomepageAccountCta from './HomepageAccountCta'

let user: Record<string, unknown> | null = null
let isPending = false

vi.mock('@/hooks/useUsers', () => ({
  useUser: () => ({ data: user, isPending }),
}))

describe('HomepageAccountCta', () => {
  beforeEach(() => {
    user = null
    isPending = false
  })

  it('invites guests to create a profile', () => {
    render(<HomepageAccountCta />)
    expect(screen.getByRole('link', { name: 'Create your profile' }))
      .toHaveAttribute('href', '/auth?mode=register')
  })

  it('takes incomplete candidates to finish their profile', () => {
    user = { role: 'user', profileCompleted: false }
    render(<HomepageAccountCta />)
    expect(screen.getByRole('link', { name: 'Complete your profile' }))
      .toHaveAttribute('href', '/dashboard/profile')
  })

  it('takes complete candidates back to their profile', () => {
    user = { role: 'user', profileCompletion: { complete: true } }
    render(<HomepageAccountCta />)
    expect(screen.getByRole('link', { name: 'Go to your profile' }))
      .toHaveAttribute('href', '/dashboard/profile')
  })

  it('takes staff to the admin dashboard', () => {
    user = { role: 'recruiter' }
    render(<HomepageAccountCta />)
    expect(screen.getByRole('link', { name: 'Go to dashboard' }))
      .toHaveAttribute('href', '/admin-center')
  })

  it('reserves the CTA space while the account is loading', () => {
    isPending = true
    render(<HomepageAccountCta />)
    expect(screen.getByRole('status')).toHaveTextContent('Checking your account')
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})
