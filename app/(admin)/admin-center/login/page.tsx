import AdminAuthForm from "@/components/AdminAuthForm"
import GuestOnlyRoute from "@/components/GuestOnlyRoute"
import { safeNextPath } from "@/utils/authRouting"

const AdminLogin = async ({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>
}) => {
  const nextPath = safeNextPath((await searchParams).next, 'admin')

  return (
    <GuestOnlyRoute area="admin" nextPath={nextPath}>
      <div className="flex min-h-screen justify-center items-center">
        <div className="w-10/12 md:w-1/2 lg:w-1/3 ring-1 ring-gray-100 py-10 px-8">
          <AdminAuthForm nextPath={nextPath} />
        </div>
      </div>
    </GuestOnlyRoute>
  )
}

export default AdminLogin
