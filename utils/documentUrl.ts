export const isValidDocumentUrl = (value: string) => {
  const normalized = value.trim()
  if (!/^https?:\/\//i.test(normalized)) return false

  try {
    const url = new URL(normalized)
    return ['http:', 'https:'].includes(url.protocol) && Boolean(url.hostname)
  } catch {
    return false
  }
}

export const DOCUMENT_URL_ERROR = 'Enter a valid link beginning with http:// or https://'
