import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 border border-red-500">{children}</main>
            <Footer />
        </div>
    )
}