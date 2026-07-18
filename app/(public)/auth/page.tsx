import AuthForm from "@/components/AuthForm"
import Image from "next/image"
import Link from "next/link"
import GuestOnlyRoute from "@/components/GuestOnlyRoute"
import { safeNextPath } from "@/utils/authRouting"

const Auth = async ({
    searchParams,
}: {
    searchParams: Promise<{ next?: string | string[] }>
}) => {
    const nextPath = safeNextPath((await searchParams).next, 'candidate')

    return (
        <GuestOnlyRoute area="candidate" nextPath={nextPath}>
          <main id="main-content" tabIndex={-1} className="flex-1 min-h-screen flex brder brder-blue-700 p-12 sm:p-4 bg-[linear-gradient(rgba(0,0,0,0.1),rgba(0,0,0,0.8)),url('/auth2.jpg')] bg-cover bg-center">
            <section className="relative hidden sm:flex sm:flex-1 p-5  flex-col justify-between gap-2">
                <Link href='/' aria-label="Jobs Lounge home"><Image width={70} height={70} src='/logo.svg' alt="" /></Link>
                <div className=" space-y-4">
                    <h1 className="text-white text-3xl md:text-5xl font-bold w-10/12">Your next opportunity starts here.</h1>
                    <p className="text-white/90 text-md md:text-lg w-10/12">Whether you&apos;re looking for your next role or searching for top talent, Jobs Lounge gives you a smoother way to connect, apply, and grow.</p>
                </div>
                {/* <Image src='/auth2.jpg' fill priority sizes="50vw" alt="office setting" className="object-cover" /> */}
            </section>
            <section className="bg-white rounded flex min-h-[580px]  borde flex-col justify-center gap-3 w-full sm:w-5/12 py-6 px-8 md:py-10 md:px-10">
                <AuthForm nextPath={nextPath} />
            </section>
          </main>
        </GuestOnlyRoute>
    )
}

export default Auth
