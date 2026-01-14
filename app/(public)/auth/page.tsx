import AuthForm from "@/components/AuthForm"
import Image from "next/image"

const Auth: React.FC = () => {
    return (
        <div className="flex-1 flex  border border-blue-700">
            <section className="relative w-1/2 flex-1">
                <Image src='/auth.webp' fill priority sizes="50vw" alt="office setting" className="object-cover" />
            </section>
            <section className="flex min-h-[650px] flex-col gap-3 w-1/2 borde h-full py-16 px-20">
                <AuthForm />
            </section>
        </div>
    )
}

export default Auth