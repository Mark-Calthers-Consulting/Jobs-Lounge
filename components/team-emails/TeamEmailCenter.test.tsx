import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import TeamEmailCenter from './TeamEmailCenter'

const queueEmail = vi.hoisted(() => vi.fn())
const cancelEmail = vi.hoisted(() => vi.fn())
const recipientFilters = vi.hoisted(() => vi.fn())

const recipient = {
  id: '507f1f77bcf86cd799439011',
  name: 'Ada Recruiter',
  email: 'ada@example.com',
  role: 'recruiter' as const,
  accountState: 'active' as const,
  lastActiveAt: '2026-06-01T09:00:00.000Z',
  eligible: true,
  context: { label: 'No activity for at least 30 days' },
}

vi.mock('@/hooks/useAdmin', () => ({
  useCancelScheduledTeamEmail: () => ({
    isPending: false,
    mutateAsync: cancelEmail,
  }),
  useQueueTeamEmail: () => ({
    isPending: false,
    mutateAsync: queueEmail,
  }),
  useTeamEmailRecipients: (filters: unknown) => {
    recipientFilters(filters)
    return {
      data: {
        status: 'success',
        count: 1,
        data: [recipient],
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      },
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    }
  },
  useTeamEmailHistory: () => ({
    data: {
      status: 'success',
      count: 0,
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  }),
}))

vi.mock('@/components/PlatformSettingsProvider', () => ({
  usePlatformSettings: () => ({ timeZone: 'Africa/Lagos' }),
}))

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))

describe('TeamEmailCenter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    queueEmail.mockResolvedValue({
      dispatchId: 'dispatch-id',
      recipientCount: 1,
      idempotent: false,
    })
    cancelEmail.mockResolvedValue({
      dispatchId: 'scheduled-dispatch',
      cancelledRecipientCount: 1,
    })
    vi.stubGlobal('crypto', {
      randomUUID: () => '550e8400-e29b-41d4-a716-446655440000',
    })
  })

  it('offers the four reminders and a custom email workflow', () => {
    render(<TeamEmailCenter />)

    expect(screen.getByRole('button', { name: /Activity check-in/ })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: /Application review update/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Vacancy draft check-in/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Upcoming vacancy deadlines/ })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Custom email/ })).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Recipient window/ }))
    expect(screen.getByRole('option', { name: '7+ days inactive' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'All active team' })).toBeInTheDocument()
    expect(recipientFilters).toHaveBeenCalledWith(expect.objectContaining({
      template: 'staff-activity-reminder',
      threshold: 30,
    }))
  })

  it('uses one recipient-window control for eligibility and all-team selection', () => {
    render(<TeamEmailCenter />)

    const windowSelect = screen.getByRole('button', { name: /Recipient window/ })
    fireEvent.click(windowSelect)
    fireEvent.click(screen.getByRole('option', { name: 'All active team' }))

    expect(windowSelect).toHaveTextContent('All active team')
    expect(recipientFilters).toHaveBeenLastCalledWith(expect.objectContaining({
      scope: 'all-team',
    }))
  })

  it('requires recipient selection and confirmation before queueing', async () => {
    render(<TeamEmailCenter />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Recruiter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 email' }))
    const dialog = screen.getByRole('dialog', { name: 'Queue team emails?' })
    expect(dialog).toHaveTextContent('Activity check-in')
    fireEvent.click(within(dialog).getByRole('button', { name: 'Queue 1 email' }))

    await waitFor(() => expect(queueEmail).toHaveBeenCalledWith(expect.objectContaining({
      requestId: '550e8400-e29b-41d4-a716-446655440000',
      template: 'staff-activity-reminder',
      threshold: 30,
      recipientIds: ['507f1f77bcf86cd799439011'],
    })))
    expect(screen.getByRole('button', { name: 'Review email' })).toBeDisabled()
  })

  it('unlocks the subject only for custom emails', () => {
    render(<TeamEmailCenter />)

    expect(screen.getByLabelText('Subject')).toBeDisabled()
    fireEvent.click(screen.getByRole('button', { name: /Custom email/ }))
    expect(screen.getByLabelText('Subject')).toBeEnabled()
    expect(screen.getByLabelText('Message')).toHaveValue('')
  })

  it('accepts manual addresses for custom email delivery', async () => {
    render(<TeamEmailCenter />)

    fireEvent.click(screen.getByRole('button', { name: /Custom email/ }))
    fireEvent.change(screen.getByLabelText('Add email addresses manually'), {
      target: { value: 'test-one@example.com, test-two@example.com' },
    })
    fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Test update' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'This is a delivery test.' } })
    fireEvent.click(screen.getByRole('button', { name: 'Review 2 emails' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Queue 2 emails' }))

    await waitFor(() => expect(queueEmail).toHaveBeenCalledWith(expect.objectContaining({
      template: 'staff-custom',
      recipientIds: [],
      manualRecipients: ['test-one@example.com', 'test-two@example.com'],
      subject: 'Test update',
    })))
  })

  it('queues a future delivery using an organization-time-zone schedule', async () => {
    queueEmail.mockResolvedValueOnce({
      dispatchId: 'scheduled-dispatch',
      recipientCount: 1,
      idempotent: false,
      scheduledFor: '2026-09-12T09:30:00.000Z',
    })
    render(<TeamEmailCenter />)

    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Ada Recruiter' }))
    fireEvent.click(screen.getByRole('button', { name: 'Schedule' }))
    const scheduleInput = screen.getByLabelText('Delivery date and time')
    expect((scheduleInput as HTMLInputElement).value).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)
    fireEvent.click(screen.getByRole('button', { name: 'Review 1 email' }))

    const dialog = screen.getByRole('dialog', { name: 'Schedule team emails?' })
    fireEvent.click(within(dialog).getByRole('button', { name: 'Schedule 1 email' }))

    await waitFor(() => expect(queueEmail).toHaveBeenCalledWith(expect.objectContaining({
      scheduledFor: expect.stringMatching(/Z$/),
    })))
  })
})
