'use client'

import { useState, useSyncExternalStore } from 'react'
import { FiCheck, FiLink } from 'react-icons/fi'

const subscribeToLocation = () => () => {}

const CopyLink = () => {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>('idle')
  const currentUrl = useSyncExternalStore(
    subscribeToLocation,
    () => window.location.href,
    () => '',
  )

  const handleCopy = async () => {
    if (!currentUrl) return

    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopyStatus('copied')
      window.setTimeout(() => setCopyStatus('idle'), 2000)
    } catch {
      setCopyStatus('failed')
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={handleCopy}
        disabled={!currentUrl}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:border-slate-400 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label={copyStatus === 'copied' ? 'Link copied' : 'Copy vacancy link'}
        title={copyStatus === 'copied' ? 'Copied' : 'Copy link'}
      >
        {copyStatus === 'copied' ? <FiCheck aria-hidden="true" /> : <FiLink aria-hidden="true" />}
      </button>
      <p className="sr-only" role="status" aria-live="polite">
        {copyStatus === 'copied'
          ? 'Link copied to clipboard.'
          : copyStatus === 'failed'
            ? 'Unable to copy the link.'
            : ''}
      </p>
    </>
  )
}

export default CopyLink
