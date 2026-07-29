'use client'

import { ApiError } from '@/api/errors'
import { useStaffInvitationConfirmation } from '@/hooks/useAuth'
import { passwordResetSchema, type PasswordResetFormValues } from '@/schemas/authSchema'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'sonner'

const TOKEN_STORAGE_KEY = 'jobslounge-staff-invitation-token'
const TOKEN_STORAGE_LIFETIME_MS = 48 * 60 * 60 * 1000

const PasswordInput = ({
    id,
    label,
    error,
    register,
}: {
    id: string
    label: string
    error?: string
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
                    className="w-full rounded-md border border-gray-300 px-3 py-3 pr-11 aria-invalid:border-red-600"
                    {...register}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    className="absolute inset-y-0 right-0 grid w-11 place-items-center text-gray-500"
                >
                    {visible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                </button>
            </div>
            {error ? <p id={errorId} className="mt-1 text-sm text-red-700">{error}</p> : null}
        </div>
    )
}

const readStoredToken = () => {
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

const AcceptStaffInvitationForm = () => {
    const [token, setToken] = useState('')
    const [ready, setReady] = useState(false)
    const [invalidLink, setInvalidLink] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const mutation = useStaffInvitationConfirmation()
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
            const activeToken = linkToken || readStoredToken()
            if (linkToken) {
                sessionStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify({
                    token: linkToken,
                    storedAt: Date.now(),
                }))
                window.history.replaceState(null, '', window.location.pathname)
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
            await mutation.mutateAsync({ token, password: values.password })
            sessionStorage.removeItem(TOKEN_STORAGE_KEY)
            toast.success('Your staff account is ready.')
            router.replace('/admin-center/login?invitation=accepted')
        } catch (error) {
            if (error instanceof ApiError && error.code === 'STAFF_INVITATION_INVALID') {
                sessionStorage.removeItem(TOKEN_STORAGE_KEY)
                setInvalidLink(true)
                setToken('')
                return
            }
            setServerError(error instanceof Error ? error.message : 'Unable to activate staff account.')
        }
    })

    if (!ready) return <p role="status">Checking your invitation…</p>
    if (invalidLink) {
        return (
            <div role="alert">
                <h1 className="text-2xl font-bold text-[#003B6D]">This invitation cannot be used</h1>
                <p className="mt-3 leading-7 text-gray-700">
                    It may be invalid, expired, superseded, or already used. Ask your Super administrator to send a new invitation.
                </p>
            </div>
        )
    }

    return (
        <>
            <h1 className="text-2xl font-bold text-[#003B6D]">Create your staff password</h1>
            <p className="mt-2 leading-7 text-gray-600">
                Use at least 8 characters. This activates your Jobs Lounge staff account.
            </p>
            <form onSubmit={submit} noValidate aria-busy={mutation.isPending} className="mt-6 space-y-5">
                <PasswordInput id="staff-password" label="Password" error={form.formState.errors.password?.message} register={form.register('password')} />
                <PasswordInput id="staff-confirm-password" label="Confirm password" error={form.formState.errors.confirmPassword?.message} register={form.register('confirmPassword')} />
                {serverError ? <p role="alert" className="text-sm text-red-700">{serverError}</p> : null}
                <button type="submit" disabled={mutation.isPending} className="w-full rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white disabled:opacity-60">
                    {mutation.isPending ? 'Activating account…' : 'Create password and continue'}
                </button>
            </form>
        </>
    )
}

export default AcceptStaffInvitationForm
