import type { ReactNode } from 'react'

type LegalSection = {
    title: string
    content: ReactNode
}

type LegalPageProps = {
    eyebrow: string
    title: string
    summary: string
    effectiveDate: string
    sections: LegalSection[]
}

export default function LegalPage({
    eyebrow,
    title,
    summary,
    effectiveDate,
    sections,
}: LegalPageProps): React.JSX.Element {
    return (
        <div className="bg-white">
            <header className="bg-[#101A35] text-white">
                <div className="mx-auto max-w-5xl px-5 py-16 sm:px-6 sm:py-20 lg:px-8">
                    <p className="text-sm font-medium text-blue-200">{eyebrow}</p>
                    <h1 className="mt-4 max-w-3xl text-balance text-4xl font-semibold tracking-[-0.035em] sm:text-5xl">
                        {title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-pretty text-base leading-7 text-slate-300 sm:text-lg">
                        {summary}
                    </p>
                    <p className="mt-6 text-sm text-slate-400">Effective {effectiveDate}</p>
                </div>
            </header>

            <div className="mx-auto grid max-w-5xl gap-10 px-5 py-14 sm:px-6 sm:py-16 lg:grid-cols-[220px_minmax(0,1fr)] lg:px-8 lg:py-20">
                <nav aria-label={`${title} sections`} className="lg:sticky lg:top-24 lg:self-start">
                    <p className="text-sm font-semibold text-slate-950">On this page</p>
                    <ol className="mt-4 space-y-3">
                        {sections.map((section, index) => (
                            <li key={section.title}>
                                <a
                                    href={`#section-${index + 1}`}
                                    className="text-sm leading-5 text-slate-600 transition-colors hover:text-[#1B1F87]"
                                >
                                    {section.title}
                                </a>
                            </li>
                        ))}
                    </ol>
                </nav>

                <article className="min-w-0 divide-y divide-slate-200">
                    {sections.map((section, index) => (
                        <section
                            key={section.title}
                            id={`section-${index + 1}`}
                            className="scroll-mt-24 py-8 first:pt-0 last:pb-0"
                        >
                            <h2 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-slate-950">
                                {section.title}
                            </h2>
                            <div className="mt-4 space-y-4 text-pretty text-base leading-7 text-slate-600 [&_a]:font-medium [&_a]:text-[#1B1F87] [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-slate-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
                                {section.content}
                            </div>
                        </section>
                    ))}
                </article>
            </div>
        </div>
    )
}
