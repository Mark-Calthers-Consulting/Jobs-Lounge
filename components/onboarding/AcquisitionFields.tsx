import { ACQUISITION_OPTIONS, acquisitionOption } from '@/constants/onboarding'
import type { AcquisitionSource } from '@/types/types'

type Props = {
    source?: AcquisitionSource
    detail: string
    onChange: (source: AcquisitionSource, detail: string) => void
    disabled?: boolean
    error?: string
}

const AcquisitionFields = ({ source, detail, onChange, disabled, error }: Props) => {
    const selectedOption = acquisitionOption(source)

    return (
        <fieldset disabled={disabled}>
            <legend className="font-semibold text-slate-950">How did you hear about Jobs Lounge?</legend>
            <p className="mt-1 text-sm text-slate-600">
                This helps us understand where candidates find us. It is never used in hiring decisions.
            </p>
            <div className="mt-4 grid gap-x-5 gap-y-1 sm:grid-cols-2">
                {ACQUISITION_OPTIONS.map((option) => (
                    <label key={option.value} className="flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-slate-800">
                        <input
                            type="radio"
                            name="acquisition-source"
                            value={option.value}
                            checked={source === option.value}
                            onChange={() => onChange(option.value, '')}
                            className="size-4 accent-[#184aa2]"
                        />
                        {option.label}
                    </label>
                ))}
            </div>

            {selectedOption?.acceptsDetail ? (
                <label className="mt-4 block text-sm font-medium text-slate-800">
                    {selectedOption.detailLabel}
                    <input
                        type="text"
                        value={detail}
                        maxLength={120}
                        required={source === 'other'}
                        onChange={(event) => source && onChange(source, event.target.value)}
                        placeholder={selectedOption.detailPlaceholder}
                        className="mt-1.5 block min-h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-slate-950 focus:border-[#184aa2] focus:outline-none focus:ring-1 focus:ring-[#184aa2]"
                    />
                    <span className="mt-1 block text-right text-xs font-normal text-slate-500">{detail.length}/120</span>
                </label>
            ) : null}
            {error ? <p role="alert" className="mt-3 text-sm text-red-700">{error}</p> : null}
        </fieldset>
    )
}

export default AcquisitionFields
