import AdminAuthForm from "@/components/AdminAuthForm"
import GuestOnlyRoute from "@/components/GuestOnlyRoute"
import { safeNextPath } from "@/utils/authRouting"

const AdminLogin = async ({
  searchParams,
}: {
  searchParams: Promise<{
    next?: string | string[]
    passwordReset?: string | string[]
  }>
}) => {
  const query = await searchParams
  const nextPath = safeNextPath(query.next, 'admin')
  const passwordResetComplete = query.passwordReset === 'success'

  return (
    <GuestOnlyRoute area="admin" nextPath={nextPath}>
      <main id="main-content" tabIndex={-1} className="flex min-h-screen justify-center items-center">
        <div className="w-10/12 md:w-1/2 lg:w-1/3 ring-1 ring-gray-100 py-10 px-8">
          <AdminAuthForm
            nextPath={nextPath}
            passwordResetComplete={passwordResetComplete}
          />
        </div>
      </main>
    </GuestOnlyRoute>
  )
}

export default AdminLogin
