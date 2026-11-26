import { render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import AdminAccessGuard from './AdminAccessGuard'

let role: string
let path: string
let enabled: boolean
const replace = vi.fn()
const router = { replace }
vi.mock('next/navigation', () => ({ usePathname: () => path, useRouter: () => router }))
vi.mock('@/hooks/useUsers', () => ({ useUser: () => ({ data: { role }, isPending: false }) }))
vi.mock('@/hooks/useSettings', () => ({ useStaffFeatureSettings: () => ({ data: { candidateEmail: { enabled } }, isPending: false }) }))
vi.mock('./RouteAccessState', () => ({ default: () => <p>Checking access</p> }))
beforeEach(() => { role = 'admin'; path = '/admin-center/emails'; enabled = false; replace.mockReset() })
describe('Capability-aware email route access', () => {
  it.each(['admin', 'recruiter'])('allows selected %s accounts into the email workspace', (value) => {
    role = value; enabled = true
    render(<AdminAccessGuard><p>Email workspace</p></AdminAccessGuard>)
    expect(screen.getByText('Email workspace')).toBeInTheDocument()
    expect(replace).not.toHaveBeenCalled()
  })
  it.each(['admin', 'recruiter'])('denies unselected %s accounts', async (value) => {
    role = value
    render(<AdminAccessGuard><p>Email workspace</p></AdminAccessGuard>)
    expect(screen.queryByText('Email workspace')).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalledWith('/admin-center?access=denied'))
  })
  it.each(['/admin-center/candidates', '/admin-center/applications', '/admin-center/analytics', '/admin-center/team'])('does not broaden Admin access to %s', async (value) => {
    enabled = true; path = value
    render(<AdminAccessGuard><p>Protected data</p></AdminAccessGuard>)
    expect(screen.queryByText('Protected data')).not.toBeInTheDocument()
    await waitFor(() => expect(replace).toHaveBeenCalled())
  })
  it('preserves Super-admin access without a delegated grant', () => {
    role = 'super-admin'
    render(<AdminAccessGuard><p>Email workspace</p></AdminAccessGuard>)
    expect(screen.getByText('Email workspace')).toBeInTheDocument()
  })
})
