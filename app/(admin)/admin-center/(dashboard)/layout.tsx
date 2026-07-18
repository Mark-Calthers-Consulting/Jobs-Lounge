import AdminSidebar from "@/components/AdminSidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute area="admin">
            <div className="flex min-h-screen flex-col bg-gray-50 md:flex-row">
                <AdminSidebar />
                <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 p-4 md:ml-64 md:p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}

export default AdminLayout
