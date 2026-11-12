'use client'

import {
  useCallback,
  useEffect,
  useId,
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
  options?: JobFilterOptions
  optionsLoading: boolean
  optionsError: boolean
  onFiltersChange: (filters: VacancyFilterState) => void
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

const emptyFilters = (): VacancyFilterState => ({
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
}: {
  legend: string
  choices: Choice[]
  selected: T[]
  onChange: (values: T[]) => void
  maximum?: number
}) => (
  <fieldset>
    <legend className="sr-only">{legend}</legend>
    <div className="space-y-1">
      {choices.map((choice) => {
        const checked = selected.includes(choice.value as T)
        const selectionLimitReached = maximum !== undefined
          && selected.length >= maximum
          && !checked
        return (
          <label
            key={choice.value}
            className={`flex cursor-pointer items-start justify-between gap-3 rounded-md px-1 py-1.5 text-sm ${selectionLimitReached ? 'cursor-not-allowed text-gray-400' : 'text-gray-700 hover:bg-gray-50'}`}
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
                className="mt-0.5 size-4 shrink-0 accent-[#003B6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
              />
              <span className="break-words">{choice.value}</span>
            </span>
            {choice.count !== undefined ? (
              <span className="shrink-0 text-xs tabular-nums text-gray-500">
                {choice.count}
              </span>
            ) : null}
          </label>
        )
      })}
    </div>
  </fieldset>
)

const FilterGroup = ({
  label,
  selectedCount = 0,
  initiallyOpen = false,
  children,
}: {
  label: string
  selectedCount?: number
  initiallyOpen?: boolean
  children: React.ReactNode
}) => {
  const [open, setOpen] = useState(initiallyOpen)
  const contentId = useId()

  return (
    <section className="border-b border-gray-200 py-3 last:border-b-0">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={contentId}
          onClick={() => setOpen((current) => !current)}
          className="flex min-h-8 w-full items-center gap-2 rounded text-left text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
        >
          <span className="min-w-0 flex-1">{label}</span>
          {selectedCount > 0 ? (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold text-[#003B6D]">
              {selectedCount}
              <span className="sr-only"> selected</span>
            </span>
          ) : null}
          <FiChevronDown aria-hidden="true" className={open ? 'rotate-180' : ''} />
        </button>
      </h3>
      <div id={contentId} hidden={!open} className="pt-2">{children}</div>
    </section>
  )
}

const AdditionalFields = ({
  filters,
  onChange,
}: {
  filters: VacancyFilterState
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
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-800">
        Date posted
        <select
          value={filters.datePosted ?? ''}
          onChange={(event) => onChange({
            ...filters,
            datePosted: (event.target.value || undefined) as VacancyDatePosted | undefined,
          })}
          className="mt-1.5 min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
        >
          <option value="">Any time</option>
          <option value="24h">Last 24 hours</option>
          <option value="7d">Last 7 days</option>
          <option value="30d">Last 30 days</option>
        </select>
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-gray-800">Required experience</legend>
        <div className="mt-1.5 grid grid-cols-2 gap-2">
          <label className="text-xs text-gray-600">
            Minimum years
            <input
              type="number"
              inputMode="numeric"
              min="0"
              max="60"
              value={filters.experienceMin ?? ''}
              onChange={(event) => updateExperience('experienceMin', event.target.value)}
              className="mt-1 min-h-10 w-full rounded-md border border-gray-300 px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
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
              className="mt-1 min-h-10 w-full rounded-md border border-gray-300 px-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
            />
          </label>
        </div>
      </fieldset>

      <label className="block text-sm font-medium text-gray-800">
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
          className="mt-1.5 min-h-10 w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-normal text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
        />
      </label>

      <label className="flex cursor-pointer items-start gap-2 rounded-md px-1 py-1 text-sm text-gray-700 hover:bg-gray-50">
        <input
          type="checkbox"
          checked={filters.salaryDisclosed}
          onChange={(event) => onChange({
            ...filters,
            salaryDisclosed: event.target.checked,
          })}
          className="mt-0.5 size-4 accent-[#003B6D] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2"
        />
        Only show jobs with salary information
      </label>
    </div>
  )
}

const FilterGroups = ({
  filters,
  options,
  onChange,
  idPrefix,
}: {
  filters: VacancyFilterState
  options?: JobFilterOptions
  onChange: (filters: VacancyFilterState) => void
  idPrefix: string
}) => {
  const [locationSearch, setLocationSearch] = useState('')
  const [showAllLocations, setShowAllLocations] = useState(false)

  const categoryChoices = choicesWithFallback(options?.categories, JOB_ENUMS.category, filters.category)
  const workModeChoices = choicesWithFallback(options?.workModes, JOB_ENUMS.workMode, filters.workMode)
  const jobTypeChoices = choicesWithFallback(options?.jobTypes, JOB_ENUMS.jobType, filters.jobType)
  const levelChoices = choicesWithFallback(options?.levels, JOB_ENUMS.level, filters.level)
  const locationChoices = choicesWithFallback(options?.locations, [], filters.location)
  const matchingLocations = locationChoices.filter(({ value }) => (
    value.toLocaleLowerCase().includes(locationSearch.trim().toLocaleLowerCase())
  ))
  const visibleLocations = showAllLocations || locationSearch.trim()
    ? matchingLocations
    : matchingLocations.slice(0, 5)
  const additionalFilterCount = Number(Boolean(filters.datePosted))
    + Number(filters.experienceMin !== undefined || filters.experienceMax !== undefined)
    + Number(filters.salaryMin !== undefined)
    + Number(filters.salaryDisclosed)

  return (
    <>
      <FilterGroup label="Job type" selectedCount={filters.jobType.length} initiallyOpen>
        <FilterChoices
          legend="Job type"
          choices={jobTypeChoices}
          selected={filters.jobType}
          onChange={(jobType) => onChange({ ...filters, jobType })}
        />
      </FilterGroup>
      <FilterGroup label="Experience level" selectedCount={filters.level.length} initiallyOpen>
        <FilterChoices
          legend="Experience level"
          choices={levelChoices}
          selected={filters.level}
          onChange={(level) => onChange({ ...filters, level })}
        />
      </FilterGroup>
      <FilterGroup label="Work arrangement" selectedCount={filters.workMode.length} initiallyOpen>
        <FilterChoices
          legend="Work arrangement"
          choices={workModeChoices}
          selected={filters.workMode}
          onChange={(workMode) => onChange({ ...filters, workMode })}
        />
      </FilterGroup>
      <FilterGroup label="Category" selectedCount={filters.category.length}>
        <FilterChoices
          legend="Category"
          choices={categoryChoices}
          selected={filters.category}
          onChange={(category) => onChange({ ...filters, category })}
        />
      </FilterGroup>
      <FilterGroup label="Location" selectedCount={filters.location.length} initiallyOpen>
        <label htmlFor={`${idPrefix}-location-search`} className="sr-only">Search locations</label>
        <input
          id={`${idPrefix}-location-search`}
          type="search"
          value={locationSearch}
          onChange={(event) => {
            setLocationSearch(event.target.value)
            setShowAllLocations(false)
          }}
          placeholder="Search locations…"
          className="mb-2 min-h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#003B6D]"
        />
        {visibleLocations.length > 0 ? (
          <div className="max-h-52 overflow-y-auto">
            <FilterChoices
              legend="Location"
              choices={visibleLocations}
              selected={filters.location}
              maximum={5}
              onChange={(location) => onChange({ ...filters, location })}
            />
          </div>
        ) : (
          <p className="px-1 py-2 text-sm text-gray-500">
            {locationChoices.length ? 'No locations match your search.' : 'No locations are currently available.'}
          </p>
        )}
        {!locationSearch.trim() && locationChoices.length > 5 ? (
          <button
            type="button"
            onClick={() => setShowAllLocations((shown) => !shown)}
            className="mt-1 rounded px-1 py-1 text-xs font-semibold text-[#003B6D] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
          >
            {showAllLocations ? 'Show fewer' : `Show all ${locationChoices.length} locations`}
          </button>
        ) : null}
      </FilterGroup>
      <FilterGroup label="More filters" selectedCount={additionalFilterCount}>
        <AdditionalFields filters={filters} onChange={onChange} />
      </FilterGroup>
    </>
  )
}

const JobFilters = ({
  filters,
  options,
  optionsLoading,
  optionsError,
  onFiltersChange,
  onClearFilters,
}: JobFiltersProps) => {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<VacancyFilterState>(filters)
  const drawerRef = useRef<HTMLDivElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const mobileTriggerRef = useRef<HTMLButtonElement>(null)

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
      label: `Salary from ${new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(filters.salaryMin)}`,
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
    <>
      <aside aria-label="Vacancy filters" className="hidden min-w-0 lg:block">
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-gray-200 pb-3">
            <h2 className="text-base font-semibold text-gray-950">Filter jobs</h2>
            <button
              type="button"
              onClick={onClearFilters}
              disabled={chips.length === 0}
              className="rounded px-1 py-1 text-xs font-semibold text-[#b42318] hover:underline disabled:cursor-default disabled:text-gray-400 disabled:no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
            >
              Clear all
            </button>
          </div>

          <div>
            <FilterGroups
              filters={filters}
              options={options}
              onChange={onFiltersChange}
              idPrefix="desktop"
            />
          </div>
          {optionsLoading ? <p role="status" className="mt-2 text-xs text-gray-500">Loading filter options…</p> : null}
          {optionsError ? <p role="status" className="mt-2 text-xs text-amber-700">Some filter options are unavailable.</p> : null}
        </section>

        {chips.length > 0 ? (
          <section aria-label="Active filters" className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-gray-900">Active filters</h2>
              <span className="text-xs text-gray-500">{chips.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.remove}
                  className="inline-flex items-center gap-1 rounded-full border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2]"
                  aria-label={`Remove filter: ${chip.label}`}
                >
                  {chip.label}
                  <FiX aria-hidden="true" />
                </button>
              ))}
            </div>
          </section>
        ) : null}
      </aside>

      <div className="lg:hidden">
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={openDrawer}
          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
        >
          <FiFilter aria-hidden="true" />
          Filters{chips.length > 0 ? ` (${chips.length})` : ''}
        </button>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
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
                <p className="mt-0.5 text-sm text-gray-500">Choose filters, then show matching vacancies.</p>
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

            <div className="flex-1 overflow-y-auto px-5 py-3">
              <FilterGroups
                filters={draftFilters}
                options={options}
                onChange={setDraftFilters}
                idPrefix="mobile"
              />
              {optionsLoading ? <p role="status" className="mt-2 text-xs text-gray-500">Loading filter options…</p> : null}
              {optionsError ? <p role="status" className="mt-2 text-xs text-amber-700">Some filter options are unavailable.</p> : null}
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-gray-200 bg-white px-5 py-4">
              <button
                type="button"
                onClick={() => setDraftFilters(emptyFilters())}
                className="min-h-11 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D]"
              >
                Clear filters
              </button>
              <button
                type="button"
                onClick={() => {
                  onFiltersChange(draftFilters)
                  closeDrawer()
                }}
                className="min-h-11 rounded-md bg-[#003B6D] px-4 py-2 text-sm font-semibold text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
              >
                Show vacancies
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default JobFilters
