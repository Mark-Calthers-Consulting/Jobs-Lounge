'use client'
import { useLogin, useRegister } from "@/hooks/useAuth"
import { register } from "module"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type formMode = 'login' | 'register'
type formValues = {
    email: string,
    password: string,
    firstName: '',
    lastName: '',
    telephone?: string
}

const AuthForm: React.FC = () => {
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
                router.replace('/dashboard')
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
            <Link href='/' className=" sm:hidden"><Image className="mb-3" width={50} height={50} src='/logo.svg' alt='logo' /></Link>
            {mode === 'login'
                ?
                <>
                    <h2 className="text-[#003B6D] text-2xl md:text-3xl font-bold">Sign in to Jobs Lounge</h2>
                    <p className="text-[#797979] text-sm md:text-base">Access your account to continue your journey, whether you're exploring new job opportunities or managing your hiring process.</p>
                </>
                :
                <>
                    <h2 className="text-[#003B6D] text-2xl md:text-3xl font-bold">Welcome to Jobs Lounge</h2>
                    <p className="text-[#797979] text-sm md:text-base">Create your account to begin your journey with Jobs Lounge, whether you're searching for the perfect job or hiring top talent.</p>
                </>

            }
            {
                mode === 'login' ?
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="" className="flex flex-col">
                            Email Address
                            <input onChange={handleChange} name="email" className="px-4 py-2 my-2 ring-1 ring-gray-200   rounded outline-none" type="email" placeholder="E-mail" />
                        </label>
                        <label htmlFor="" className="flex flex-col">
                            Password
                            <input onChange={handleChange} name="password" className="px-4 py-2 my-2 ring-1 ring-gray-200  rounded outline-none" type="password" placeholder="Password" />
                        </label>
                        <button type="submit" className="w-full p-3 my-3 rounded cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
                    </form>
                    :
                    <form onSubmit={handleSubmit}>
                        {/* <div className="flex flex-col">
                            <label htmlFor="">Name</label>
                            <input onChange={handleChange} type="text" name="name" className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" placeholder="Full Name" />
                        </div> */}
                        <div className="flex gap-2 flex-col lg:flex-row">
                            <div className="flex-1 min-w-0 flex flex-col">
                                <label htmlFor="">First Name</label>
                                <input onChange={handleChange} type="text" name="firstName" className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" placeholder="First Name" />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col">
                                <label htmlFor="">Last Name</label>
                                <input onChange={handleChange} type="text" name="lastName" className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" placeholder="Last Name" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="">Phone Number</label>
                            <input onChange={handleChange} type="text" name="telephone" className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" placeholder="Phone Number" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">Email Address</label>
                            <input onChange={handleChange} className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" type="email" name="email" placeholder="E-mail" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">
                                Password
                            </label>
                            <input onChange={handleChange} className="py-2 px-3 my-2 ring-1 ring-gray-200 rounded outline-none" type="password" name="password" placeholder="Password" />
                        </div>
                        <button type="submit" className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN UP</button>
                    </form>
            }

            {
                mode === 'login'
                    ? <p className="text-center mt-4">Don’t have an account? <span onClick={changeMode} className="underline cursor-pointer">Sign up</span> </p>
                    : <p className="text-center mt-4">Already have an account? <span onClick={changeMode} className="underline cursor-pointer">Sign In</span> </p>
            }

        </div>
    )
}

export default AuthForm
