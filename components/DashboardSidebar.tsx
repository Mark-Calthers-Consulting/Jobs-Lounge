"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
    LuLayoutDashboard, 
    LuBookmark, 
    LuUser, 
    LuSettings, 
    LuLogOut 
} from "react-icons/lu"

const DashboardSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = () => {
        // Remove cookie using native JS (Set expiry to the past)
        document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"
        
        // Redirect to login
        router.push("/auth/login")
    }

    const menuItems = [
        {
            name: "Dashboard",
            href: "/dashboard",
            icon: <LuLayoutDashboard size={20} />
        },
        {
            name: "Saved Jobs",
            href: "/dashboard/saved-jobs",
            icon: <LuBookmark size={20} />
        },
        {
            name: "My Profile",
            href: "/dashboard/profile",
            icon: <LuUser size={20} />
        },
        {
            name: "Settings",
            href: "/dashboard/settings",
            icon: <LuSettings size={20} />
        },
    ]

    return (
        <aside className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col fixed left-0 top-0 z-30 hidden md:flex">
            {/* 1. Logo Area */}
            <div className="h-20 flex items-center px-8">
                 <Link href="/" className="text-2xl font-bold tracking-tight text-gray-900">
                    Job<span className="text-blue-600">Lounge</span>
                </Link>
            </div>

            {/* 2. Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href
                    
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                                isActive 
                                    ? "bg-blue-50 text-blue-700 shadow-sm" 
                                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                        >
                            <span className={isActive ? "text-blue-600" : "text-gray-400"}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* 3. Logout Area */}
            <div className="p-4 border-t border-gray-50">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                    <LuLogOut size={20} />
                    Sign Out
                </button>
            </div>
        </aside>
    )
}

export default DashboardSidebar