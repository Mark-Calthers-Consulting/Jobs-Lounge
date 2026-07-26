'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'

import { ApiError } from '@/api/errors'
import {
    useEmailVerificationConfirmation,
    useEmailVerificationRequest,
} from '@/hooks/useAuth'
import { useUser } from '@/hooks/useUsers'

const TOKEN_STORAGE_KEY = 'jobslounge-email-verification-token'

type VerificationState = 'checking' | 'success' | 'invalid' | 'error' | 'missing'

const storedToken = () => {
    try {
        const value = sessionStorage.getItem(TOKEN_STORAGE_KEY)
        if (!value) return ''
        const parsed = JSON.parse(value) as { token?: unknown, storedAt?: unknown }
        const oneDay = 24 * 60 * 60 * 1000
        if (
            typeof parsed.token !== 'string'
            || typeof parsed.storedAt !== 'number'
            || Date.now() - parsed.storedAt > oneDay
        ) {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY)
            return ''
        }
        return parsed.token
    } catch {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
        return ''
    }
}

const VerifyEmailForm = () => {
    const [state, setState] = useState<VerificationState>('checking')
    const [serverMessage, setServerMessage] = useState('')
    const started = useRef(false)
    const userQuery = useUser()
    const confirmation = useEmailVerificationConfirmation()
    const resend = useEmailVerificationRequest()

    useEffect(() => {
        if (started.current) return
        started.current = true

        const hash = new URLSearchParams(window.location.hash.slice(1))
        const linkToken = hash.get('token') || ''
        const token = linkToken || storedToken()

        if (linkToken) {
            sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
                token: linkToken,
                storedAt: Date.now(),
            }))
            window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`)
        }

        if (!token) {
            queueMicrotask(() => setState('missing'))
            return
        }

        confirmation.mutate(
            { token },
            {
                onSuccess: () => {
                    sessionStorage.removeItem(TOKEN_STORAGE_KEY)
                    setState('success')
                },
                onError: (error) => {
                    if (error instanceof ApiError && error.code === 'EMAIL_VERIFICATION_LINK_INVALID') {
                        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
                        setState('invalid')
                        return
                    }
                    setServerMessage(error instanceof Error ? error.message : 'Unable to verify email.')
                    setState('error')
                },
            },
        )
    }, [confirmation])

    const sendNewLink = () => {
        setServerMessage('')
        resend.mutate(undefined, {
            onSuccess: (message) => setServerMessage(message),
            onError: (error) => setServerMessage(
                error instanceof Error ? error.message : 'Unable to send a new link.',
            ),
        })
    }

    if (state === 'checking') {
        return (
            <div role="status">
                <h1 className="text-2xl font-bold text-[#003B6D]">Verifying your email</h1>
                <p className="mt-3 text-gray-600">Please wait while we check your link…</p>
            </div>
        )
    }

    if (state === 'success' || (state === 'missing' && userQuery.data?.emailVerified)) {
        return (
            <div role="status">
                <h1 className="text-2xl font-bold text-[#003B6D]">Email verified</h1>
                <p className="mt-3 leading-7 text-gray-700">
                    Your email address has been confirmed successfully.
                </p>
                <Link
                    href={userQuery.data ? '/dashboard' : '/auth'}
                    className="mt-5 inline-flex rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
                >
                    {userQuery.data ? 'Go to dashboard' : 'Sign in'}
                </Link>
            </div>
        )
    }

    const title = state === 'missing'
        ? 'Verification link missing'
        : state === 'invalid'
            ? 'This verification link cannot be used'
            : 'We could not verify your email'

    return (
        <div role="alert">
            <h1 className="text-2xl font-bold text-[#003B6D]">{title}</h1>
            <p className="mt-3 leading-7 text-gray-700">
                {state === 'missing'
                    ? 'Open the complete link from your verification email.'
                    : state === 'invalid'
                        ? 'It may be invalid, expired, or already used.'
                        : 'Please try again. If the problem continues, request a new link.'}
            </p>

            {state === 'error' ? (
                <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
                >
                    Try verification again
                </button>
            ) : userQuery.data && !userQuery.data.emailVerified ? (
                <button
                    type="button"
                    onClick={sendNewLink}
                    disabled={resend.isPending}
                    className="mt-5 rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
                >
                    {resend.isPending ? 'Sending…' : 'Send a new verification link'}
                </button>
            ) : (
                <Link
                    href="/auth"
                    className="mt-5 inline-flex rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
                >
                    Sign in to request a new link
                </Link>
            )}

            {serverMessage ? (
                <p role="status" className="mt-4 text-sm text-gray-700">{serverMessage}</p>
            ) : null}
        </div>
    )
}

export default VerifyEmailForm
