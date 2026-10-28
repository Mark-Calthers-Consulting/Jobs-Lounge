import { beforeEach, describe, expect, it, vi } from 'vitest'
import { replaceCv, uploadCv } from './cvs'
import { csrfFetch } from './csrf'

vi.mock('./csrf', () => ({ csrfFetch: vi.fn() }))

const mockedFetch = vi.mocked(csrfFetch)
const success = (data: unknown, status = 200) => new Response(JSON.stringify({ status: 'success', data }), {
  status, headers: { 'Content-Type': 'application/json' },
})

describe('chunked CV transport', () => {
  beforeEach(() => mockedFetch.mockReset())

  it('keeps each file request under the hosting body threshold', async () => {
    const sent: number[] = []
    mockedFetch.mockImplementation(async (_url, init) => {
      if (init?.method === 'POST' && String(_url).includes('/chunks/')) {
        sent.push((init.body as Blob).size)
        return success(null)
      }
      if (String(_url).endsWith('/complete')) return success({ id: 'cv' })
      return success({ id: 'session', chunkBytes: 64 * 1024 }, 201)
    })
    const file = new File([new Uint8Array(150_000)], 'cv.pdf', { type: 'application/pdf' })
    const result = await uploadCv({ file, name: 'Main CV' })
    expect(result.id).toBe('cv')
    expect(sent).toEqual([64 * 1024, 64 * 1024, 18_928])
    expect(sent.every((size) => size < 128 * 1024)).toBe(true)
  })

  it('uses the same transport for replacement and cancels a failed upload', async () => {
    mockedFetch.mockImplementation(async (_url, init) => {
      if (init?.method === 'POST' && String(_url).includes('/chunks/')) throw new Error('Network failed')
      if (init?.method === 'DELETE') return success(null)
      return success({ id: 'session', chunkBytes: 64 * 1024 }, 201)
    })
    await expect(replaceCv({ id: 'old', file: new File(['x'], 'cv.pdf', { type: 'application/pdf' }) }))
      .rejects.toThrow('Network failed')
    const startBody = JSON.parse(String(mockedFetch.mock.calls[0][1]?.body))
    expect(startBody).toMatchObject({ mode: 'replace', cvId: 'old' })
    expect(mockedFetch.mock.calls.some(([, init]) => init?.method === 'DELETE')).toBe(true)
  })
})
