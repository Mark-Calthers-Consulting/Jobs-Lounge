'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useState } from 'react'
import { useForm, type UseFormRegisterReturn } from 'react-hook-form'
import { FiArrowLeft, FiCheckCircle, FiEye, FiEyeOff, FiLock } from 'react-icons/fi'
import { toast } from 'sonner'

import { ApiError } from '@/api/errors'
import { usePasswordChange } from '@/hooks/useAuth'
import {
    passwordChangeSchema,
    type PasswordChangeFormValues,
} from '@/schemas/authSchema'

const PasswordField = ({
    autoComplete,
    error,
    id,
    label,
    register,
}: {
    autoComplete: 'current-password' | 'new-password'
    error?: string
    id: string
    label: string
    register: UseFormRegisterReturn
}) => {
    const [visible, setVisible] = useState(false)
    const errorId = `${id}-error`

    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-gray-900">{label}</label>
            <div className="relative mt-2">
                <input
                    id={id}
                    type={visible ? 'text' : 'password'}
                    autoComplete={autoComplete}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-3 pr-11 text-gray-950 outline-none transition focus:border-[#184aa2] aria-invalid:border-red-600"
                    {...register}
                />
                <button
                    type="button"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    aria-pressed={visible}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-gray-500 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#184aa2]"
                >
                    {visible
                        ? <FiEyeOff aria-hidden="true" className="size-[18px]" />
                        : <FiEye aria-hidden="true" className="size-[18px]" />}
                </button>
            </div>
            {error ? <p id={errorId} role="alert" className="mt-1 text-sm text-red-700">{error}</p> : null}
        </div>
    )
}

const ChangePasswordForm = ({
    area,
    backHref,
}: {
    area: 'candidate' | 'admin'
    backHref: string
}) => {
    const changePassword = usePasswordChange()
    const [message, setMessage] = useState('')
    const [serverError, setServerError] = useState('')
    const form = useForm<PasswordChangeFormValues>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const submit = form.handleSubmit(async (values) => {
        setMessage('')
        setServerError('')
        try {
            const result = await changePassword.mutateAsync({
                currentPassword: values.currentPassword,
                newPassword: values.password,
            })
            form.reset()
            setMessage(result)
            toast.success('Password changed successfully')
        } catch (error) {
            if (error instanceof ApiError && error.code === 'CURRENT_PASSWORD_INCORRECT') {
                form.setError('currentPassword', { message: error.message })
                form.setFocus('currentPassword')
                return
            }
            if (error instanceof ApiError && error.code === 'PASSWORD_UNCHANGED') {
                form.setError('password', { message: error.message })
                form.setFocus('password')
                return
            }
            setServerError(error instanceof Error ? error.message : 'Unable to change password.')
        }
    })
    const errors = form.formState.errors

    return (
        <div className="mx-auto max-w-2xl">
            <Link
                href={backHref}
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#184aa2] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
            >
                <FiArrowLeft aria-hidden="true" />Back to settings
            </Link>

            <header className="mt-6">
                <span aria-hidden="true" className="grid size-11 place-items-center rounded-lg bg-blue-50 text-[#184aa2]">
                    <FiLock size={20} />
                </span>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-950">Change your password</h1>
                <p className="mt-2 max-w-xl leading-7 text-gray-600">
                    Enter your current password, then choose a new password with at least 8 characters.
                </p>
            </header>

            <section className="mt-7 rounded-xl border border-gray-200 bg-white p-5 sm:p-7">
                {message ? (
                    <div role="status" className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                        <FiCheckCircle aria-hidden="true" className="mt-0.5 shrink-0" />
                        <p>{message}</p>
                    </div>
                ) : null}

                <form onSubmit={submit} noValidate aria-busy={changePassword.isPending} className="space-y-5">
                    <PasswordField
                        id="current-password"
                        label="Current password"
                        autoComplete="current-password"
                        error={errors.currentPassword?.message}
                        register={form.register('currentPassword')}
                    />
                    <div className="border-t border-gray-100 pt-5">
                        <PasswordField
                            id="new-password"
                            label="New password"
                            autoComplete="new-password"
                            error={errors.password?.message}
                            register={form.register('password')}
                        />
                    </div>
                    <PasswordField
                        id="confirm-new-password"
                        label="Confirm new password"
                        autoComplete="new-password"
                        error={errors.confirmPassword?.message}
                        register={form.register('confirmPassword')}
                    />

                    {serverError ? <p role="alert" className="text-sm text-red-700">{serverError}</p> : null}

                    <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={`/forgot-password?area=${area}`}
                            className="text-sm font-semibold text-[#184aa2] hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                        >
                            Forgot your current password?
                        </Link>
                        <button
                            type="submit"
                            disabled={changePassword.isPending}
                            className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#003B6D] px-5 text-sm font-semibold text-white transition hover:bg-[#002f57] disabled:cursor-wait disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
                        >
                            {changePassword.isPending ? 'Changing password…' : 'Change password'}
                        </button>
                    </div>
                </form>
            </section>

            <p className="mt-4 text-sm leading-6 text-gray-600">
                After the change, this browser stays signed in and your other signed-in sessions are invalidated.
            </p>
        </div>
    )
}

export default ChangePasswordForm
