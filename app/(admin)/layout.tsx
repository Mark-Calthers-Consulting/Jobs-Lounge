import DashboardSidebar from "@/components/DashboardSidebar"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <DashboardSidebar />
            <main className="flex-1 md:ml-64 p-4 md:p-8">
                {children}
            </main>
        </div>
    )
}

export default AdminLayout
