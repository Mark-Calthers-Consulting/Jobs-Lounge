'use client'
import { useLogin } from "@/hooks/useAuth"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { FiEye, FiEyeOff } from "react-icons/fi"
import { LuArrowRight, LuCircleCheck } from "react-icons/lu"
import { toast } from "sonner"

type formValues = {
    email: string,
    password: string,
}

const AdminAuthForm = ({
    nextPath,
    passwordResetComplete = false,
    invitationAccepted = false,
}: {
    nextPath?: string
    passwordResetComplete?: boolean
    invitationAccepted?: boolean
}) => {
    const [authData, setAuthData] = useState<formValues>({
        email: '',
        password: '',
    })
    const [passwordVisible, setPasswordVisible] = useState(false)
    const [serverError, setServerError] = useState<string | null>(null)

    const loginMutation = useLogin()

    const router = useRouter();
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuthData(prev => ({
            ...prev,
            [name]: value,
        }));
    }



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setServerError(null)
        const toastId = toast.loading('Logging in...')
        try {
            const data = await loginMutation.mutateAsync({
                email: authData.email,
                password: authData.password,
            })

            if (!['admin', 'recruiter', 'super-admin'].includes(data.role)) {
                const message = 'This account does not have access to the team workspace.'
                setServerError(message)
                toast.error(message, { id: toastId })
                router.replace('/dashboard')
                return
            }

            toast.success('Signed in.', { id: toastId })
            router.replace(nextPath || '/admin-center')

        } catch (error) {
            const message = (error as Error).message || 'Unable to sign in.'
            setServerError(message)
            toast.error(message, { id: toastId })
        }
    };

    return (
        <div>
            <h1 id="admin-auth-title" className="text-center text-[length:var(--text-heading)] font-semibold leading-[var(--leading-heading)] tracking-[-0.045em] text-[#10182b]">Team sign in</h1>
            <p className="mt-3 text-center text-[length:var(--text-body)] leading-[var(--leading-body)] text-slate-600">Enter your staff account details to continue.</p>
            {passwordResetComplete
                ? (
                    <p role="status" className="mt-6 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-900">
                        <LuCircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        Your password has been changed. Sign in with your new password.
                    </p>
                )
                : null}
            {invitationAccepted ? (
                <p role="status" className="mt-6 flex items-start gap-2.5 rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm leading-5 text-emerald-900">
                    <LuCircleCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                    Your staff account is ready. Sign in with the password you created.
                </p>
            ) : null}

            {serverError ? (
                <p role="alert" className="mt-6 rounded-md border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-5 text-red-800">
                    {serverError}
                </p>
            ) : null}

            <form className="mt-6 space-y-6" onSubmit={handleSubmit} aria-labelledby="admin-auth-title" aria-busy={loginMutation.isPending}>
                <div>
                    <label htmlFor="admin-email" className="block text-[length:var(--text-secondary)] font-semibold text-slate-800">Email address</label>
                    <input
                        id="admin-email"
                        required
                        autoComplete="email"
                        onChange={handleChange}
                        name="email"
                        value={authData.email}
                        className="mt-2 min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 text-base text-slate-950 placeholder:text-slate-400 focus:border-[#003B6D] focus:outline-none focus:ring-2 focus:ring-[#003B6D]/15"
                        placeholder="name@company.com"
                        type="email"
                    />
                </div>
                <div>
                    <div className="flex items-center justify-between gap-4">
                        <label htmlFor="admin-password" className="block text-[length:var(--text-secondary)] font-semibold text-slate-800">Password</label>
                        <Link
                            href="/forgot-password?area=admin"
                            className="text-[length:var(--text-secondary)] font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <div className="relative mt-2">
                        <input
                            id="admin-password"
                            required
                            autoComplete="current-password"
                            onChange={handleChange}
                            name="password"
                            value={authData.password}
                            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-3.5 pr-12 text-base text-slate-950 focus:border-[#003B6D] focus:outline-none focus:ring-2 focus:ring-[#003B6D]/15"
                            type={passwordVisible ? 'text' : 'password'}
                        />
                        <button
                            type="button"
                            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                            aria-pressed={passwordVisible}
                            onClick={() => setPasswordVisible((current) => !current)}
                            className="absolute inset-y-0 right-0 flex w-12 items-center justify-center rounded-r-lg text-slate-500 transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003B6D]"
                        >
                            {passwordVisible ? <FiEyeOff aria-hidden="true" /> : <FiEye aria-hidden="true" />}
                        </button>
                    </div>
                </div>
                <button
                    disabled={loginMutation.isPending}
                    type="submit"
                    className="flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#101a35] px-4 text-[length:var(--text-secondary)] font-semibold text-white transition-colors duration-200 ease-out hover:bg-[#172447] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#101a35] focus-visible:ring-offset-2 active:translate-y-px disabled:cursor-wait disabled:opacity-65"
                >
                    {loginMutation.isPending ? 'Signing in…' : (
                        <>Sign in <LuArrowRight aria-hidden="true" className="size-4" /></>
                    )}
                </button>
            </form>
        </div>
    )
}

export default AdminAuthForm
