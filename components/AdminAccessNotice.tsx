'use client'

import { useSearchParams } from 'next/navigation'

const AdminAccessNotice = () => {
  const searchParams = useSearchParams()
  if (searchParams.get('access') !== 'denied') return null

  return (
    <p
      role="alert"
      className="mb-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
    >
      Your account does not have permission to open that area.
    </p>
  )
}

export default AdminAccessNotice
