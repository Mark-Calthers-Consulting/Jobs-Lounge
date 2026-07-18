"use client"

import { useLogout } from "@/hooks/useAuth"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { FaWpforms } from "react-icons/fa"
import {
    LuLayoutDashboard,
    LuUser,
    LuSettings,
    LuUsers,
    LuLogOut
} from "react-icons/lu"
import { PiSuitcase, PiUsersThree } from "react-icons/pi"

const AdminSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()

    const logoutMutation = useLogout()

    const handleLogout = async () => {
        // document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

        await logoutMutation.mutateAsync()
        router.push("/admin-center/login")
    }

    const menuItems = [
        {
            name: "Dashboard",
            href: "/admin-center",
            icon: <LuLayoutDashboard size={20} />
        },
        {
            name: "Jobs",
            href: "/admin-center/jobs",
            icon: <PiSuitcase size={20} />
        },
        {
            name: "Applications",
            href: "/admin-center/applications",
            icon: <FaWpforms size={20} />
        },
        {
            name: "Candidates",
            href: "/admin-center/candidates",
            icon: <PiUsersThree size={20} />
        },
        {
            name: "Team",
            href: "/admin-center/team",
            icon: <LuUsers size={20} />
        },
        {
            name: "My Profile",
            href: "/admin-center/profile",
            icon: <LuUser size={20} />
        },
        {
            name: "Settings",
            href: "/admin-center/settings",
            icon: <LuSettings size={20} />
        },
    ]

    return (
        <aside aria-label="Administration" className="z-30 flex w-full flex-col border-b border-gray-200 bg-white md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:border-gray-100">
            {/* 1. Logo Area */}
            <div className="flex h-20 items-center justify-center px-8 md:mt-4">
                <Link href='/' aria-label="Jobs Lounge home"><Image width={70} height={70} src='/logo.svg' alt="" /></Link>
            </div>

            {/* 2. Navigation */}
            <nav aria-label="Administration navigation" className="flex flex-1 gap-2 overflow-x-auto px-4 py-3 md:flex-col md:space-y-2 md:overflow-visible md:py-6">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex shrink-0 items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                                ? "bg-blue-50 text-blue-700 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span aria-hidden="true" className={isActive ? "text-blue-600" : "text-gray-400"}>
                                {item.icon}
                            </span>
                            {item.name}
                        </Link>
                    )
                })}
            </nav>

            {/* 3. Logout Area */}
            <div className="p-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors disabled:cursor-wait disabled:opacity-70"
                >
                    <LuLogOut aria-hidden="true" size={20} />
                    {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
                </button>
            </div>
        </aside>
    )
}

export default AdminSidebar
