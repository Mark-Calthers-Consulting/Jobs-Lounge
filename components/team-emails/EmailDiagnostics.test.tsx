import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

const lookup = vi.hoisted(() => vi.fn())
vi.mock('@/api/emailDispatches', () => ({ dispatchData: lookup }))

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import EmailDiagnosticsView from './EmailDiagnostics'

describe('EmailDiagnosticsView', () => {
  it('distinguishes SMTP acceptance from final delivery and traces an exact address', async () => {
    lookup.mockImplementation((path: string) => path === '/diagnostics' ? Promise.resolve({
      generatedAt: '2026-11-01T12:00:00Z', periodStart: '2026-10-25T12:00:00Z', workerConfigured: true,
      dueCount: 1, oldestDueAt: null, accountStatuses: [{ template: 'email-verification', status: 'sent', count: 4 }],
      failures: [], definition: 'Sent means SMTP acceptance.',
    }) : Promise.resolve({ rows: [{ id: 'one', template: 'email-verification', status: 'sent', attempts: 1, createdAt: '2026-11-01T12:00:00Z', sentAt: '2026-11-01T12:00:01Z', nextAttemptAt: null, failure: null }], limit: 30, retentionDays: 30 }))
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(<QueryClientProvider client={client}><EmailDiagnosticsView /></QueryClientProvider>)
    expect(screen.getByText(/can still fail later in cPanel Track Delivery/)).toBeInTheDocument()
    await screen.findByText('email-verification')
    fireEvent.change(screen.getByLabelText('Recipient email'), { target: { value: 'test@example.com' } })
    fireEvent.click(screen.getByRole('button', { name: 'Look up attempts' }))
    await waitFor(() => expect(lookup).toHaveBeenCalledWith('/diagnostics/lookup', 'POST', { email: 'test@example.com' }))
    expect(await screen.findByText(/Completed outbox records are normally retained/)).toBeInTheDocument()
  })
})
