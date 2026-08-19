import { describe, expect, it } from 'vitest'
import { isValidDocumentUrl } from './documentUrl'

describe('isValidDocumentUrl', () => {
  it.each([
    'https://drive.google.com/file/d/cv/view',
    'http://example.com/cv.pdf',
    '  HTTPS://example.com/cv  ',
  ])('accepts an explicit HTTP or HTTPS link: %s', (value) => {
    expect(isValidDocumentUrl(value)).toBe(true)
  })

  it.each([
    '',
    'www.example.com/cv.pdf',
    'https:example.com/cv.pdf',
    'https:/example.com/cv.pdf',
    'ftp://example.com/cv.pdf',
    'javascript:alert(1)',
  ])('rejects a malformed or unsupported link: %s', (value) => {
    expect(isValidDocumentUrl(value)).toBe(false)
  })
})
