'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

import { usePasswordResetRequest } from '@/hooks/useAuth'
import {
    ForgotPasswordFormInput,
    ForgotPasswordFormValues,
    forgotPasswordSchema,
} from '@/schemas/authSchema'

const ForgotPasswordForm = () => {
    const [confirmation, setConfirmation] = useState<string | null>(null)
    const [serverError, setServerError] = useState<string | null>(null)
    const resetRequest = usePasswordResetRequest()
    const form = useForm<ForgotPasswordFormInput, unknown, ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const submit = form.handleSubmit(async (values) => {
        setServerError(null)
        try {
            const message = await resetRequest.mutateAsync(values)
            setConfirmation(message)
        } catch (error) {
            setServerError(error instanceof Error
                ? error.message
                : 'Unable to request password reset instructions.')
        }
    })

    if (confirmation) {
        return (
            <div role="status" aria-live="polite">
                <h1 className="text-2xl font-bold text-[#003B6D]">Check your email</h1>
                <p className="mt-3 leading-7 text-gray-700">{confirmation}</p>
                <p className="mt-3 text-sm leading-6 text-gray-600">
                    Delivery may take a few minutes. Only the newest reset link will work.
                </p>
                <button
                    type="button"
                    onClick={() => {
                        setConfirmation(null)
                        resetRequest.reset()
                        form.setFocus('email')
                    }}
                    className="mt-5 rounded text-sm font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
                >
                    Try another email address
                </button>
            </div>
        )
    }

    const emailError = form.formState.errors.email?.message
    return (
        <>
            <h1 className="text-2xl font-bold text-[#003B6D]">Forgot your password?</h1>
            <p className="mt-2 leading-7 text-gray-600">
                Enter your account email and we&apos;ll send instructions if an account exists.
            </p>
            <form onSubmit={submit} noValidate aria-busy={resetRequest.isPending} className="mt-6 space-y-5">
                <div>
                    <label htmlFor="password-reset-email" className="font-medium text-gray-900">
                        Email address
                    </label>
                    <input
                        id="password-reset-email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={Boolean(emailError)}
                        aria-describedby={emailError ? 'password-reset-email-error' : undefined}
                        className="mt-2 w-full rounded-md px-3 py-3 ring-1 ring-gray-300 focus:outline-none focus:ring-2 focus:ring-[#003B6D] aria-invalid:ring-2 aria-invalid:ring-red-600"
                        {...form.register('email')}
                    />
                    {emailError
                        ? <p id="password-reset-email-error" className="mt-1 text-sm text-red-700">{emailError}</p>
                        : null}
                </div>
                {serverError
                    ? <p role="alert" className="text-sm text-red-700">{serverError}</p>
                    : null}
                <button
                    type="submit"
                    disabled={resetRequest.isPending}
                    className="w-full rounded-md bg-[#003B6D] px-4 py-3 font-semibold text-white disabled:cursor-wait disabled:opacity-70"
                >
                    {resetRequest.isPending ? 'Sending instructions…' : 'Send reset instructions'}
                </button>
            </form>
        </>
    )
}

export default ForgotPasswordForm
