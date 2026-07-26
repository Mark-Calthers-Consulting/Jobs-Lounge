import { BiSearch } from 'react-icons/bi'

const TableToolbar = ({
    label,
    value,
    onChange,
}: {
    label: string
    value: string
    onChange: (value: string) => void
}) => (
    <div className="my-4">
        <div className="relative flex-1 rounded bg-gray-100">
            <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-gray-500">
                <BiSearch size={18} />
            </span>
            <label className="sr-only" htmlFor={`${label}-search`}>Search {label}</label>
            <input id={`${label}-search`} type="search" value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded border border-gray-300 px-10 py-2" placeholder={`Search this page of ${label}…`} />
        </div>
    </div>
)

export default TableToolbar
