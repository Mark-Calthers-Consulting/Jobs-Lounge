'use client'
import { useEffect, useState } from 'react'
import { apiPath } from '@/api/base'
import { readApiResponse } from '@/api/errors'
const labels: Record<string, string> = { generalUpdates: 'general updates', jobAlerts: 'vacancy alerts', newsletter: 'the career newsletter', staffNewsletter: 'team newsletters' }
export default function UnsubscribeClient({ token }: { token: string }) {
  const [type, setType] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const controller = new AbortController()
    fetch(apiPath(`/email-unsubscribe?token=${encodeURIComponent(token)}`), { signal: controller.signal, cache: 'no-store' }).then((response) => readApiResponse<{ data: { type: string } }>(response, 'This unsubscribe link is invalid')).then((result) => setType(result.data.type)).catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
    return () => controller.abort()
  }, [token])
  const unsubscribe = async () => {
    setBusy(true); setError('')
    try {
      const response = await fetch(apiPath(`/email-unsubscribe?token=${encodeURIComponent(token)}`), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', cache: 'no-store' })
      await readApiResponse(response, 'Unable to update this email preference'); setDone(true)
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Please try again') } finally { setBusy(false) }
  }
  return <main className="grid min-h-[70vh] place-items-center px-5 py-16"><section className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8"><h1 className="text-2xl font-semibold text-slate-950">{done ? 'Preference updated' : 'Manage these emails'}</h1>{error && <p role="alert" className="mt-4 text-red-700">{error}</p>}{type && <><p className="mt-4 leading-7 text-slate-600">{done ? `You have unsubscribed from ${labels[type]}.` : `Would you like to unsubscribe from ${labels[type]}?`}</p><p className="mt-3 text-sm leading-6 text-slate-500">This does not affect verification, security messages or emails about your applications.</p>{!done && <button className="mt-6 rounded-lg bg-slate-950 px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 disabled:opacity-50" disabled={busy} onClick={() => void unsubscribe()}>{busy ? 'Updating…' : 'Confirm unsubscribe'}</button>}</>}{!type && !error && <p role="status" className="mt-4">Checking your link…</p>}</section></main>
}
