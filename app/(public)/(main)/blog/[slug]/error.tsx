'use client'

import Link from 'next/link'

const ArticleError = ({ reset }: { error: Error; reset: () => void }) => (
  <section className="mx-auto max-w-3xl px-5 py-24 text-center sm:px-8">
    <p className="text-sm font-semibold text-[#184aa2]">Career Insights</p>
    <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[#101A35]">
      This article could not be loaded
    </h1>
    <p className="mx-auto mt-4 max-w-lg text-base leading-7 text-slate-600">
      The article may be temporarily unavailable. Try again, or return to Career Insights.
    </p>
    <div className="mt-8 flex flex-wrap justify-center gap-3">
      <button
        type="button"
        onClick={reset}
        className="min-h-11 rounded-md bg-[#1B1F87] px-5 text-sm font-semibold text-white focus-visible:outline-[#101A35]"
      >
        Try again
      </button>
      <Link
        href="/blog"
        className="inline-flex min-h-11 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-[#101A35] focus-visible:outline-[#101A35]"
      >
        Back to Career Insights
      </Link>
    </div>
  </section>
)

export default ArticleError
