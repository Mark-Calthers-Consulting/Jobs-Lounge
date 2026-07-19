import { BiSearch } from 'react-icons/bi'

const TableToolbar = ({
    label,
    value,
    onChange,
    onExport,
    exportDisabled,
}: {
    label: string
    value: string
    onChange: (value: string) => void
    onExport: () => void
    exportDisabled?: boolean
}) => (
    <div className="my-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 rounded bg-gray-100">
            <BiSearch aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2" size={18} color="gray" />
            <label className="sr-only" htmlFor={`${label}-search`}>Search {label}</label>
            <input id={`${label}-search`} type="search" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded border border-gray-300 px-10 py-2" placeholder={`Search this page of ${label}…`} />
        </div>
        <button type="button" onClick={onExport} disabled={exportDisabled} className="rounded bg-gray-900 px-4 py-2 text-white disabled:opacity-50">Export visible CSV</button>
    </div>
)

export default TableToolbar
