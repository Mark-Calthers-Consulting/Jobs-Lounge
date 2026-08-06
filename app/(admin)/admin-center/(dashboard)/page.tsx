import AdminDashboardClient from '@/components/AdminDashboardClient'
import { Suspense } from "react"

const AdminDashboard: React.FC = () => {
    return (
        <Suspense fallback={null}>
            <AdminDashboardClient />
        </Suspense>
    )
}

export default AdminDashboard
