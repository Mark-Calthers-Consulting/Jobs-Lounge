"use client"

import { useLogout } from "@/hooks/useAuth"
import { useUser } from "@/hooks/useUsers"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import SidebarAccount from "@/components/SidebarAccount"
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
    const { data: user } = useUser()

    const logoutMutation = useLogout()

    const handleLogout = async () => {
        // document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        // document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

        await logoutMutation.mutateAsync()


        router.push("/auth");
    };

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
        <aside aria-label="Candidate dashboard" className="z-30 flex w-full flex-col border-b border-gray-200 bg-white md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:border-b-0 md:border-r md:border-gray-100">
            {/* 1. Logo Area */}
            <div className="h-20 flex items-center px-8">
                <div className="h-20 flex justify-center items-center px-8 mt-4 ">
                    <Link href='/' aria-label="Jobs Lounge home"><Image width={70} height={70} src='/logo.svg' alt="" /></Link>
                </div>
            </div>

            {/* 2. Navigation */}
            <nav aria-label="Candidate dashboard navigation" className="flex flex-1 gap-2 overflow-x-auto px-4 py-3 md:flex-col md:space-y-2 md:overflow-visible md:py-6">
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

            {/* 3. Account and logout area */}
            <div className="border-t border-gray-100 p-3">
                {user ? (
                    <SidebarAccount
                        user={user}
                        profileHref="/dashboard/profile"
                    />
                ) : null}
                <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-wait disabled:opacity-70"
                >
                    <LuLogOut aria-hidden="true" size={20} />
                    {logoutMutation.isPending ? 'Signing out…' : 'Sign out'}
                </button>
            </div>
        </aside>
    )
}

export default DashboardSidebar
