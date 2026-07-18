import AdminSidebar from "@/components/AdminSidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute area="admin">
            <div className="flex min-h-screen bg-gray-50">
                <AdminSidebar />
                <main className="flex-1 md:ml-64 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}

export default AdminLayout
