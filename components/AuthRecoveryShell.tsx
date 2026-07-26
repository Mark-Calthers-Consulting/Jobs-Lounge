import Image from 'next/image'
import Link from 'next/link'

const AuthRecoveryShell = ({
    children,
    loginHref,
}: {
    children: React.ReactNode
    loginHref: string
}) => (
    <main id="main-content" tabIndex={-1} className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
        <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white px-6 py-8 shadow-sm sm:px-9">
            <Link href="/" aria-label="Jobs Lounge home" className="inline-flex">
                <Image width={56} height={56} src="/logo.svg" alt="" />
            </Link>
            <div className="mt-6">{children}</div>
            <Link
                href={loginHref}
                className="mt-6 inline-flex rounded text-sm font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
            >
                ← Back to sign in
            </Link>
        </section>
    </main>
)

export default AuthRecoveryShell
