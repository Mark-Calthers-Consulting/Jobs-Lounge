'use client'
import { useState } from "react"

type formMode = 'login' | 'register'
type formValues = {
    email: string,
    password: string,
    fullName: string
}

const AuthForm: React.FC = () => {
    const [mode, setMode] = useState<formMode>('login')
    const [data, setData] = useState<object>({
        email: ''
    })

    const changeMode = () => {
        if (mode === 'login') {
            setMode('register')
        } else {
            setMode('login')
        }
    }
    return (
        <div className="space-y-6">
            <h2 className="text-[#003B6D] text-3xl font-bold">Welcome to Jobs Lounge</h2>
            <p>Create your account to begin your journey with Jobs Lounge, whether you're searching for the perfect job or hiring top talent.</p>
            {
                mode === 'login' ?
                    <form >
                        <label htmlFor="" className="flex flex-col">
                            Email Address
                            <input className="p-2 my-2 shadow rounded outline-none" type="email" placeholder="E-mail" />
                        </label>
                        <label htmlFor="" className="flex flex-col">
                            Password
                            <input className="p-2 my-2 shadow rounded outline-none" type="password" placeholder="Password" />
                        </label>
                        <button className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
                    </form>
                    :
                    <form >
                        <div className="flex flex-col">
                            <label htmlFor="">Name</label>
                            <input type="text" className="py-2 px-3 my-2 shadow rounded outline-none" placeholder="Full Name" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">Email Address</label>
                            <input className="py-2 px-3 my-2 shadow rounded outline-none" type="email" placeholder="E-mail" />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="" className="">
                                Password
                            </label>
                            <input className="py-2 px-3 my-2 shadow rounded outline-none" type="password" placeholder="E-mail" />
                        </div>
                        <button className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
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
