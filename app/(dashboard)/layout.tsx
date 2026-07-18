import DashboardSidebar from "@/components/DashboardSidebar"
import ProtectedRoute from "@/components/ProtectedRoute"

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <ProtectedRoute area="candidate">
            <div className="flex min-h-screen bg-gray-50">
                <DashboardSidebar />
                <main className="flex-1 md:ml-64 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </ProtectedRoute>
    )
}

export default DashboardLayout
