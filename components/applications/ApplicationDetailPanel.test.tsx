import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ApplicationDetailPanel from './ApplicationDetailPanel'

const state = vi.hoisted(() => ({
  cvDocumentId: undefined as string | undefined,
  cvLink: undefined as string | undefined,
  currentCvLink: undefined as string | undefined,
}))

vi.mock('@/hooks/useApplicationWorkspace', () => ({
  useApplicationDetail: () => ({
    isLoading: false,
    isError: false,
    data: {
      application: { _id: 'application-id', cvDocumentId: state.cvDocumentId, cvLink: state.cvLink, status: 'pending', workflowVersion: 0, createdAt: '2026-10-20T12:00:00Z' },
      candidate: { _id: 'candidate-id', name: 'Amina Chukwu', email: 'amina@example.test', cvLink: state.currentCvLink },
      duplicateSignal: { possibleDuplicate: false, matchFields: [] },
    },
  }),
  useApplicationActivity: () => ({ data: { pages: [] }, hasNextPage: false }),
  useUpdateApplicationWorkflow: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useAddApplicationNote: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))
vi.mock('@/components/PlatformSettingsProvider', () => ({ usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }) }))
vi.mock('@/components/Modal', () => ({ default: () => null }))
vi.mock('@/api/base', () => ({ apiPath: (path: string) => `/api/backend${path}` }))

beforeEach(() => {
  state.cvDocumentId = undefined
  state.cvLink = undefined
  state.currentCvLink = undefined
})

describe('application review CV sources', () => {
  it('opens uploaded CVs through the authenticated application route even when a URL also exists', () => {
    state.cvDocumentId = 'private-cv'
    state.cvLink = 'https://drive.google.com/file/d/old-cv/view'
    render(<ApplicationDetailPanel applicationId="application-id" />)
    const link = screen.getByRole('link', { name: 'Open uploaded CV' })
    expect(link).toHaveAttribute('href', '/api/backend/admin/applications/application-id/cv')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
    expect(screen.queryByRole('link', { name: 'Open external CV link' })).not.toBeInTheDocument()
    link.focus()
    expect(link).toHaveFocus()
  })

  it('labels an external CV without implying its sharing permissions have been checked', () => {
    state.cvLink = 'https://drive.google.com/file/d/restricted-cv/view'
    render(<ApplicationDetailPanel applicationId="application-id" />)
    expect(screen.getByRole('link', { name: 'Open external CV link' })).toHaveAttribute('href', state.cvLink)
    expect(screen.getByText('External link access is not checked automatically.')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open uploaded CV' })).not.toBeInTheDocument()
  })

  it('keeps the submitted link unchanged when the profile CV is newer', () => {
    state.cvLink = 'https://drive.google.com/file/d/submitted-cv/view'
    state.currentCvLink = 'https://drive.google.com/file/d/new-profile-cv/view'
    render(<ApplicationDetailPanel applicationId="application-id" />)
    expect(screen.getByRole('link', { name: 'Open external CV link' })).toHaveAttribute('href', state.cvLink)
    fireEvent.click(screen.getByText('Current profile documents'))
    expect(screen.getByRole('link', { name: 'Current external CV link' })).toHaveAttribute('href', state.currentCvLink)
    expect(screen.getByText(/Uploading a new profile CV does not replace this document/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View full candidate profile/ })).toHaveAttribute('href', '/admin-center/candidates/candidate-id')
  })

  it.each(['javascript:alert(1)', 'data:text/html,test', '/untrusted-cv'])('does not open an unsafe external CV: %s', (cvLink) => {
    state.cvLink = cvLink
    render(<ApplicationDetailPanel applicationId="application-id" />)
    expect(screen.getByText('External CV link unavailable')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Open external CV link' })).not.toBeInTheDocument()
  })

  it('shows an explicit empty state when no CV was submitted', () => {
    render(<ApplicationDetailPanel applicationId="application-id" />)
    expect(screen.getByText('No submitted CV')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Open .*CV/ })).not.toBeInTheDocument()
  })
})
