'use client'
import { useLogin, useRegister } from "@/hooks/useAuth"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type formMode = 'login' | 'register'
type formValues = {
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    telephone: string
}

const AuthForm = ({ nextPath }: { nextPath?: string }) => {
    const [mode, setMode] = useState<formMode>('login')
    const [authData, setAuthData] = useState<formValues>({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        telephone: ''
    })

    const loginMutation = useLogin()
    const registerMutation = useRegister()

    const router = useRouter();

    const changeMode = () => {
        if (mode === 'login') {
            setMode('register')
        } else {
            setMode('login')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setAuthData(prev => ({
            ...prev,
            [name]: value,
        }));
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const toastId = toast.loading(
            mode === 'login' ? 'Logging in...' : 'Creating account...'
        )
        try {
            let userData
            if (mode === 'login') {
                userData = await loginMutation.mutateAsync({
                    email: authData.email,
                    password: authData.password,
                })
            } else {
                userData = await registerMutation.mutateAsync(
                    authData
                )
            }

            toast.success('Success!', { id: toastId })

            if (mode === "register" || userData.role === 'user') {
                router.replace(nextPath || '/dashboard')
            } else {
                router.replace('/admin-center')
            }


        } catch (error) {
            toast.error(
                (error as Error).message || "Something went wrong",
                { id: toastId }
            )
        }
    };

    return (
        <div className="space-y-3">
            <Link href='/' aria-label="Jobs Lounge home" className="sm:hidden"><Image className="mb-3" width={50} height={50} src='/logo.svg' alt="" /></Link>
            {mode === 'login'
                ?
                <>
                    <h1 id="auth-title" className="text-[#003B6D] text-2xl md:text-3xl font-bold">Sign in to Jobs Lounge</h1>
                    <p className="text-gray-600 text-sm md:text-base">Access your account to continue your journey, whether you&apos;re exploring new job opportunities or managing your hiring process.</p>
                </>
                :
                <>
                    <h1 id="auth-title" className="text-[#003B6D] text-2xl md:text-3xl font-bold">Create a Jobs Lounge account</h1>
                    <p className="text-gray-600 text-sm md:text-base">Create your account to begin your journey with Jobs Lounge, whether you&apos;re searching for the perfect job or hiring top talent.</p>
                </>

            }
            {
                mode === 'login' ?
                    <form onSubmit={handleSubmit} aria-labelledby="auth-title" aria-busy={loginMutation.isPending}>
                        <label htmlFor="login-email" className="flex flex-col">
                            Email Address
                            <input id="login-email" required autoComplete="email" onChange={handleChange} name="email" className="px-4 py-2 my-2 ring-1 ring-gray-300 rounded" type="email" />
                        </label>
                        <label htmlFor="login-password" className="flex flex-col">
                            Password
                            <input id="login-password" required autoComplete="current-password" onChange={handleChange} name="password" className="px-4 py-2 my-2 ring-1 ring-gray-300 rounded" type="password" />
                        </label>
                        <button disabled={loginMutation.isPending} type="submit" className="w-full p-3 my-3 rounded cursor-pointer text-white bg-[#003B6D] disabled:cursor-wait disabled:opacity-70">{loginMutation.isPending ? 'Signing in…' : 'Sign in'}</button>
                    </form>
                    :
                    <form onSubmit={handleSubmit} aria-labelledby="auth-title" aria-busy={registerMutation.isPending}>
                        <div className="flex gap-2 flex-col lg:flex-row">
                            <div className="flex-1 min-w-0 flex flex-col">
                                <label htmlFor="register-first-name">First Name</label>
                                <input id="register-first-name" required autoComplete="given-name" onChange={handleChange} type="text" name="firstName" className="py-2 px-3 my-2 ring-1 ring-gray-300 rounded" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <label htmlFor="register-last-name">Last Name</label>
                                <input id="register-last-name" required autoComplete="family-name" onChange={handleChange} type="text" name="lastName" className="py-2 px-3 my-2 ring-1 ring-gray-300 rounded" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="register-telephone">Phone Number</label>
                            <input id="register-telephone" required autoComplete="tel" onChange={handleChange} type="tel" name="telephone" className="py-2 px-3 my-2 ring-1 ring-gray-300 rounded" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="register-email">Email Address</label>
                            <input id="register-email" required autoComplete="email" onChange={handleChange} className="py-2 px-3 my-2 ring-1 ring-gray-300 rounded" type="email" name="email" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="register-password">
                                Password
                            </label>
                            <input id="register-password" required minLength={6} autoComplete="new-password" onChange={handleChange} className="py-2 px-3 my-2 ring-1 ring-gray-300 rounded" type="password" name="password" aria-describedby="password-requirements" />
                            <p id="password-requirements" className="mb-2 text-sm text-gray-600">Use at least 6 characters.</p>
                        </div>
                        <button disabled={registerMutation.isPending} type="submit" className="w-full p-2 cursor-pointer text-white bg-[#003B6D] disabled:cursor-wait disabled:opacity-70">{registerMutation.isPending ? 'Creating account…' : 'Sign up'}</button>
                    </form>
            }

            {
                mode === 'login'
                    ? <p className="text-center mt-4">Don’t have an account? <button type="button" onClick={changeMode} className="underline cursor-pointer font-medium">Sign up</button></p>
                    : <p className="text-center mt-4">Already have an account? <button type="button" onClick={changeMode} className="underline cursor-pointer font-medium">Sign in</button></p>
            }

        </div>
    )
}

export default AuthForm
