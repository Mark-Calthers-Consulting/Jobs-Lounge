import { describe, expect, it } from 'vitest'

import { publicEmployerName } from './jobPresentation'

describe('publicEmployerName', () => {
  it('uses polished public copy for undisclosed employers', () => {
    expect(publicEmployerName('Undisclosed employer')).toBe('Confidential employer')
    expect(publicEmployerName(' undisclosed company ')).toBe('Confidential employer')
    expect(publicEmployerName('')).toBe('Confidential employer')
  })

  it('preserves disclosed employer names', () => {
    expect(publicEmployerName(' Mark Calthers Consulting ')).toBe('Mark Calthers Consulting')
  })
})
