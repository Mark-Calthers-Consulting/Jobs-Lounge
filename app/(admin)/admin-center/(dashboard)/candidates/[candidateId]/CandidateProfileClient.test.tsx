import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  verifiedAt: '2026-10-31T12:30:00.000Z' as string | null,
  role: 'super-admin',
}))

vi.mock('@/hooks/useAdmin', () => ({
  useAdminCandidate: () => ({
    isLoading: false,
    isError: false,
    data: {
      candidate: {
        _id: 'candidate-id',
        name: 'Ada Lovelace',
        email: 'ada@example.test',
        emailVerified: Boolean(state.verifiedAt),
        emailVerifiedAt: state.verifiedAt,
        telephone: '+2348000000000',
        profileCompletion: { complete: true, percentage: 100 },
      },
      applicationSummary: { total: 1, byStatus: { pending: 1 } },
      classification: 'candidate',
      duplicateSignal: { possibleDuplicate: false, matchFields: [] },
    },
  }),
  useCandidateApplications: () => ({ isLoading: false, isError: false, data: { data: [] } }),
  useDeleteCandidateAccount: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('@/hooks/useUsers', () => ({ useUser: () => ({ data: { role: state.role } }) }))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ isLoading: false, isError: false, data: [] }) }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/components/Modal', () => ({ default: () => null }))
vi.mock('@/components/PaginationControls', () => ({ default: () => null }))

import CandidateProfileClient from './CandidateProfileClient'

describe('staff candidate email verification status', () => {
  beforeEach(() => { state.verifiedAt = '2026-10-31T12:30:00.000Z'; state.role = 'super-admin' })

  it('shows a verified badge, timestamp and diagnostics link to Super-admins', () => {
    render(<CandidateProfileClient candidateId="candidate-id" />)
    expect(screen.getByText('Email verified')).toBeInTheDocument()
    expect(screen.getByText(/Verified 31 Oct 2026/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Open email diagnostics' })).toHaveAttribute('href', '/admin-center/analytics?tab=emails')
  })

  it('shows an explicit unverified state without diagnostics access to recruiters', () => {
    state.verifiedAt = null
    state.role = 'recruiter'
    render(<CandidateProfileClient candidateId="candidate-id" />)
    expect(screen.getByText('Profile complete')).toBeInTheDocument()
    expect(screen.getAllByText('Email not verified')).toHaveLength(1)
    expect(screen.getByText('Not verified')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open email diagnostics' })).not.toBeInTheDocument()
  })
})
