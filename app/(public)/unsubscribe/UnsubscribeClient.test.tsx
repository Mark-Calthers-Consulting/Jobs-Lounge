import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import UnsubscribeClient from './UnsubscribeClient'
afterEach(() => vi.unstubAllGlobals())
it('scanner-safe GET requires an explicit signed POST to change preferences', async () => {
  const fetcher = vi.fn().mockImplementation(async () => new Response(JSON.stringify({ status: 'success', data: { type: 'newsletter' } }), { status: 200 }))
  vi.stubGlobal('fetch', fetcher)
  render(<UnsubscribeClient token="signed-token" />)
  await screen.findByRole('button', { name: 'Confirm unsubscribe' })
  expect(fetcher).toHaveBeenCalledTimes(1)
  expect(fetcher.mock.calls[0][1].method).toBeUndefined()
  fireEvent.click(screen.getByRole('button', { name: 'Confirm unsubscribe' }))
  await waitFor(() => expect(screen.getByRole('heading')).toHaveTextContent('Preference updated'))
  expect(fetcher.mock.calls[1][1].method).toBe('POST')
})
