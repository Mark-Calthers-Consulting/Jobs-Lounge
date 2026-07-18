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
    name?: string,
    phoneNumber?: string
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
            <Link href='/'><Image width={70} height={70} src='/logo.svg' alt='logo' /></Link>
            <h2 className="text-[#003B6D] text-2xl font-bold">Jobs Lounge Admin Panel</h2>
            <p>Sign in to access the Jobs Lounge administration dashboard and manage the platform.</p>
            <form onSubmit={handleSubmit}>
                <label htmlFor="" className="flex flex-col">
                    Email Address
                    <input onChange={handleChange} name="email" className="px-4 py-2 my-2 ring-1 ring-gray-100 shadow  rounded outline-none" type="email" placeholder="E-mail" />
                </label>
                <label htmlFor="" className="flex flex-col">
                    Password
                    <input onChange={handleChange} name="password" className="px-4 py-2 my-2 ring-1 ring-gray-100 shadow rounded outline-none" type="password" placeholder="Password" />
                </label>
                <button type="submit" className="w-full p-3 my-4 rounded cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
            </form>
        </div>
    )
}

export default AdminAuthForm
