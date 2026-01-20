'use client'
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

type formMode = 'login' | 'register'
type formValues = {
    email: string,
    password: string,
    name?: string
}

const AuthForm: React.FC = () => {
    const [mode, setMode] = useState<formMode>('login')
    const [authData, setAuthData] = useState<formValues>({
        email: '',
        password: '',
        name: ''
    })

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
        console.log(name, value)
        setAuthData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const login = async (loginData: formValues) => {
        const toastId = toast.loading('Logging in...');
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            })
            const result = await res.json()
            console.log(result)

            if (!res.ok) {
                throw new Error(result.message || 'Request failed');
            }
            toast.success('Login successful', { id: toastId });
            router.replace('/dashboard')
        } catch (error) {
            console.log(error)
            toast.error((error as Error).message || 'Something went wrong', { id: toastId });
        }
    }


    const register = async (authData: formValues) => {
        const toastId = toast.loading('Logging in...');
        try {

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(authData)
            })
            const result = await res.json()
            console.log(result)
            if (!res.ok) {
                throw new Error(result.message || 'Request failed');
            }
            toast.success('Login successful', { id: toastId });
            router.replace('/dashboard')
        } catch (error) {
            console.log(error)
            toast.error((error as Error).message || 'Something went wrong', { id: toastId });
        }
    }


    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (mode === 'login') {
            const loginData = {
                email: authData.email,
                password: authData.password,
            };
            login(loginData);
        } else {
            register(authData);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-[#003B6D] text-3xl font-bold">Welcome to Jobs Lounge</h2>
            <p>Create your account to begin your journey with Jobs Lounge, whether you're searching for the perfect job or hiring top talent.</p>
            {
                mode === 'login' ?
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="" className="flex flex-col">
                            Email Address
                            <input onChange={handleChange} name="email" className="p-2 my-2 shadow rounded outline-none" type="email" placeholder="E-mail" />
                        </label>
                        <label htmlFor="" className="flex flex-col">
                            Password
                            <input onChange={handleChange} name="password" className="p-2 my-2 shadow rounded outline-none" type="password" placeholder="Password" />
                        </label>
                        <button type="submit" className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
                    </form>
                    :
                    <form onSubmit={handleSubmit}>
                        <div className="flex flex-col">
                            <label htmlFor="">Name</label>
                            <input onChange={handleChange} type="text" name="name" className="py-2 px-3 my-2 shadow rounded outline-none" placeholder="Full Name" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">Email Address</label>
                            <input onChange={handleChange} className="py-2 px-3 my-2 shadow rounded outline-none" type="email" name="email" placeholder="E-mail" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">
                                Password
                            </label>
                            <input onChange={handleChange} className="py-2 px-3 my-2 shadow rounded outline-none" type="password" name="password" placeholder="E-mail" />
                        </div>
                        <button type="submit" className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN UP</button>
                    </form>
            }

            {
                mode === 'login'
                    ? <p className="text-center my-4">Don’t have an account? <span onClick={changeMode} className="underline cursor-pointer">Sign up</span> </p>
                    : <p className="text-center my-4">Already have an account? <span onClick={changeMode} className="underline cursor-pointer">Sign In</span> </p>
            }

        </div>
    )
}

export default AuthForm
