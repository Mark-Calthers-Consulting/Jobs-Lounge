import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({
  verifiedAt: '2026-10-31T12:30:00.000Z' as string | null,
  role: 'super-admin',
  cvLink: undefined as string | undefined,
  applications: [] as { _id: string; cvLink?: string; cvDocumentId?: string; status: string; createdAt: string }[],
  uploadedCvs: [] as { id: string; name: string; originalName?: string }[],
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
        cvLink: state.cvLink,
        profileCompletion: { complete: true, percentage: 100 },
      },
      applicationSummary: { total: 1, byStatus: { pending: 1 } },
      classification: 'candidate',
      duplicateSignal: { possibleDuplicate: false, matchFields: [] },
    },
  }),
  useCandidateApplications: () => ({ isLoading: false, isError: false, data: { data: state.applications } }),
  useDeleteCandidateAccount: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('@/hooks/useUsers', () => ({ useUser: () => ({ data: { role: state.role } }) }))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
vi.mock('@tanstack/react-query', () => ({ useQuery: () => ({ isLoading: false, isError: false, data: state.uploadedCvs }) }))
vi.mock('@/api/base', () => ({ apiPath: (path: string) => `/api/backend${path}` }))
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn() }) }))
vi.mock('@/components/Modal', () => ({ default: () => null }))
vi.mock('@/components/PaginationControls', () => ({ default: () => null }))

import CandidateProfileClient from './CandidateProfileClient'

beforeEach(() => {
  state.verifiedAt = '2026-10-31T12:30:00.000Z'
  state.role = 'super-admin'
  state.cvLink = undefined
  state.applications = []
  state.uploadedCvs = []
})

describe('staff candidate email verification status', () => {
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

describe('staff candidate CV sources', () => {
  it('distinguishes submitted uploaded files and external links from current profile documents', () => {
    const submittedLink = 'https://drive.google.com/file/d/submitted-cv/view'
    state.applications = [
      { _id: 'uploaded-application', cvDocumentId: 'submitted-file', cvLink: submittedLink, status: 'pending', createdAt: '2026-10-20T12:00:00Z' },
      { _id: 'external-application', cvLink: submittedLink, status: 'pending', createdAt: '2026-10-21T12:00:00Z' },
    ]
    state.uploadedCvs = [{ id: 'new-profile-file', name: 'Updated sales CV.pdf', originalName: 'Amina_Chukwu_CV_2026.pdf' }]
    state.cvLink = 'https://drive.google.com/file/d/current-cv/view'
    render(<CandidateProfileClient candidateId="candidate-id" />)
    expect(screen.getByRole('link', { name: 'Submitted CV (uploaded file)' })).toHaveAttribute('href', '/api/backend/admin/applications/uploaded-application/cv')
    expect(screen.getByRole('link', { name: 'Submitted CV (external link)' })).toHaveAttribute('href', submittedLink)
    expect(screen.getByRole('link', { name: 'Updated sales CV.pdf' })).toHaveAttribute('href', '/api/backend/admin/candidates/candidate-id/cvs/new-profile-file/content')
    expect(screen.getByRole('link', { name: 'External CV link' })).toHaveAttribute('href', state.cvLink)
    expect(screen.getByRole('heading', { name: 'Current profile documents' })).toBeInTheDocument()
    expect(screen.getByText('Uploaded file · Amina_Chukwu_CV_2026.pdf')).toBeInTheDocument()
    expect(screen.getAllByText('External link access is not checked automatically.')).toHaveLength(2)
    expect(screen.getByText(/Updating a profile CV does not replace these documents/)).toBeInTheDocument()
    expect(screen.queryByText('Legacy CV link')).not.toBeInTheDocument()
  })

  it.each(['javascript:alert(1)', 'data:text/html,test', '/api/backend/admin/untrusted', '//example.test/cv'])('does not make an unsafe external CV link clickable: %s', (cvLink) => {
    state.cvLink = cvLink
    state.applications = [{ _id: 'unsafe-application', cvLink, status: 'pending', createdAt: '2026-10-20T12:00:00Z' }]
    render(<CandidateProfileClient candidateId="candidate-id" />)
    expect(screen.queryByRole('link', { name: 'External CV link' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Submitted CV (external link)' })).not.toBeInTheDocument()
    expect(screen.getByText('External CV link unavailable')).toBeInTheDocument()
    expect(screen.getByText('Submitted CV (external link) unavailable')).toBeInTheDocument()
    expect(screen.queryByText('No CV on profile')).not.toBeInTheDocument()
  })

  it('keeps missing CVs explicit without inventing a document link', () => {
    state.applications = [{ _id: 'old-application', status: 'pending', createdAt: '2026-10-20T12:00:00Z' }]
    render(<CandidateProfileClient candidateId="candidate-id" />)
    expect(screen.getByText('No submitted CV')).toBeInTheDocument()
    expect(screen.getByText('No CV on profile')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Submitted CV/ })).not.toBeInTheDocument()
  })
})
