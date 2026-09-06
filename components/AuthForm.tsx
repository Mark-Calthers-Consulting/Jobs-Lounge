'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { toast } from 'sonner'

import { useLogin, useRegister } from '@/hooks/useAuth'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { ApiError } from '@/api/errors'
import {
    LoginFormValues,
    loginSchema,
    RegistrationFormInput,
    RegistrationFormValues,
    registrationSchema,
} from '@/schemas/authSchema'

type FormMode = 'login' | 'register'

const inputClassName = 'mt-2 rounded border border-gray-300 px-3 py-2 aria-invalid:border-red-600 focus:outline-none'
const errorClassName = 'mt-1 text-sm text-red-700'
const registrationFieldMessages = {
    firstName: 'Check your first name.',
    lastName: 'Check your last name.',
    telephone: 'Enter 7 to 15 digits, optionally beginning with +.',
    email: 'Enter a valid email address.',
    password: 'Use at least 8 characters.',
} as const

const FieldError = ({ id, message }: { id: string, message?: string }) => message
    ? <p id={id} className={errorClassName}>{message}</p>
    : null

const PasswordVisibilityButton = ({
    visible,
    onToggle,
}: {
    visible: boolean,
    onToggle: () => void,
}) => (
    <button
        type="button"
        onClick={onToggle}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r text-gray-500 transition-colors hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003B6D]"
    >
        {visible
            ? <FiEyeOff aria-hidden="true" className="size-[18px]" />
            : <FiEye aria-hidden="true" className="size-[18px]" />}
    </button>
)

const AuthForm = ({
    nextPath,
    passwordResetComplete = false,
    initialMode = 'login',
}: {
    nextPath?: string
    passwordResetComplete?: boolean
    initialMode?: FormMode
}) => {
    const [mode, setMode] = useState<FormMode>(initialMode)
    const [loginPasswordVisible, setLoginPasswordVisible] = useState(false)
    const [registerPasswordVisible, setRegisterPasswordVisible] = useState(false)
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)
    const loginMutation = useLogin()
    const registerMutation = useRegister()
    const router = useRouter()
    const { candidateRegistrationEnabled } = usePlatformSettings()

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '' },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })
    const registerForm = useForm<RegistrationFormInput, unknown, RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            telephone: '',
            email: '',
            password: '',
            confirmPassword: '',
        },
        mode: 'onSubmit',
        reValidateMode: 'onChange',
    })

    const changeMode = () => {
        setMode((current) => current === 'login' ? 'register' : 'login')
        loginForm.reset()
        registerForm.reset()
        loginMutation.reset()
        registerMutation.reset()
        setLoginPasswordVisible(false)
        setRegisterPasswordVisible(false)
        setConfirmPasswordVisible(false)
        setServerError(null)
    }

    const submitLogin = loginForm.handleSubmit(async (values) => {
        setServerError(null)
        const toastId = toast.loading('Logging in...')
        try {
            const user = await loginMutation.mutateAsync(values)
            toast.success('Signed in.', { id: toastId })
            router.replace(user.role === 'user' ? (nextPath || '/dashboard') : '/admin-center')
        } catch (error) {
            const message = (error as Error).message || 'Unable to sign in.'
            setServerError(message)
            toast.error(message, { id: toastId })
        }
    })

    const submitRegistration = registerForm.handleSubmit(async (values) => {
        setServerError(null)
        const toastId = toast.loading('Creating account...')
        try {
            await registerMutation.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                telephone: values.telephone,
                email: values.email,
                password: values.password,
            })
            registerForm.reset()
            toast.success('Account created.', { id: toastId })
            router.replace(nextPath || '/dashboard')
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to create account.'
            let handledInline = false
            if (error instanceof ApiError && error.code === 'EMAIL_ALREADY_REGISTERED') {
                registerForm.setError('email', { type: 'server', message }, { shouldFocus: true })
                setServerError(null)
                handledInline = true
            } else if (
                error instanceof ApiError
                && error.code === 'INVALID_REGISTRATION'
                && typeof error.details === 'object'
                && error.details !== null
                && 'fields' in error.details
                && Array.isArray(error.details.fields)
            ) {
                let mappedFieldCount = 0
                for (const field of error.details.fields) {
                    if (typeof field === 'string' && field in registrationFieldMessages) {
                        const typedField = field as keyof typeof registrationFieldMessages
                        registerForm.setError(typedField, {
                            type: 'server',
                            message: registrationFieldMessages[typedField],
                        })
                        mappedFieldCount += 1
                    }
                }
                setServerError(mappedFieldCount > 0 ? null : message)
                handledInline = mappedFieldCount > 0
            } else {
                setServerError(message)
            }
            if (handledInline) toast.dismiss(toastId)
            else toast.error(message, { id: toastId })
        }
    })

    const loginErrors = loginForm.formState.errors
    const registerErrors = registerForm.formState.errors

    return (
        <div className="space-y-3">
            <Link href="/" aria-label="Jobs Lounge home" className="sm:hidden">
                <Image className="mb-3" width={50} height={50} src="/logo.svg" alt="" />
            </Link>

            <h1 id="auth-title" className="text-2xl font-bold text-[#003B6D] md:text-3xl">
                {mode === 'login'
                    ? 'Sign in to Jobs Lounge'
                    : candidateRegistrationEnabled
                        ? 'Create a Jobs Lounge account'
                        : 'Candidate registration is paused'}
            </h1>
            <p className="text-sm text-gray-600 md:text-base">
                {mode === 'login'
                    ? 'Access your account and continue your job search.'
                    : candidateRegistrationEnabled
                        ? 'Create your account to start applying for opportunities.'
                        : 'We are not accepting new candidate accounts at the moment. Existing candidates can still sign in.'}
            </p>
            {passwordResetComplete && mode === 'login'
                ? (
                    <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                        Your password has been changed. Sign in with your new password.
                    </p>
                )
                : null}

            {mode === 'login' ? (
                <form onSubmit={submitLogin} onChange={() => setServerError(null)} aria-labelledby="auth-title" aria-busy={loginMutation.isPending} noValidate className="space-y-3">
                    <div className="flex flex-col">
                        <label htmlFor="login-email">Email address</label>
                        <input
                            id="login-email"
                            autoComplete="email"
                            type="email"
                            className={inputClassName}
                            aria-invalid={Boolean(loginErrors.email)}
                            aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
                            {...loginForm.register('email')}
                        />
                        <FieldError id="login-email-error" message={loginErrors.email?.message} />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="login-password">Password</label>
                        <div className="relative mt-2">
                            <input
                                id="login-password"
                                autoComplete="current-password"
                                type={loginPasswordVisible ? 'text' : 'password'}
                                className={`${inputClassName} mt-0 w-full pr-11`}
                                aria-invalid={Boolean(loginErrors.password)}
                                aria-describedby={loginErrors.password ? 'login-password-error' : undefined}
                                {...loginForm.register('password')}
                            />
                            <PasswordVisibilityButton
                                visible={loginPasswordVisible}
                                onToggle={() => setLoginPasswordVisible((visible) => !visible)}
                            />
                        </div>
                        <FieldError id="login-password-error" message={loginErrors.password?.message} />
                        {serverError ? <p role="alert" className={errorClassName}>{serverError}</p> : null}
                        <Link
                            href="/forgot-password?area=candidate"
                            className="mt-2 self-end rounded text-sm font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
                        >
                            Forgot password?
                        </Link>
                    </div>

                    <button disabled={loginMutation.isPending} type="submit" className="my-3 w-full cursor-pointer rounded bg-[#003B6D] p-3 text-white disabled:cursor-wait disabled:opacity-70">
                        {loginMutation.isPending ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
            ) : candidateRegistrationEnabled ? (
                <form onSubmit={submitRegistration} onChange={() => setServerError(null)} aria-labelledby="auth-title" aria-busy={registerMutation.isPending} noValidate className="space-y-3">
                    {serverError ? <p role="alert" className={errorClassName}>{serverError}</p> : null}
                    <div className="flex flex-col gap-3 lg:flex-row">
                        <div className="flex min-w-0 flex-1 flex-col">
                            <label htmlFor="register-first-name">First name</label>
                            <input
                                id="register-first-name"
                                autoComplete="given-name"
                                type="text"
                                className={inputClassName}
                                aria-invalid={Boolean(registerErrors.firstName)}
                                aria-describedby={registerErrors.firstName ? 'register-first-name-error' : undefined}
                                {...registerForm.register('firstName')}
                            />
                            <FieldError id="register-first-name-error" message={registerErrors.firstName?.message} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col">
                            <label htmlFor="register-last-name">Last name</label>
                            <input
                                id="register-last-name"
                                autoComplete="family-name"
                                type="text"
                                className={inputClassName}
                                aria-invalid={Boolean(registerErrors.lastName)}
                                aria-describedby={registerErrors.lastName ? 'register-last-name-error' : undefined}
                                {...registerForm.register('lastName')}
                            />
                            <FieldError id="register-last-name-error" message={registerErrors.lastName?.message} />
                        </div>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="register-telephone">Phone number</label>
                        <input
                            id="register-telephone"
                            autoComplete="tel"
                            inputMode="tel"
                            type="tel"
                            placeholder="e.g. +234 801 234 5678"
                            className={inputClassName}
                            aria-invalid={Boolean(registerErrors.telephone)}
                            aria-describedby={registerErrors.telephone ? 'register-telephone-error register-telephone-help' : 'register-telephone-help'}
                            {...registerForm.register('telephone')}
                        />
                        <p id="register-telephone-help" className="mt-1 text-sm text-gray-600">Include your country code when using an international number.</p>
                        <FieldError id="register-telephone-error" message={registerErrors.telephone?.message} />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="register-email">Email address</label>
                        <input
                            id="register-email"
                            autoComplete="email"
                            type="email"
                            className={inputClassName}
                            aria-invalid={Boolean(registerErrors.email)}
                            aria-describedby={registerErrors.email ? 'register-email-error' : undefined}
                            {...registerForm.register('email')}
                        />
                        <FieldError id="register-email-error" message={registerErrors.email?.message} />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="register-password">Password</label>
                        <div className="relative mt-2">
                            <input
                                id="register-password"
                                autoComplete="new-password"
                                type={registerPasswordVisible ? 'text' : 'password'}
                                className={`${inputClassName} mt-0 w-full pr-11`}
                                aria-invalid={Boolean(registerErrors.password)}
                                aria-describedby={registerErrors.password ? 'register-password-error register-password-help' : 'register-password-help'}
                                {...registerForm.register('password')}
                            />
                            <PasswordVisibilityButton
                                visible={registerPasswordVisible}
                                onToggle={() => setRegisterPasswordVisible((visible) => !visible)}
                            />
                        </div>
                        <p id="register-password-help" className="mt-1 text-sm text-gray-600">Use at least 8 characters.</p>
                        <FieldError id="register-password-error" message={registerErrors.password?.message} />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="register-confirm-password">Confirm password</label>
                        <div className="relative mt-2">
                            <input
                                id="register-confirm-password"
                                autoComplete="new-password"
                                type={confirmPasswordVisible ? 'text' : 'password'}
                                className={`${inputClassName} mt-0 w-full pr-11`}
                                aria-invalid={Boolean(registerErrors.confirmPassword)}
                                aria-describedby={registerErrors.confirmPassword ? 'register-confirm-password-error' : undefined}
                                {...registerForm.register('confirmPassword')}
                            />
                            <PasswordVisibilityButton
                                visible={confirmPasswordVisible}
                                onToggle={() => setConfirmPasswordVisible((visible) => !visible)}
                            />
                        </div>
                        <FieldError id="register-confirm-password-error" message={registerErrors.confirmPassword?.message} />
                    </div>

                    <button disabled={registerMutation.isPending} type="submit" className="w-full cursor-pointer rounded bg-[#003B6D] p-3 text-white disabled:cursor-wait disabled:opacity-70">
                        {registerMutation.isPending ? 'Creating account…' : 'Sign up'}
                    </button>
                </form>
            ) : (
                <div role="status" className="border-l-2 border-amber-500 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                    Please check back later or sign in if you already have an account.
                </div>
            )}

            <p className="mt-4 text-center">
                {mode === 'login' && !candidateRegistrationEnabled
                    ? 'New candidate registration is temporarily unavailable.'
                    : (
                        <>
                            {mode === 'login' ? 'Don’t have an account? ' : 'Already have an account? '}
                            <button type="button" onClick={changeMode} className="cursor-pointer font-medium underline">
                                {mode === 'login' ? 'Sign up' : 'Sign in'}
                            </button>
                        </>
                    )}
            </p>
        </div>
    )
}

export default AuthForm
