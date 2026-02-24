import AdminAuthForm from "@/components/AdminAuthForm"

const AdminLogin = () => {
  return (
    <div className="flex min-h-screen justify-center items-center">
      <div className="w-1/3 ring-1 ring-gray-100 py-10 px-8">
        <AdminAuthForm />
      </div>
    </div>
  )
}

export default AdminLogin
