"use client"

import { useLogout } from "@/hooks/useAuth"
import { useUser } from "@/hooks/useUsers"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import SidebarAccount from "@/components/SidebarAccount"
import { hasStaffPermission, type StaffPermission } from "@/utils/staffPermissions"
import { FaWpforms } from "react-icons/fa"
import {
    LuLayoutDashboard,
    LuUser,
    LuSettings,
    LuUsers,
    LuLogOut,
    LuBookOpen,
    LuLifeBuoy,
} from "react-icons/lu"
import { PiSuitcase, PiUsersThree } from "react-icons/pi"

const AdminSidebar = () => {
    const pathname = usePathname()
    const router = useRouter()
    const { data: user } = useUser()

    const logoutMutation = useLogout()

    const handleLogout = async () => {
        // document.cookie = "authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

        await logoutMutation.mutateAsync()
        router.push("/admin-center/login")
    }

    const menuItems: Array<{
        name: string
        href: string
        icon: React.ReactNode
        permission: StaffPermission
    }> = [
        {
            name: "Dashboard",
            href: "/admin-center",
            icon: <LuLayoutDashboard size={20} />,
            permission: 'admin:access',
        },
        {
            name: "Jobs",
            href: "/admin-center/jobs",
            icon: <PiSuitcase size={20} />,
            permission: 'jobs:manage',
        },
        {
            name: "Applications",
            href: "/admin-center/applications",
            icon: <FaWpforms size={20} />,
            permission: 'applications:review',
        },
        {
            name: "Candidates",
            href: "/admin-center/candidates",
            icon: <PiUsersThree size={20} />,
            permission: 'candidates:view',
        },
        {
            name: "Blog",
            href: "/admin-center/blog",
            icon: <LuBookOpen size={20} />,
            permission: 'blogs:manage',
        },
        {
            name: "Team",
            href: "/admin-center/team",
            icon: <LuUsers size={20} />,
            permission: 'team:manage',
        },
        {
            name: "My Profile",
            href: "/admin-center/profile",
            icon: <LuUser size={20} />,
            permission: 'admin:access',
        },
        {
            name: "Settings",
            href: "/admin-center/settings",
            icon: <LuSettings size={20} />,
            permission: 'admin:access',
        },
        {
            name: "Support Center",
            href: "/admin-center/support",
            icon: <LuLifeBuoy size={20} />,
            permission: 'admin:access',
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
                {menuItems.filter((item) => hasStaffPermission(user?.role, item.permission)).map((item) => {
                    const isActive = item.href === '/admin-center'
                        ? pathname === item.href
                        : pathname === item.href || pathname.startsWith(`${item.href}/`)

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            aria-current={isActive ? 'page' : undefined}
                            className={`flex shrink-0 items-center gap-3 rounded-md px-4 py-3 text-sm font-medium transition-colors duration-200 ${isActive
                                ? "bg-gray-100 text-gray-900"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                }`}
                        >
                            <span aria-hidden="true" className={isActive ? "text-gray-700" : "text-gray-400"}>
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
                        profileHref="/admin-center/profile"
                        showRole
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

export default AdminSidebar
