'use client'
import { useLogin } from "@/hooks/useAuth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
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
        const toastId = toast.loading('Logging in...')
        try {
            const data = await loginMutation.mutateAsync({
                email: authData.email,
                password: authData.password,
            })

            if (!['admin', 'recruiter', 'super-admin'].includes(data.role)) {
                toast.error('Access denied. Not an admin account.', { id: toastId })
                router.replace('/dashboard')
                return
            }


            toast.success('Success!', { id: toastId })
            router.replace(nextPath || '/admin-center')

        } catch (error) {
            toast.error(
                (error as Error).message || "Something went wrong",
                { id: toastId }
            )
        }
    };

    return (
        <div className="space-y-4">
            <Link href='/' aria-label="Jobs Lounge home"><Image width={70} height={70} src='/logo.svg' alt="" /></Link>
            <h1 id="admin-auth-title" className="text-[#003B6D] text-2xl font-bold">Jobs Lounge Admin Panel</h1>
            <p>Sign in to access the Jobs Lounge administration dashboard and manage the platform.</p>
            {passwordResetComplete
                ? (
                    <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                        Your password has been changed. Sign in with your new password.
                    </p>
                )
                : null}
            {invitationAccepted ? (
                <p role="status" className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                    Your staff account is ready. Sign in with the password you created.
                </p>
            ) : null}
            <form onSubmit={handleSubmit} aria-labelledby="admin-auth-title" aria-busy={loginMutation.isPending}>
                <label htmlFor="admin-email" className="flex flex-col">
                    Email Address
                    <input id="admin-email" required autoComplete="email" onChange={handleChange} name="email" className="my-2 rounded border border-gray-300 px-4 py-2 shadow-sm" type="email" />
                </label>
                <label htmlFor="admin-password" className="flex flex-col">
                    Password
                    <input id="admin-password" required autoComplete="current-password" onChange={handleChange} name="password" className="my-2 rounded border border-gray-300 px-4 py-2 shadow-sm" type="password" />
                </label>
                <div className="text-right">
                    <Link
                        href="/forgot-password?area=admin"
                        className="rounded text-sm font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
                    >
                        Forgot password?
                    </Link>
                </div>
                <button disabled={loginMutation.isPending} type="submit" className="w-full p-3 my-4 rounded cursor-pointer text-white bg-[#003B6D] disabled:cursor-wait disabled:opacity-70">{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</button>
            </form>
        </div>
    )
}

export default AdminAuthForm
