import Link from 'next/link'

const NotFoundContent = () => (
  <section
    aria-labelledby="not-found-title"
    className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)] lg:px-10 lg:py-24"
  >
    <div className="max-w-2xl">
      <p className="mb-4 text-sm font-semibold tracking-[0.18em] text-[#335F84]">
        ERROR 404
      </p>
      <h1
        id="not-found-title"
        className="text-4xl font-semibold tracking-tight text-[#101828] sm:text-5xl"
      >
        We couldn&apos;t find that page.
      </h1>
      <p className="mt-5 max-w-xl text-base leading-7 text-[#475467] sm:text-lg">
        The address may be incorrect, or the page may have moved. You can return
        home or continue browsing current opportunities.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/vacancies"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-[#003B6D] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#002f57] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
        >
          Browse vacancies
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#D0D5DD] bg-white px-5 py-3 text-sm font-semibold text-[#344054] transition-colors hover:border-[#98A2B3] hover:bg-[#F9FAFB] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
        >
          Return home
        </Link>
      </div>

      <p className="mt-7 text-sm text-[#667085]">
        Still stuck?{' '}
        <Link
          href="/contact"
          className="font-semibold text-[#003B6D] underline decoration-[#B2CCDF] underline-offset-4 hover:decoration-[#003B6D]"
        >
          Contact the Jobs Lounge team
        </Link>
        .
      </p>
    </div>

    <div
      aria-hidden="true"
      className="relative hidden min-h-80 overflow-hidden rounded-xl bg-[#101C3A] lg:block"
    >
      <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/15" />
      <div className="absolute -right-10 -top-10 size-48 rounded-full border border-white/15" />
      <div className="absolute -bottom-28 -left-20 size-64 rounded-full border border-white/10" />
      <div className="relative flex min-h-80 flex-col justify-between p-9 text-white">
        <span className="text-sm font-medium text-white/65">Jobs Lounge</span>
        <div>
          <p className="text-8xl font-semibold tracking-[-0.08em]">404</p>
        </div>
      </div>
    </div>
  </section>
)

export default NotFoundContent
