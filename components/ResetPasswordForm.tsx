'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'sonner'

import { ApiError } from '@/api/errors'
import { usePasswordResetConfirmation } from '@/hooks/useAuth'
import {
    PasswordResetFormValues,
    passwordResetSchema,
} from '@/schemas/authSchema'

const TOKEN_STORAGE_KEY = 'jobslounge-password-reset-token'
const TOKEN_STORAGE_LIFETIME_MS = 30 * 60 * 1000

const PasswordInput = ({
    error,
    id,
    label,
    register,
}: {
    error?: string
    id: string
    label: string
    register: UseFormRegisterReturn
}) => {
    const [visible, setVisible] = useState(false)
    const errorId = `${id}-error`

    return (
        <div>
            <label htmlFor={id} className="font-medium text-gray-900">{label}</label>
            <div className="relative mt-2">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    autoComplete="new-password"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className="w-full rounded-md border border-gray-300 px-3 py-3 pr-11 focus:outline-none aria-invalid:border-red-600"
                    {...register}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-gray-500 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003B6D]"
                >
                    {visible
                        ? <FiEyeOff aria-hidden="true" className="size-[18px]" />
                        : <FiEye aria-hidden="true" className="size-[18px]" />}
                </button>
            </div>
            {error ? <p id={errorId} className="mt-1 text-sm text-red-700">{error}</p> : null}
        </div>
    )
}

const storedToken = () => {
    try {
        const stored = JSON.parse(sessionStorage.getItem(TOKEN_STORAGE_KEY) || 'null')
        if (
            typeof stored?.token !== 'string'
            || !Number.isFinite(stored?.storedAt)
            || Date.now() - stored.storedAt >= TOKEN_STORAGE_LIFETIME_MS
        ) {
            sessionStorage.removeItem(TOKEN_STORAGE_KEY)
            return ''
        }
        return stored.token
    } catch {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY)
        return ''
    }
}

const ResetPasswordForm = ({ area }: { area: 'candidate' | 'admin' }) => {
    const [token, setToken] = useState('')
    const [ready, setReady] = useState(false)
    const [invalidLink, setInvalidLink] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const resetConfirmation = usePasswordResetConfirmation()
    const router = useRouter()
    const form = useForm<PasswordResetFormValues>({
        resolver: zodResolver(passwordResetSchema),
        defaultValues: { password: '', confirmPassword: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    useEffect(() => {
        let cancelled = false
        queueMicrotask(() => {
            if (cancelled) return
            const hash = new URLSearchParams(window.location.hash.slice(1))
            const linkToken = hash.get('token') || ''
            const activeToken = linkToken || storedToken()
            if (linkToken) {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
                    token: linkToken,
                    storedAt: Date.now(),
                }))
                window.history.replaceState(
                    null,
                    '',
                    `${window.location.pathname}${window.location.search}`,
                )
            }
            setToken(activeToken)
            setInvalidLink(!activeToken)
            setReady(true)
        })
        return () => { cancelled = true }
    }, [])

    const submit = form.handleSubmit(async (values) => {
        setServerError(null)
        try {
            await resetConfirmation.mutateAsync({
                token,
                password: values.password,
            })
            sessionStorage.removeItem(TOKEN_STORAGE_KEY)
            toast.success('Password changed. Sign in with your new password.')
            router.replace(area === 'admin'
                ? '/admin-center/login?passwordReset=success'
                : '/auth?passwordReset=success')
        } catch (error) {
            if (error instanceof ApiError && error.code === 'PASSWORD_RESET_LINK_INVALID') {
                sessionStorage.removeItem(TOKEN_STORAGE_KEY)
                setInvalidLink(true)
                setToken('')
                return
            }
            setServerError(error instanceof Error ? error.message : 'Unable to reset password.')
        }
    })

    if (!ready) {
        return <p role="status" className="text-sm text-gray-600">Checking your reset link…</p>
    }

    if (invalidLink) {
        return (
            <div role="alert">
                <h1 className="text-2xl font-bold text-[#003B6D]">This reset link cannot be used</h1>
                <p className="mt-3 leading-7 text-gray-700">
                    It may be invalid, expired, or already used. Request a new link to continue.
                </p>
                <a
                    href={`/forgot-password?area=${area}`}
                    className="mt-5 inline-flex rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white"
                >
                    Request a new link
                </a>
            </div>
        )
    }

    const errors = form.formState.errors
    return (
        <>
            <h1 className="text-2xl font-bold text-[#003B6D]">Choose a new password</h1>
            <p className="mt-2 leading-7 text-gray-600">
                Use at least 8 characters. Changing it will sign out every existing session.
            </p>
            <form onSubmit={submit} noValidate aria-busy={resetConfirmation.isPending} className="mt-6 space-y-5">
                <PasswordInput
                    id="new-password"
                    label="New password"
                    error={errors.password?.message}
                    register={form.register('password')}
                />
                <PasswordInput
                    id="confirm-new-password"
                    label="Confirm new password"
                    error={errors.confirmPassword?.message}
                    register={form.register('confirmPassword')}
                />
                {serverError
                    ? <p role="alert" className="text-sm text-red-700">{serverError}</p>
                    : null}
                <button
                    type="submit"
                    disabled={resetConfirmation.isPending}
                    className="w-full rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                >
                    {resetConfirmation.isPending ? 'Changing password…' : 'Change password'}
                </button>
            </form>
        </>
    )
}

export default ResetPasswordForm
