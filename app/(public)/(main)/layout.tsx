import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main id="main-content" tabIndex={-1} className="flex-1">{children}</main>
            <Footer />
        </div>
    )
}
