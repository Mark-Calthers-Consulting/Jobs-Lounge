const ArticleLoading = () => (
  <div role="status" aria-label="Loading article" className="motion-safe:animate-pulse">
    <div>
      <div className="mx-auto max-w-[980px] px-5 pb-10 pt-12 sm:px-8 lg:px-0">
        <div className="h-4 w-40 rounded bg-slate-200" />
        <div className="mt-10 h-4 w-32 rounded bg-slate-200" />
        <div className="mt-5 h-12 max-w-3xl rounded bg-slate-200" />
        <div className="mt-4 h-12 max-w-2xl rounded bg-slate-200" />
        <div className="mt-6 h-5 max-w-xl rounded bg-slate-200" />
      </div>
    </div>
    <div className="mx-auto max-w-6xl px-5 pb-14 sm:px-8 lg:px-10">
      <div className="mx-auto aspect-video max-w-[980px] rounded-xl bg-slate-100" />
      <div className="mx-auto mt-12 max-w-[720px] space-y-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className={`h-4 rounded bg-slate-100 ${index % 3 === 2 ? 'w-4/5' : 'w-full'}`} />
        ))}
      </div>
    </div>
    <span className="sr-only">Loading article…</span>
  </div>
)

export default ArticleLoading
