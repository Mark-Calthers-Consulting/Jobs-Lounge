import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import RecruiterCandidateEmailCenter from './RecruiterCandidateEmailCenter'

const queueEmail = vi.hoisted(() => vi.fn())

vi.mock('@/hooks/useAdmin', () => ({
  useCandidateEmailRecipients: () => ({
    data: {
      status: 'success',
      count: 1,
      data: [{
        applicationId: '507f1f77bcf86cd799439012',
        candidateId: '507f1f77bcf86cd799439013',
        name: 'Ada Candidate',
        email: 'ada@example.com',
        status: 'pending',
        submittedAt: '2026-09-01T10:00:00.000Z',
        vacancy: { id: '507f1f77bcf86cd799439014', title: 'Product Designer', status: 'Open' },
      }],
      vacancies: [{ id: '507f1f77bcf86cd799439014', title: 'Product Designer', status: 'Open' }],
      pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useCandidateEmailHistory: () => ({
    data: { status: 'success', count: 0, data: [], pagination: { page: 1, limit: 20, total: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false } },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
  useQueueCandidateEmail: () => ({ isPending: false, mutateAsync: queueEmail }),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

vi.mock('sonner', () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe('RecruiterCandidateEmailCenter', () => {
  beforeEach(() => {
    queueEmail.mockReset()
    queueEmail.mockResolvedValue({ dispatchId: 'dispatch-id', recipientCount: 1, idempotent: false })
    vi.stubGlobal('crypto', { randomUUID: () => '550e8400-e29b-41d4-a716-446655440000' })
  })

  it('queues selected applications with explicit confirmation', async () => {
    render(<RecruiterCandidateEmailCenter />)
    expect(screen.getByText('Only applicants to vacancies you uploaded are available here.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Candidate for Product Designer' }))
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Application update' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'We have an update for you.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 email' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Queue 1 email' }))

    await waitFor(() => expect(queueEmail).toHaveBeenCalledWith({
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      applicationIds: ['507f1f77bcf86cd799439012'],
      subject: 'Application update',
      message: 'We have an update for you.',
    }))
  })
})
