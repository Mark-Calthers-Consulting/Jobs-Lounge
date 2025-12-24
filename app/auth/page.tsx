import Image from "next/image"

const Auth: React.FC = () => {
    return (
        <div className="flex-1 flex  border border-blue-700">
            <section className="relative w-1/2 flex-1">
                <Image src='/auth.webp' fill priority sizes="50vw" alt="office setting" className="object-cover" />
            </section>
            <section className="flex flex-col gap-3 w-1/2 border h-full py-16 px-12">
                <h2 className="text-[#003B6D] text-3xl font-bold">Welcome to Jobs Lounge</h2>
                <p>Create your account to begin your journey with Jobs Lounge, whether you're searching for the perfect job or hiring top talent.</p>
                <form >
                    <label htmlFor="" className="flex flex-col">
                        Email Address
                        <input className="p-2 my-2 shadow rounded outline-none" type="email" placeholder="E-mail" />
                    </label>
                    <label htmlFor="" className="flex flex-col">
                        Password
                        <input className="p-2 my-2 shadow rounded outline-none" type="password" placeholder="E-mail" />
                    </label>
                    <button className="w-full p-2 cursor-pointer text-white bg-[#003B6D]">SIGN IN</button>
                </form>
                <p>Already have an account? <span className="underline">Sign In</span></p>
            </section>
        </div>
    )
}

export default Auth