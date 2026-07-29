'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import { FiChevronDown, FiFilter, FiX } from 'react-icons/fi'

import {
  JOB_ENUMS,
  type Category,
  type JobType,
  type Level,
  type WorkMode,
} from '@/constants/enums'
import type {
  JobFilterOption,
  JobFilterOptions,
  VacancyDatePosted,
  VacancySort,
} from '@/types/types'

export type VacancyFilterState = {
  category: Category[]
  workMode: WorkMode[]
  jobType: JobType[]
  level: Level[]
  location: string[]
  datePosted?: VacancyDatePosted
  experienceMin?: number
  experienceMax?: number
  salaryMin?: number
  salaryDisclosed: boolean
}

type JobFiltersProps = {
  filters: VacancyFilterState
  sort: VacancySort
  options?: JobFilterOptions
  optionsLoading: boolean
  optionsError: boolean
  resultTotal: number
  onFiltersChange: (filters: VacancyFilterState) => void
  onSortChange: (sort: VacancySort) => void
  onClearFilters: () => void
}

type Choice = {
  value: string
  count?: number
}

const focusableSelector = [
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

const baseFilters = (): VacancyFilterState => ({
  category: [],
  workMode: [],
  jobType: [],
  level: [],
  location: [],
  salaryDisclosed: false,
})

const boundedNumberInput = (
  value: string,
  maximum: number,
): number | undefined => {
  if (value === '') return undefined
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return undefined
  return Math.min(maximum, Math.max(0, Math.trunc(parsed)))
}

const choicesWithFallback = (
  serverOptions: JobFilterOption[] | undefined,
  fallback: readonly string[],
  selected: readonly string[] = [],
): Choice[] => {
  const choices: Choice[] = serverOptions?.length
    ? serverOptions
    : fallback.map((value) => ({ value }))
  const knownValues = new Set(choices.map(({ value }) => value))
  return [
    ...choices,
    ...selected
      .filter((value) => !knownValues.has(value))
      .map((value) => ({ value })),
  ]
}

const toggleValue = <T extends string>(
  values: T[],
  value: T,
  maximum = Number.POSITIVE_INFINITY,
) => values.includes(value)
  ? values.filter((item) => item !== value)
  : values.length < maximum
    ? [...values, value]
    : values

const FilterChoices = <T extends string>({
  legend,
  choices,
  selected,
  onChange,
  maximum,
  compact = false,
}: {
  legend: string
  choices: Choice[]
  selected: T[]
  onChange: (values: T[]) => void
  maximum?: number
  compact?: boolean
}) => (
  <fieldset>
    <legend className="mb-2 text-sm font-semibold text-gray-900">{legend}</legend>
    <div className={compact ? 'space-y-2' : 'grid gap-2 sm:grid-cols-2'}>
      {choices.map((choice) => {
        const checked = selected.includes(choice.value as T)
        const selectionLimitReached = maximum !== undefined
          && selected.length >= maximum
          && !checked
        return (
          <label
            key={choice.value}
            className="flex cursor-pointer items-start justify-between gap-3 rounded-md px-1 py-1 text-sm text-gray-700"
          >
            <span className="flex min-w-0 items-start gap-2">
              <input
                type="checkbox"
                checked={checked}
                disabled={selectionLimitReached}
                onChange={() => onChange(toggleValue(
                  selected,
                  choice.value as T,
                  maximum,
                ))}
                className="mt-0.5 size-4 accent-[#003B6D]"
              />
              <span className="break-words">{choice.value}</span>
            </span>
            {choice.count !== undefined
              ? <span className="shrink-0 text-xs text-gray-400">{choice.count}</span>
              : null}
          </label>
        )
      })}
    </div>
  </fieldset>
)

const MultiSelectMenu = <T extends string>({
  label,
  choices,
  selected,
  onChange,
}: {
  label: string
  choices: Choice[]
  selected: T[]
  onChange: (values: T[]) => void
}) => (
  <details className="group relative">
    <summary className="flex min-h-10 cursor-pointer list-none items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] [&::-webkit-details-marker]:hidden">
      <span>{label}</span>
      {selected.length > 0 ? (
        <span className="rounded-full bg-[#003B6D] px-1.5 py-0.5 text-xs font-semibold text-white">
          {selected.length}
        </span>
      ) : null}
      <FiChevronDown aria-hidden="true" className="ml-auto transition group-open:rotate-180" />
    </summary>
    <div className="absolute left-0 top-full z-30 mt-2 max-h-80 w-72 overflow-y-auto rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
      <FilterChoices
        legend={label}
        choices={choices}
        selected={selected}
        onChange={onChange}
        compact
      />
    </div>
  </details>
)

const AdvancedFields = ({
  filters,
  locationChoices,
  onChange,
}: {
  filters: VacancyFilterState
  locationChoices: Choice[]
  onChange: (filters: VacancyFilterState) => void
}) => {
  const updateExperience = (
    field: 'experienceMin' | 'experienceMax',
    value: string,
  ) => {
    const parsed = boundedNumberInput(value, 60)
    const next = { ...filters, [field]: parsed }
    if (
      field === 'experienceMin'
      && parsed !== undefined
      && next.experienceMax !== undefined
      && parsed > next.experienceMax
    ) {
      next.experienceMax = undefined
    }
    if (
      field === 'experienceMax'
      && parsed !== undefined
      && next.experienceMin !== undefined
      && parsed < next.experienceMin
    ) {
      next.experienceMin = undefined
    }
    onChange(next)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <div className="lg:col-span-2">
        <FilterChoices
          legend="Location"
          choices={locationChoices}
          selected={filters.location}
          maximum={5}
          onChange={(location) => onChange({ ...filters, location })}
        />
        {locationChoices.length === 0 ? (
          <p className="text-sm text-gray-500">No locations are currently available.</p>
        ) : null}
      </div>

      <div className="space-y-5">
        <label className="block text-sm font-semibold text-gray-900">
          Date posted
          <select
            value={filters.datePosted ?? ''}
            onChange={(event) => onChange({
              ...filters,
              datePosted: (event.target.value || undefined) as VacancyDatePosted | undefined,
            })}
            className="mt-2 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
          >
            <option value="">Any time</option>
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
          </select>
        </label>

        <fieldset>
          <legend className="text-sm font-semibold text-gray-900">Required experience</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-gray-600">
              Minimum years
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="60"
                value={filters.experienceMin ?? ''}
                onChange={(event) => updateExperience('experienceMin', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
              />
            </label>
            <label className="text-xs text-gray-600">
              Maximum years
              <input
                type="number"
                inputMode="numeric"
                min="0"
                max="60"
                value={filters.experienceMax ?? ''}
                onChange={(event) => updateExperience('experienceMax', event.target.value)}
                className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
              />
            </label>
          </div>
        </fieldset>
      </div>

      <div className="space-y-5">
        <label className="block text-sm font-semibold text-gray-900">
          Minimum salary (NGN)
          <input
            type="number"
            inputMode="numeric"
            min="0"
            max="1000000000000"
            step="50000"
            value={filters.salaryMin ?? ''}
            onChange={(event) => {
              const value = event.target.value
              onChange({
                ...filters,
                salaryMin: value === ''
                  ? undefined
                  : boundedNumberInput(value, 1_000_000_000_000),
              })
            }}
            placeholder="e.g. 500000"
            className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={filters.salaryDisclosed}
            onChange={(event) => onChange({
              ...filters,
              salaryDisclosed: event.target.checked,
            })}
            className="mt-0.5 size-4 accent-[#003B6D]"
          />
          Only show jobs with salary information
        </label>
      </div>
    </div>
  )
}

const formatSalary = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value)

const JobFilters = ({
  filters,
  sort,
  options,
  optionsLoading,
  optionsError,
  resultTotal,
  onFiltersChange,
  onSortChange,
  onClearFilters,
}: JobFiltersProps) => {
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<VacancyFilterState>(filters)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

  const categoryChoices = choicesWithFallback(
    options?.categories,
    JOB_ENUMS.category,
    filters.category,
  )
  const workModeChoices = choicesWithFallback(
    options?.workModes,
    JOB_ENUMS.workMode,
    filters.workMode,
  )
  const jobTypeChoices = choicesWithFallback(
    options?.jobTypes,
    JOB_ENUMS.jobType,
    filters.jobType,
  )
  const levelChoices = choicesWithFallback(
    options?.levels,
    JOB_ENUMS.level,
    filters.level,
  )
  const locationChoices = choicesWithFallback(
    options?.locations,
    [],
    filters.location,
  )

  const chips: Array<{ key: string, label: string, remove: () => void }> = []
  const addArrayChips = <K extends 'category' | 'workMode' | 'jobType' | 'level' | 'location'>(
    field: K,
    values: VacancyFilterState[K],
  ) => {
    for (const value of values) {
      chips.push({
        key: `${field}:${value}`,
        label: value,
        remove: () => onFiltersChange({
          ...filters,
          [field]: values.filter((item) => item !== value),
        }),
      })
    }
  }
  addArrayChips('category', filters.category)
  addArrayChips('workMode', filters.workMode)
  addArrayChips('jobType', filters.jobType)
  addArrayChips('level', filters.level)
  addArrayChips('location', filters.location)
  if (filters.datePosted) {
    const label = {
      '24h': 'Posted in the last 24 hours',
      '7d': 'Posted in the last 7 days',
      '30d': 'Posted in the last 30 days',
    }[filters.datePosted]
    chips.push({
      key: 'datePosted',
      label,
      remove: () => onFiltersChange({ ...filters, datePosted: undefined }),
    })
  }
  if (filters.experienceMin !== undefined || filters.experienceMax !== undefined) {
    const range = filters.experienceMin !== undefined && filters.experienceMax !== undefined
      ? `${filters.experienceMin}–${filters.experienceMax} years`
      : filters.experienceMin !== undefined
        ? `${filters.experienceMin}+ years`
        : `Up to ${filters.experienceMax} years`
    chips.push({
      key: 'experience',
      label: `Experience: ${range}`,
      remove: () => onFiltersChange({
        ...filters,
        experienceMin: undefined,
        experienceMax: undefined,
      }),
    })
  }
  if (filters.salaryMin !== undefined) {
    chips.push({
      key: 'salaryMin',
      label: `Salary from ${formatSalary(filters.salaryMin)}`,
      remove: () => onFiltersChange({ ...filters, salaryMin: undefined }),
    })
  }
  if (filters.salaryDisclosed) {
    chips.push({
      key: 'salaryDisclosed',
      label: 'Salary disclosed',
      remove: () => onFiltersChange({ ...filters, salaryDisclosed: false }),
    })
  }

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false)
    window.setTimeout(() => mobileTriggerRef.current?.focus(), 0)
  }, [])

  const openDrawer = () => {
    setDraftFilters(filters)
    setDrawerOpen(true)
  }

  useEffect(() => {
    if (!drawerOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeDrawer()
        return
      }
      if (event.key !== 'Tab' || !drawerRef.current) return

      const focusable = [...drawerRef.current.querySelectorAll<HTMLElement>(focusableSelector)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable.at(-1) as HTMLElement
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [closeDrawer, drawerOpen])

  return (
    <section aria-labelledby="vacancy-filter-heading" className="space-y-4">
      <h2 id="vacancy-filter-heading" className="sr-only">Filter vacancies</h2>

      <div className="flex items-center justify-between gap-3 md:hidden">
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={openDrawer}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
        >
          <FiFilter aria-hidden="true" />
          Filters{chips.length > 0 ? ` (${chips.length})` : ''}
        </button>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <span>Sort</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as VacancySort)}
            className="min-h-11 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <MultiSelectMenu
          label="Category"
          choices={categoryChoices}
          selected={filters.category}
          onChange={(category) => onFiltersChange({ ...filters, category })}
        />
        <MultiSelectMenu
          label="Work arrangement"
          choices={workModeChoices}
          selected={filters.workMode}
          onChange={(workMode) => onFiltersChange({ ...filters, workMode })}
        />
        <MultiSelectMenu
          label="Job type"
          choices={jobTypeChoices}
          selected={filters.jobType}
          onChange={(jobType) => onFiltersChange({ ...filters, jobType })}
        />
        <MultiSelectMenu
          label="Experience level"
          choices={levelChoices}
          selected={filters.level}
          onChange={(level) => onFiltersChange({ ...filters, level })}
        />
        <button
          type="button"
          aria-expanded={advancedOpen}
          aria-controls="advanced-vacancy-filters"
          onClick={() => setAdvancedOpen((open) => !open)}
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-800 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
        >
          <FiFilter aria-hidden="true" />
          All filters
          {chips.length > 0 ? (
            <span className="rounded-full bg-[#003B6D] px-1.5 py-0.5 text-xs font-semibold text-white">
              {chips.length}
            </span>
          ) : null}
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm text-gray-600">
          <span>Sort by</span>
          <select
            value={sort}
            onChange={(event) => onSortChange(event.target.value as VacancySort)}
            className="min-h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
          </select>
        </label>
      </div>

      {advancedOpen ? (
        <div
          id="advanced-vacancy-filters"
          className="hidden rounded-lg border border-gray-200 bg-gray-50 p-5 md:block"
        >
          <AdvancedFields
            filters={filters}
            locationChoices={locationChoices}
            onChange={onFiltersChange}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm text-gray-600" aria-live="polite">
          {resultTotal.toLocaleString()} {resultTotal === 1 ? 'job' : 'jobs'} found
        </p>
        {optionsLoading ? <p className="text-xs text-gray-500">Loading filter options…</p> : null}
        {optionsError ? <p className="text-xs text-amber-700">Some filter options are unavailable.</p> : null}
      </div>

      {chips.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.remove}
              className="inline-flex items-center gap-1.5 rounded-full border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
              aria-label={`Remove filter: ${chip.label}`}
            >
              {chip.label}
              <FiX aria-hidden="true" />
            </button>
          ))}
          <button
            type="button"
            onClick={onClearFilters}
            className="rounded px-2 py-1.5 text-xs font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
          >
            Clear filters
          </button>
        </div>
      ) : null}

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={closeDrawer}
            className="absolute inset-0 bg-black/45"
          />
          <div
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-filter-title"
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h2 id="mobile-filter-title" className="text-lg font-semibold text-gray-950">
                  Filter jobs
                </h2>
                <p className="mt-0.5 text-sm text-gray-500">Choose filters, then show matching jobs.</p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Close filters"
                className="rounded-md p-2 text-gray-600 hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
              >
                <FiX aria-hidden="true" size={20} />
              </button>
            </div>

            <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
              <FilterChoices
                legend="Category"
                choices={categoryChoices}
                selected={draftFilters.category}
                onChange={(category) => setDraftFilters({ ...draftFilters, category })}
                compact
              />
              <FilterChoices
                legend="Work arrangement"
                choices={workModeChoices}
                selected={draftFilters.workMode}
                onChange={(workMode) => setDraftFilters({ ...draftFilters, workMode })}
                compact
              />
              <FilterChoices
                legend="Job type"
                choices={jobTypeChoices}
                selected={draftFilters.jobType}
                onChange={(jobType) => setDraftFilters({ ...draftFilters, jobType })}
                compact
              />
              <FilterChoices
                legend="Experience level"
                choices={levelChoices}
                selected={draftFilters.level}
                onChange={(level) => setDraftFilters({ ...draftFilters, level })}
                compact
              />
              <AdvancedFields
                filters={draftFilters}
                locationChoices={locationChoices}
                onChange={setDraftFilters}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setDraftFilters(baseFilters())}
                className="rounded-md border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => {
                  onFiltersChange(draftFilters)
                  closeDrawer()
                }}
                className="rounded-md bg-[#003B6D] px-4 py-3 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
              >
                Show jobs
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default JobFilters
