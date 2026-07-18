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

const AdminAuthForm = ({ nextPath }: { nextPath?: string }) => {
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

            if (data.role !== 'admin' && data.role !== 'super-admin') {
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
            <form onSubmit={handleSubmit} aria-labelledby="admin-auth-title" aria-busy={loginMutation.isPending}>
                <label htmlFor="admin-email" className="flex flex-col">
                    Email Address
                    <input id="admin-email" required autoComplete="email" onChange={handleChange} name="email" className="px-4 py-2 my-2 ring-1 ring-gray-300 shadow rounded" type="email" />
                </label>
                <label htmlFor="admin-password" className="flex flex-col">
                    Password
                    <input id="admin-password" required autoComplete="current-password" onChange={handleChange} name="password" className="px-4 py-2 my-2 ring-1 ring-gray-300 shadow rounded" type="password" />
                </label>
                <button disabled={loginMutation.isPending} type="submit" className="w-full p-3 my-4 rounded cursor-pointer text-white bg-[#003B6D] disabled:cursor-wait disabled:opacity-70">{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</button>
            </form>
        </div>
    )
}

export default AdminAuthForm
