import { JOB_ENUMS } from '@/constants/enums'
import type { Category } from '@/constants/enums'

type Props = {
    categories: Category[]
    openToAny: boolean
    onChange: (categories: Category[], openToAny: boolean) => void
    disabled?: boolean
    error?: string
}

const JobInterestFields = ({ categories, openToAny, onChange, disabled, error }: Props) => {
    const toggleCategory = (category: Category) => {
        if (categories.includes(category)) {
            onChange(categories.filter((value) => value !== category), false)
            return
        }
        if (categories.length < 3) onChange([...categories, category], false)
    }

    return (
        <fieldset disabled={disabled} aria-describedby={error ? 'job-interest-error' : 'job-interest-help'}>
            <legend className="font-semibold text-slate-950">What kind of roles interest you?</legend>
            <p id="job-interest-help" className="mt-1 text-sm text-slate-600">
                Choose up to three categories. You can change these later.
            </p>

            <label className="mt-4 flex cursor-pointer items-start gap-3 border-y border-slate-200 py-3 text-sm font-medium text-slate-900">
                <input
                    type="checkbox"
                    checked={openToAny}
                    onChange={(event) => onChange([], event.target.checked)}
                    className="mt-0.5 size-4 accent-[#184aa2]"
                />
                <span>
                    Open to any category
                    <span className="mt-0.5 block text-xs font-normal text-slate-500">
                        Show me a broad mix of recently posted vacancies.
                    </span>
                </span>
            </label>

            <div className="mt-3 grid max-h-64 gap-x-5 gap-y-1 overflow-y-auto pr-2 sm:grid-cols-2">
                {JOB_ENUMS.category.map((category) => {
                    const checked = categories.includes(category)
                    const limitReached = !checked && categories.length >= 3
                    return (
                        <label
                            key={category}
                            className={`flex min-h-10 items-center gap-2.5 text-sm ${
                                openToAny || limitReached ? 'text-slate-400' : 'cursor-pointer text-slate-800'
                            }`}
                        >
                            <input
                                type="checkbox"
                                checked={checked}
                                disabled={openToAny || limitReached}
                                onChange={() => toggleCategory(category)}
                                className="size-4 accent-[#184aa2]"
                            />
                            {category}
                        </label>
                    )
                })}
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-slate-500">{openToAny ? 'Broad recommendations selected' : `${categories.length} of 3 selected`}</span>
                {error ? <span id="job-interest-error" role="alert" className="text-red-700">{error}</span> : null}
            </div>
        </fieldset>
    )
}

export default JobInterestFields
