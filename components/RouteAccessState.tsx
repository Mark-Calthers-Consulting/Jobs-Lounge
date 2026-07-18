'use client'

type RouteAccessStateProps = {
  error?: boolean
  retry?: () => void
}

const RouteAccessState = ({ error = false, retry }: RouteAccessStateProps) => (
  <main className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
    <div className="max-w-md text-center" role={error ? 'alert' : 'status'} aria-live="polite">
      {error ? (
        <>
          <h1 className="text-lg font-semibold text-gray-900">We couldn&apos;t verify your session</h1>
          <p className="mt-2 text-sm text-gray-600">
            Check your connection and try again. You have not been signed out.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-4 rounded bg-[#003B6D] px-4 py-2 text-sm font-medium text-white"
          >
            Try again
          </button>
        </>
      ) : (
        <>
          <span className="mx-auto block h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#003B6D]" aria-hidden="true" />
          <p className="mt-3 text-sm text-gray-600">Checking your session…</p>
        </>
      )}
    </div>
  </main>
)

export default RouteAccessState
