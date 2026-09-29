'use client';

import { useCreateJobBatch, useCreatejob } from '@/hooks/useApplications';
import { useUpdateAdminJob } from '@/hooks/useAdmin'
import { useUser } from '@/hooks/useUsers'
import { JOB_ENUMS } from '@/constants/enums';
import { jobBatchFormSchema, jobFormSchema } from '@/schemas/jobSchema';
import type { Job } from '@/types/types'
import Modal from '@/components/Modal';
import JobUploadGuideModal from '@/components/JobUploadGuideModal'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'
import { dateInputValueInTimeZone } from '@/utils/dateTime'
import {
    buildJobLocation,
    locationToFormValue,
    MAX_JOB_LOCATIONS,
    validateJobLocations,
} from '@/utils/jobLocation'
import {
    CUSTOM_JOB_LOCATION_OPTION,
    NIGERIAN_STATE_OPTIONS,
} from '@/constants/nigeria'
import { getJobDetailSuggestions } from '@/constants/jobDetailSuggestions'
import { ChangeEvent, FormEvent, KeyboardEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation'
import { LuPlus, LuTrash2 } from 'react-icons/lu'
import { toast } from 'sonner';

type ListFieldKey = 'benefits' | 'responsibilities' | 'requirements' | 'skills';

type JobFormData = {
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    companyWebsite: string;
    category: string;
    jobLocationOption: string;
    customJobLocation: string;
    workMode: string;
    jobType: string;
    level: string;
    minSalary: string;
    maxSalary: string;
    yearsOfExperience: string;
    deadline: string;
    applyLink: string;
    status: string;
};

type ListInputs = Record<ListFieldKey, string>;
type ListValues = Record<ListFieldKey, string[]>;
type ImportFeedback = {
    type: 'error' | 'success';
    message: string;
};

type AdditionalJobLocation = {
    id: number;
    option: string;
    custom: string;
};

const categoryOptions = JOB_ENUMS.category;
const workModeOptions = JOB_ENUMS.workMode;
const jobTypeOptions = JOB_ENUMS.jobType;
const levelOptions = JOB_ENUMS.level;
const maxJsonCharacters = 250_000

const publishingStatusOptions = [
    {
        value: 'Draft',
        label: 'Draft',
        description: 'Only administrators can see it. Publish it later from the Jobs page.',
    },
    {
        value: 'Open',
        label: 'Open',
        description: 'Publish immediately and begin accepting applications.',
    },
    {
        value: 'Closed',
        label: 'Closed',
        description: 'Hide the listing and stop accepting applications.',
    },
] as const

const listFieldMeta: Record<
    ListFieldKey,
    { label: string; placeholder: string; helper: string }
> = {
    benefits: {
        label: 'Benefits',
        placeholder: 'e.g. Health insurance',
        helper: 'Add only the benefits this employer actually provides.',
    },
    responsibilities: {
        label: 'Responsibilities',
        placeholder: 'e.g. Manage client accounts',
        helper: 'Use one clear responsibility per item.',
    },
    requirements: {
        label: 'Requirements',
        placeholder: 'e.g. 2+ years of experience',
        helper: 'Include genuine must-haves and avoid unnecessary barriers.',
    },
    skills: {
        label: 'Required Skills',
        placeholder: 'e.g. React',
        helper: 'Add specific tools, knowledge, and practical abilities.',
    },
};

const inputClassName =
    'w-full rounded-md border border-gray-300 px-4 py-2 transition focus:border-black';
const labelClassName = 'mb-1 text-sm font-medium text-gray-800';

const RequiredLabel = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
    <label htmlFor={htmlFor} className={labelClassName}>
        {children} <span aria-hidden="true" className="text-red-600">*</span>
    </label>
)

const formatImportIssue = (path: PropertyKey[], message: string) => {
    const field = path.length > 0 ? path.join('.') : 'job'
    return `${field}: ${message}`
}

const CreateJobFormContent = ({
    initialJob,
}: {
    initialJob?: Job
}) => {
    const router = useRouter()
    const platformSettings = usePlatformSettings()
    const { data: currentUser } = useUser()
    const isSuperAdmin = currentUser?.role === 'super-admin'
    const initialLocation = locationToFormValue(initialJob?.location)
    const [formData, setFormData] = useState<JobFormData>({
        jobTitle: initialJob?.title ?? '',
        jobDescription: initialJob?.description ?? '',
        companyName: initialJob?.company.name ?? '',
        companyWebsite: initialJob?.company.website ?? '',
        category: initialJob?.category ?? '',
        jobLocationOption: initialLocation.option,
        customJobLocation: initialLocation.custom,
        workMode: initialJob?.workMode ?? '',
        jobType: initialJob?.jobType ?? '',
        level: initialJob?.level ?? '',
        minSalary: initialJob?.salary?.min?.toString() ?? '',
        maxSalary: initialJob?.salary?.max?.toString() ?? '',
        yearsOfExperience: initialJob?.experience?.toString() ?? '',
        deadline: initialJob?.deadline
            ? dateInputValueInTimeZone(initialJob.deadline, platformSettings.timeZone)
            : '',
        applyLink: initialJob?.applyLink ?? '',
        status: initialJob?.status ?? 'Draft',
    });
    const [companyLogo, setCompanyLogo] = useState(initialJob?.company.logo ?? '')
    const [hasNoDeadline, setHasNoDeadline] = useState(
        initialJob ? !initialJob.deadline : true,
    )
    const [devModeOverride, setDevModeOverride] = useState<boolean | null>(null)
    const isDevModeEnabled = devModeOverride ?? Boolean(isSuperAdmin && !initialJob)
    const setIsDevModeEnabled = (enabled: boolean) => setDevModeOverride(enabled)
    const [isDevModeConfirmationOpen, setIsDevModeConfirmationOpen] = useState(false)
    const [isJsonPanelExpanded, setIsJsonPanelExpanded] = useState(true)
    const [jobJson, setJobJson] = useState('')
    const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null)
    const [isUploadGuideOpen, setIsUploadGuideOpen] = useState(!initialJob)
    const [additionalLocations, setAdditionalLocations] = useState<AdditionalJobLocation[]>([])
    const [locationError, setLocationError] = useState('')
    const [submissionError, setSubmissionError] = useState('')
    const nextLocationId = useRef(1)
    const locationSelectRefs = useRef<Record<number, HTMLSelectElement | null>>({})

    const [listInputs, setListInputs] = useState<ListInputs>({
        benefits: '',
        responsibilities: '',
        requirements: '',
        skills: '',
    });
    const listInputRefs = useRef<Partial<Record<ListFieldKey, HTMLInputElement | null>>>({})

    const createJobMutation = useCreatejob()
    const createJobBatchMutation = useCreateJobBatch()
    const updateJobMutation = useUpdateAdminJob()
    const isSaving = initialJob
        ? updateJobMutation.isPending
        : createJobMutation.isPending || createJobBatchMutation.isPending

    const [listValues, setListValues] = useState<ListValues>({
        benefits: initialJob?.benefits ?? [],
        responsibilities: initialJob?.responsibilities ?? [],
        requirements: initialJob?.requirements ?? [],
        skills: initialJob?.skills ?? [],
    });

    const handleFieldChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        if (name === 'customJobLocation') setLocationError('')
        setSubmissionError('')
    };

    const handlePrimaryLocationOptionChange = (value: string) => {
        setFormData((previous) => ({
            ...previous,
            jobLocationOption: value,
            customJobLocation: value === CUSTOM_JOB_LOCATION_OPTION
                ? previous.jobLocationOption === CUSTOM_JOB_LOCATION_OPTION
                    ? previous.customJobLocation
                    : ''
                : '',
        }))
        setLocationError('')
        setSubmissionError('')
    }

    const updateAdditionalLocation = (
        id: number,
        update: Partial<Pick<AdditionalJobLocation, 'option' | 'custom'>>,
    ) => {
        setAdditionalLocations((locations) => locations.map((location) => (
            location.id === id ? { ...location, ...update } : location
        )))
        setLocationError('')
        setSubmissionError('')
    }

    const handleAdditionalLocationOptionChange = (id: number, value: string) => {
        setAdditionalLocations((locations) => locations.map((location) => {
            if (location.id !== id) return location
            return {
                ...location,
                option: value,
                custom: value === CUSTOM_JOB_LOCATION_OPTION
                    ? location.option === CUSTOM_JOB_LOCATION_OPTION ? location.custom : ''
                    : '',
            }
        }))
        setLocationError('')
        setSubmissionError('')
    }

    const addLocation = () => {
        if (additionalLocations.length + 1 >= MAX_JOB_LOCATIONS) return
        const id = nextLocationId.current
        nextLocationId.current += 1
        setAdditionalLocations((locations) => [
            ...locations,
            { id, option: '', custom: '' },
        ])
        setLocationError('')
        requestAnimationFrame(() => locationSelectRefs.current[id]?.focus())
    }

    const removeLocation = (id: number) => {
        const index = additionalLocations.findIndex((location) => location.id === id)
        const previousLocationId = index > 0 ? additionalLocations[index - 1]?.id : 0
        setAdditionalLocations((locations) => locations.filter((location) => location.id !== id))
        setLocationError('')
        setSubmissionError('')
        requestAnimationFrame(() => locationSelectRefs.current[previousLocationId]?.focus())
    }

    const handleListInputChange = (key: ListFieldKey, value: string) => {
        setListInputs((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const selectListSuggestion = (key: ListFieldKey, suggestion: string) => {
        handleListInputChange(key, suggestion)
        requestAnimationFrame(() => {
            const input = listInputRefs.current[key]
            input?.focus()
            input?.setSelectionRange(suggestion.length, suggestion.length)
        })
    }

    const handleDeadlineModeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const noDeadline = e.target.checked
        setHasNoDeadline(noDeadline)
        if (noDeadline) {
            setFormData((previous) => ({ ...previous, deadline: '' }))
        }
    }

    const handleDevModeToggle = (enabled: boolean) => {
        if (enabled) {
            if (isSuperAdmin) {
                setIsDevModeEnabled(true)
                setIsDevModeConfirmationOpen(false)
                setIsJsonPanelExpanded(true)
                return
            }

            setIsDevModeConfirmationOpen(true)
            return
        }

        setIsDevModeConfirmationOpen(false)
        setIsDevModeEnabled(false)
        setImportFeedback(null)
    }

    const confirmDevMode = () => {
        setIsDevModeConfirmationOpen(false)
        setIsDevModeEnabled(true)
        setIsJsonPanelExpanded(true)
    }

    const handleJsonImport = () => {
        setImportFeedback(null)

        if (!jobJson.trim()) {
            setImportFeedback({ type: 'error', message: 'Paste a job JSON object first.' })
            return
        }

        if (jobJson.length > maxJsonCharacters) {
            setImportFeedback({ type: 'error', message: 'The JSON input must be 250,000 characters or fewer.' })
            return
        }

        try {
            const parsed: unknown = JSON.parse(jobJson)

            if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
                setImportFeedback({ type: 'error', message: 'The JSON root must be a single job object.' })
                return
            }

            const validation = jobFormSchema.safeParse(parsed)

            if (!validation.success) {
                const issues = validation.error.issues
                    .slice(0, 3)
                    .map((issue) => formatImportIssue(issue.path, issue.message))
                    .join(' • ')
                const remaining = validation.error.issues.length - 3

                setImportFeedback({
                    type: 'error',
                    message: remaining > 0 ? `${issues} • ${remaining} more issue${remaining === 1 ? '' : 's'}` : issues,
                })
                return
            }

            const job = validation.data

            if (job.salary.currency !== 'NGN') {
                setImportFeedback({
                    type: 'error',
                    message: 'salary.currency: this form currently supports NGN only.',
                })
                return
            }

            if (!initialJob && job.status === 'Closed') {
                setImportFeedback({
                    type: 'error',
                    message: 'status: new jobs must be created as Draft or Open.',
                })
                return
            }

            const importedLocation = locationToFormValue(job.location)
            setFormData({
                jobTitle: job.title,
                jobDescription: job.description,
                companyName: job.company.name,
                companyWebsite: job.company.website ?? '',
                category: job.category,
                jobLocationOption: importedLocation.option,
                customJobLocation: importedLocation.custom,
                workMode: job.workMode,
                jobType: job.jobType,
                level: job.level,
                minSalary: job.salary.min?.toString() ?? '',
                maxSalary: job.salary.max?.toString() ?? '',
                yearsOfExperience: job.experience.toString(),
                deadline: job.deadline
                    ? dateInputValueInTimeZone(
                        job.deadline,
                        platformSettings.timeZone,
                    )
                    : '',
                applyLink: job.applyLink ?? '',
                status: job.status,
            })
            setCompanyLogo(job.company.logo ?? '')
            setHasNoDeadline(!job.deadline)
            setListValues({
                benefits: job.benefits,
                responsibilities: job.responsibilities,
                requirements: job.requirements,
                skills: job.skills,
            })
            setListInputs({ benefits: '', responsibilities: '', requirements: '', skills: '' })
            setAdditionalLocations([])
            setLocationError('')
            setSubmissionError('')
            setImportFeedback({
                type: 'success',
                message: 'The JSON was loaded as one location. Review the populated form before creating the job.',
            })
            setIsJsonPanelExpanded(false)
        } catch {
            setImportFeedback({ type: 'error', message: 'The text does not contain valid JSON.' })
        }
    }

    const addListItem = (key: ListFieldKey) => {
        const trimmedValue = listInputs[key].trim();
        if (!trimmedValue) return;

        setListValues((prev) => ({
            ...prev,
            [key]: [...prev[key], trimmedValue],
        }));

        setListInputs((prev) => ({
            ...prev,
            [key]: '',
        }));
    };

    const removeListItem = (key: ListFieldKey, indexToRemove: number) => {
        setListValues((prev) => ({
            ...prev,
            [key]: prev[key].filter((_, index) => index !== indexToRemove),
        }));
    };

    const handleListKeyDown = (
        e: KeyboardEvent<HTMLInputElement>,
        key: ListFieldKey
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addListItem(key);
        }
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmissionError('')

        const locationResult = validateJobLocations([
            buildJobLocation(formData.jobLocationOption, formData.customJobLocation),
            ...additionalLocations.map((location) => (
                buildJobLocation(location.option, location.custom)
            )),
        ])

        if (locationResult.error) {
            setLocationError(locationResult.error)
            locationSelectRefs.current[0]?.focus()
            return
        }
        setLocationError('')

        try {
            // Transform the flat form state into the schema's nested structure
            const validation = jobFormSchema.safeParse({
                title: formData.jobTitle,
                description: formData.jobDescription,
                company: {
                    name: formData.companyName,
                    website: formData.companyWebsite || undefined,
                    logo: companyLogo || undefined,
                },
                category: formData.category,
                location: locationResult.locations[0],
                workMode: formData.workMode,
                jobType: formData.jobType,
                level: formData.level,
                salary: {
                    min: formData.minSalary ? Number(formData.minSalary) : undefined,
                    max: formData.maxSalary ? Number(formData.maxSalary) : undefined,
                    currency: "NGN",
                },
                experience: Number(formData.yearsOfExperience),
                deadline: hasNoDeadline || !formData.deadline
                    ? undefined
                    : formData.deadline,
                applyLink: formData.applyLink || undefined,
                status: formData.status,
                responsibilities: listValues.responsibilities,
                benefits: listValues.benefits,
                requirements: listValues.requirements,
                skills: listValues.skills,
            });

            if (!validation.success) {
                toast.error(validation.error.issues[0]?.message || 'Job data is invalid');
                return;
            }

            if (initialJob) {
                await updateJobMutation.mutateAsync({ jobId: initialJob._id, data: validation.data })
                toast.success('Job updated successfully')
            } else if (locationResult.locations.length > 1) {
                const batchValidation = jobBatchFormSchema.safeParse({
                    job: validation.data,
                    locations: locationResult.locations,
                })
                if (!batchValidation.success) {
                    const message = batchValidation.error.issues[0]?.message || 'Vacancy locations are invalid'
                    setLocationError(message)
                    return
                }
                const result = await createJobBatchMutation.mutateAsync(batchValidation.data)
                toast.success(
                    validation.data.status === 'Draft'
                        ? `${result.count} drafts saved successfully`
                        : `${result.count} vacancies published successfully`,
                )
            } else {
                await createJobMutation.mutateAsync(validation.data)
                toast.success(validation.data.status === 'Draft' ? 'Draft saved successfully' : 'Job published successfully')
            }
            router.push('/admin-center/jobs')
        } catch (error: unknown) {
            const message = error instanceof Error
                ? error.message || 'Could not save the vacancy'
                : 'Could not save the vacancy'
            setSubmissionError(message)
            if (error instanceof Error) {
                toast.error(message);
                return;
            }
            toast.error(message);
        }
    };

    const locationRows = [
        {
            id: 0,
            option: formData.jobLocationOption,
            custom: formData.customJobLocation,
        },
        ...additionalLocations,
    ]
    const locationValues = locationRows.map((location) => (
        buildJobLocation(location.option, location.custom)
    ))
    const liveLocationValidation = validateJobLocations(locationValues)
    const liveDuplicateError = locationValues.every(Boolean)
        ? liveLocationValidation.error
        : undefined
    const displayedLocationError = locationError || liveDuplicateError

    const jsonStatus = importFeedback?.type === 'success'
        ? 'Loaded'
        : importFeedback?.type === 'error'
            ? 'Needs attention'
            : 'Not loaded'
    const jsonStatusClassName = importFeedback?.type === 'success'
        ? 'bg-green-50 text-green-700 ring-green-200'
        : importFeedback?.type === 'error'
            ? 'bg-red-50 text-red-700 ring-red-200'
            : 'bg-gray-100 text-gray-600 ring-gray-200'
    const availablePublishingStatuses = initialJob
        ? publishingStatusOptions
        : publishingStatusOptions.filter((option) => option.value !== 'Closed')
    const vacancyCount = initialJob ? 1 : locationRows.length
    const submitLabel = isSaving
        ? initialJob
            ? 'Saving…'
            : formData.status === 'Draft'
                ? vacancyCount > 1 ? `Saving ${vacancyCount} drafts…` : 'Saving draft…'
                : vacancyCount > 1 ? `Publishing ${vacancyCount} vacancies…` : 'Publishing…'
        : initialJob
            ? 'Save changes'
            : formData.status === 'Draft'
                ? vacancyCount > 1 ? `Save ${vacancyCount} drafts` : 'Save draft'
                : vacancyCount > 1 ? `Publish ${vacancyCount} vacancies` : 'Publish job'

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                <div>
                    <h1 className="text-2xl font-bold">{initialJob ? 'Edit Job' : 'Create Job'}</h1>
                    <p className="text-sm text-gray-600">
                        {initialJob ? 'Update the listing details below.' : 'Fill in the details below to create a new job listing.'}
                    </p>
                    <p className="mt-2 text-xs text-gray-600">
                        Fields marked with <span aria-hidden="true" className="font-semibold text-red-600">*</span> are required.
                    </p>
                </div>

                {!initialJob ? (
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
                        <button
                            type="button"
                            onClick={() => setIsUploadGuideOpen(true)}
                            className="text-sm font-semibold text-[#003B6D] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2"
                        >
                            Job upload guide
                        </button>
                        <label className="flex w-fit cursor-pointer items-center gap-3 text-sm font-medium text-gray-700">
                            <span>Dev mode</span>
                            <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
                                <input
                                    type="checkbox"
                                    role="switch"
                                    checked={isDevModeEnabled || isDevModeConfirmationOpen}
                                    aria-controls="job-json-import-panel"
                                    onChange={(event) => handleDevModeToggle(event.target.checked)}
                                    className="peer sr-only"
                                />
                                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-gray-300 transition peer-checked:bg-[#003B6D] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[#003B6D]" />
                                <span aria-hidden="true" className="absolute left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                            </span>
                        </label>
                    </div>
                ) : null}
            </div>

            {isUploadGuideOpen && !initialJob ? (
                <JobUploadGuideModal onClose={() => setIsUploadGuideOpen(false)} />
            ) : null}

            {isDevModeEnabled && !initialJob ? (
                <section id="job-json-import-panel" aria-labelledby="job-json-import-title" className="mb-6 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex flex-col justify-between gap-3 border-b border-gray-100 px-4 py-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <span aria-hidden="true" className="rounded-md bg-gray-100 px-2 py-1 font-mono text-xs font-semibold text-[#003B6D]">{'{ }'}</span>
                            <div>
                                <h2 id="job-json-import-title" className="text-sm font-semibold text-gray-900">JSON input</h2>
                                <p className="text-xs text-gray-500">Populate the form from a canonical job object.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <span role="status" className={`rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${jsonStatusClassName}`}>
                                {jsonStatus}
                            </span>
                            {!isJsonPanelExpanded ? (
                                <button type="button" onClick={() => setIsJsonPanelExpanded(true)} className="text-sm font-medium text-[#003B6D] hover:underline">
                                    Edit JSON
                                </button>
                            ) : null}
                        </div>
                    </div>

                    {isJsonPanelExpanded ? (
                        <div className="p-4">
                            <label htmlFor="job-json-input" className="sr-only">Job JSON</label>
                            <textarea
                                id="job-json-input"
                                value={jobJson}
                                onChange={(event) => {
                                    setJobJson(event.target.value)
                                    setImportFeedback(null)
                                }}
                                spellCheck={false}
                                placeholder={'{\n  "title": "Frontend Developer",\n  ...\n}'}
                                aria-describedby={`job-json-import-help${importFeedback ? ' job-json-import-feedback' : ''}`}
                                className="min-h-64 w-full resize-y rounded-lg border border-gray-300 bg-gray-50 p-4 font-mono text-sm leading-6 text-gray-900 focus:border-[#003B6D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#003B6D]/15"
                            />

                            {importFeedback ? (
                                <p id="job-json-import-feedback" role={importFeedback.type === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm font-medium ${importFeedback.type === 'error' ? 'text-red-700' : 'text-green-700'}`}>
                                    {importFeedback.message}
                                </p>
                            ) : null}

                            <div className="mt-4 flex flex-col justify-between gap-3 border-t border-gray-100 pt-4 sm:flex-row sm:items-center">
                                <div>
                                    <p id="job-json-import-help" className="text-xs text-gray-500">Loading fills the form but does not save or publish the job.</p>
                                    <p className="mt-1 text-xs text-gray-400" aria-live="polite">{jobJson.length.toLocaleString()} / {maxJsonCharacters.toLocaleString()} characters</p>
                                </div>
                                <div className="flex items-center justify-end gap-3">
                                    <button type="button" onClick={() => { setJobJson(''); setImportFeedback(null) }} disabled={!jobJson} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40">
                                        Clear
                                    </button>
                                    <button type="button" onClick={handleJsonImport} disabled={!jobJson.trim() || jobJson.length > maxJsonCharacters} className="rounded-md bg-[#003B6D] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#002B50] disabled:cursor-not-allowed disabled:opacity-50">
                                        Load into form
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col justify-between gap-3 px-4 py-4 sm:flex-row sm:items-center">
                            <p className="text-sm text-gray-600">The form below has been populated. Review every field before creating the job.</p>
                            <button type="button" onClick={() => handleDevModeToggle(false)} className="w-fit text-sm font-medium text-gray-600 hover:text-gray-900">
                                Exit dev mode
                            </button>
                        </div>
                    )}
                </section>
            ) : null}

            {!isSuperAdmin ? (
                <Modal
                    isOpen={isDevModeConfirmationOpen}
                    onClose={() => setIsDevModeConfirmationOpen(false)}
                    onSubmit={confirmDevMode}
                    title="Enable Dev Mode?"
                    actionLabel="Enable dev mode"
                    size="compact"
                    body={(
                        <div className="space-y-3 text-base leading-7 text-gray-200">
                            <p>Dev Mode lets you paste structured job JSON and use it to overwrite the current form values.</p>
                            <p>Nothing will be saved automatically. You will still review the form and select Create job before the listing is created.</p>
                        </div>
                    )}
                    footer={(
                        <button type="button" onClick={() => setIsDevModeConfirmationOpen(false)} className="w-full rounded-md border border-gray-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10">
                            Cancel
                        </button>
                    )}
                />
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-8" aria-busy={isSaving}>
                <div className="rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="mb-4 text-lg font-semibold">Job Overview</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col md:col-span-2">
                            <RequiredLabel htmlFor="jobTitle">
                                Job Title
                            </RequiredLabel>
                            <input
                                className={inputClassName}
                                type="text"
                                id="jobTitle"
                                name="jobTitle"
                                value={formData.jobTitle}
                                onChange={handleFieldChange}
                                placeholder="e.g. Frontend Developer"
                                required
                            />
                        </div>

                        <div className="flex flex-col md:col-span-2">
                            <RequiredLabel htmlFor="jobDescription">
                                Description
                            </RequiredLabel>
                            <textarea
                                className={`${inputClassName} min-h-[120px]`}
                                id="jobDescription"
                                name="jobDescription"
                                value={formData.jobDescription}
                                onChange={handleFieldChange}
                                placeholder="Describe the role, expectations, and scope"
                                minLength={50}
                                aria-describedby="job-description-help"
                                required
                            />
                            <p id="job-description-help" className="mt-1 text-xs leading-5 text-gray-500">
                                Provide at least 50 characters so candidates can understand the role.
                            </p>
                        </div>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="companyName">
                                Company Name
                            </RequiredLabel>
                            <input
                                className={inputClassName}
                                type="text"
                                id="companyName"
                                name="companyName"
                                value={formData.companyName}
                                onChange={handleFieldChange}
                                placeholder="e.g. Acme Inc."
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="applyLink" className={labelClassName}>External apply link</label>
                            <input className={inputClassName} type="url" id="applyLink" name="applyLink" value={formData.applyLink} onChange={handleFieldChange} placeholder="https://example.com/apply" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="companyWebsite" className={labelClassName}>
                                Company Website
                            </label>
                            <input
                                className={inputClassName}
                                type="url"
                                id="companyWebsite"
                                name="companyWebsite"
                                value={formData.companyWebsite}
                                onChange={handleFieldChange}
                                placeholder="https://example.com"
                            />
                        </div>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="category">
                                Category
                            </RequiredLabel>
                            <select
                                id="category"
                                name="category"
                                value={formData.category}
                                onChange={handleFieldChange}
                                className={inputClassName}
                                required
                            >
                                <option value="">Select a category</option>
                                {categoryOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <fieldset className="md:col-span-2">
                            <legend className="text-base font-semibold text-gray-950">
                                {initialJob ? 'Location' : 'Vacancy locations'}
                                <span aria-hidden="true" className="ml-1 text-red-600">*</span>
                            </legend>
                            <p id="job-location-help" className="mt-1 text-sm leading-6 text-gray-600">
                                {initialJob
                                    ? 'Choose a listed location or enter a more specific location.'
                                    : 'A separate vacancy will be created for each location.'}
                            </p>

                            <div className="mt-3 space-y-3">
                                {locationRows.map((location, index) => {
                                    const selectId = index === 0
                                        ? 'jobLocationOption'
                                        : `jobLocationOption-${location.id}`
                                    const customId = index === 0
                                        ? 'customJobLocation'
                                        : `customJobLocation-${location.id}`
                                    const locationValue = buildJobLocation(location.option, location.custom)

                                    return (
                                        <div
                                            key={location.id}
                                            className="rounded-lg border border-gray-200 bg-gray-50/60 p-4"
                                        >
                                            <div className="mb-2 flex items-center justify-between gap-4">
                                                <label htmlFor={selectId} className="text-sm font-semibold text-gray-800">
                                                    {initialJob ? 'Vacancy location' : `Location ${index + 1}`}
                                                </label>
                                                {!initialJob && index > 0 ? (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeLocation(location.id)}
                                                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-semibold text-red-700 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2"
                                                        aria-label={`Remove location ${index + 1}`}
                                                    >
                                                        <LuTrash2 aria-hidden="true" className="size-4" />
                                                        Remove
                                                    </button>
                                                ) : null}
                                            </div>

                                            <select
                                                ref={(element) => {
                                                    locationSelectRefs.current[location.id] = element
                                                }}
                                                id={selectId}
                                                name={selectId}
                                                value={location.option}
                                                onChange={(event) => {
                                                    if (index === 0) {
                                                        handlePrimaryLocationOptionChange(event.target.value)
                                                        return
                                                    }
                                                    handleAdditionalLocationOptionChange(location.id, event.target.value)
                                                }}
                                                className={inputClassName}
                                                aria-describedby={`job-location-help${displayedLocationError ? ' job-location-error' : ''}`}
                                                aria-invalid={Boolean(displayedLocationError)}
                                                required
                                            >
                                                <option value="">Choose a location</option>
                                                <option value={CUSTOM_JOB_LOCATION_OPTION}>Enter a custom location</option>
                                                <optgroup label="Nigeria">
                                                    {NIGERIAN_STATE_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>{option.label}</option>
                                                    ))}
                                                </optgroup>
                                            </select>

                                            {location.option === CUSTOM_JOB_LOCATION_OPTION ? (
                                                <div className="mt-3">
                                                    <label htmlFor={customId} className={labelClassName}>Enter location</label>
                                                    <input
                                                        className={inputClassName}
                                                        type="text"
                                                        id={customId}
                                                        name={customId}
                                                        value={location.custom}
                                                        onChange={(event) => {
                                                            if (index === 0) {
                                                                setFormData((previous) => ({
                                                                    ...previous,
                                                                    customJobLocation: event.target.value,
                                                                }))
                                                                setLocationError('')
                                                                setSubmissionError('')
                                                                return
                                                            }
                                                            updateAdditionalLocation(location.id, { custom: event.target.value })
                                                        }}
                                                        placeholder="e.g. Gbagada, Lagos; Nationwide; or West Africa"
                                                        maxLength={120}
                                                        required
                                                        aria-describedby={`job-location-help${displayedLocationError ? ' job-location-error' : ''}`}
                                                        aria-invalid={Boolean(displayedLocationError)}
                                                    />
                                                </div>
                                            ) : null}

                                            {locationValue ? (
                                                <p className="mt-2 text-xs text-gray-600">
                                                    Candidates will see <span className="font-semibold text-gray-800">{locationValue}</span>
                                                </p>
                                            ) : null}
                                        </div>
                                    )
                                })}
                            </div>

                            {displayedLocationError ? (
                                <p id="job-location-error" role="alert" className="mt-3 text-sm font-medium text-red-700">
                                    {displayedLocationError}
                                </p>
                            ) : null}

                            {!initialJob ? (
                                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <button
                                        type="button"
                                        onClick={addLocation}
                                        disabled={locationRows.length >= MAX_JOB_LOCATIONS}
                                        className="inline-flex w-fit items-center gap-2 rounded-md border border-gray-300 bg-white px-3.5 py-2 text-sm font-semibold text-gray-800 transition hover:border-gray-500 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <LuPlus aria-hidden="true" className="size-4" />
                                        Add another location
                                    </button>
                                    <p className="text-xs text-gray-500">
                                        {locationRows.length >= MAX_JOB_LOCATIONS
                                            ? `Maximum of ${MAX_JOB_LOCATIONS} locations reached.`
                                            : `Add up to ${MAX_JOB_LOCATIONS - locationRows.length} more ${MAX_JOB_LOCATIONS - locationRows.length === 1 ? 'location' : 'locations'}.`}
                                    </p>
                                </div>
                            ) : null}

                            {!initialJob && locationRows.length > 1 ? (
                                <div className="mt-4 rounded-lg border border-gray-200 bg-white px-4 py-3" aria-live="polite">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Vacancies to create</p>
                                    <ul className="mt-2 space-y-1.5 text-sm text-gray-800">
                                        {locationRows.map((location, index) => (
                                            <li key={location.id}>
                                                <span className="font-semibold">{formData.jobTitle.trim() || 'Untitled vacancy'}</span>
                                                <span className="mx-2 text-gray-400" aria-hidden="true">·</span>
                                                <span>{locationValues[index] || 'Choose a location'}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : null}
                        </fieldset>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="workMode">
                                Work Mode
                            </RequiredLabel>
                            <select
                                id="workMode"
                                name="workMode"
                                value={formData.workMode}
                                onChange={handleFieldChange}
                                className={inputClassName}
                                required
                            >
                                <option value="">Select work mode</option>
                                {workModeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="jobType">
                                Job Type
                            </RequiredLabel>
                            <select
                                id="jobType"
                                name="jobType"
                                value={formData.jobType}
                                onChange={handleFieldChange}
                                className={inputClassName}
                                required
                            >
                                <option value="">Select job type</option>
                                {jobTypeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="level">
                                Job Level
                            </RequiredLabel>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleFieldChange}
                                className={inputClassName}
                                required
                            >
                                <option value="">Select job level</option>
                                {levelOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="minSalary" className={labelClassName}>
                                Minimum Expected Salary
                            </label>
                            <input
                                className={inputClassName}
                                type="number"
                                id="minSalary"
                                name="minSalary"
                                value={formData.minSalary}
                                onChange={handleFieldChange}
                                min="0"
                                placeholder="e.g. 150000"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="maxSalary" className={labelClassName}>
                                Maximum Expected Salary
                            </label>
                            <input
                                className={inputClassName}
                                type="number"
                                id="maxSalary"
                                name="maxSalary"
                                value={formData.maxSalary}
                                onChange={handleFieldChange}
                                min="0"
                                placeholder="e.g. 300000"
                            />
                        </div>

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="yearsOfExperience">
                                Years of Experience
                            </RequiredLabel>
                            <input
                                className={inputClassName}
                                type="number"
                                id="yearsOfExperience"
                                name="yearsOfExperience"
                                value={formData.yearsOfExperience}
                                onChange={handleFieldChange}
                                min="0"
                                placeholder="e.g. 3"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="deadline" className={labelClassName}>
                                Deadline {!hasNoDeadline ? <span aria-hidden="true" className="text-red-600">*</span> : null}
                            </label>
                            <input
                                className={`${inputClassName} disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500`}
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleFieldChange}
                                disabled={hasNoDeadline}
                                required={!hasNoDeadline}
                                aria-describedby="deadline-help"
                            />
                            <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={hasNoDeadline}
                                    onChange={handleDeadlineModeChange}
                                    className="size-4 accent-[#003B6D]"
                                />
                                No application deadline
                            </label>
                            <p id="deadline-help" className="mt-1 text-xs text-gray-600">
                                {hasNoDeadline
                                    ? 'The vacancy remains open until an administrator closes it.'
                                    : 'Applications remain open through the end of the selected day.'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="mb-4 text-lg font-semibold">Job Details</h2>

                    <div className="space-y-6">
                        {(Object.keys(listFieldMeta) as ListFieldKey[]).map((key) => {
                            const field = listFieldMeta[key];
                            const suggestions = getJobDetailSuggestions(key, {
                                category: formData.category,
                                jobType: formData.jobType,
                                level: formData.level,
                                workMode: formData.workMode,
                            })

                            return (
                                <div key={key}>
                                    <RequiredLabel htmlFor={`${key}-input`}>
                                        {field.label}
                                    </RequiredLabel>
                                    <p id={`${key}-help`} className="mb-2 text-xs leading-5 text-gray-500">
                                        {field.helper}
                                    </p>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            ref={(element) => {
                                                listInputRefs.current[key] = element
                                            }}
                                            id={`${key}-input`}
                                            type="text"
                                            value={listInputs[key]}
                                            onChange={(e) =>
                                                handleListInputChange(key, e.target.value)
                                            }
                                            onKeyDown={(e) => handleListKeyDown(e, key)}
                                            placeholder={field.placeholder}
                                            className={inputClassName}
                                            aria-describedby={`${key}-help`}
                                        />

                                        <button
                                            type="button"
                                            aria-label={`Add ${field.label.toLowerCase()} item`}
                                            onClick={() => addListItem(key)}
                                            className="rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <details className="mt-3 border-y border-gray-200 py-2">
                                        <summary className="cursor-pointer select-none text-sm font-medium text-[#003B6D] marker:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#003B6D] focus-visible:ring-offset-2">
                                            Browse suggested {field.label.toLowerCase()}
                                        </summary>
                                        <div className="mt-3 border-t border-gray-100 pt-2">
                                            <p className="mb-2 text-xs leading-5 text-gray-500">
                                                Choose a starting point, edit it in the field above, then add it. Use only what applies to this role.
                                            </p>
                                            <div className="divide-y divide-gray-100">
                                                {suggestions.map((suggestion) => {
                                                    const isAdded = listValues[key].some(
                                                        (item) => item.toLocaleLowerCase() === suggestion.toLocaleLowerCase(),
                                                    )

                                                    return (
                                                        <button
                                                            key={suggestion}
                                                            type="button"
                                                            onClick={() => selectListSuggestion(key, suggestion)}
                                                            disabled={isAdded}
                                                            className="flex w-full items-start justify-between gap-4 px-1 py-2.5 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#003B6D] disabled:cursor-default disabled:text-gray-400"
                                                        >
                                                            <span>{suggestion}</span>
                                                            <span className={`shrink-0 text-xs font-semibold ${isAdded ? 'text-gray-400' : 'text-[#003B6D]'}`}>
                                                                {isAdded ? 'Added' : 'Use'}
                                                            </span>
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    </details>

                                    {listValues[key].length > 0 && (
                                        <ul aria-live="polite" className="mt-3 space-y-2">
                                            {listValues[key].map((item, index) => (
                                                <li
                                                    key={`${item}-${index}`}
                                                    className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                                                >
                                                    <span className="text-sm">{item}</span>
                                                    <button
                                                        type="button"
                                                        aria-label={`Remove ${item} from ${field.label.toLowerCase()}`}
                                                        onClick={() => removeListItem(key, index)}
                                                        className="text-sm text-red-600 hover:underline"
                                                    >
                                                        Remove
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <fieldset className="rounded-xl border border-gray-200 p-4 md:p-6">
                    <legend className="px-1 text-lg font-semibold">Publishing</legend>
                    <p className="mb-4 text-sm text-gray-600">
                        {initialJob ? 'Choose how this vacancy should appear to candidates.' : 'Choose whether to save privately or publish immediately.'}
                    </p>
                    <div className={`grid gap-3 ${availablePublishingStatuses.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
                        {availablePublishingStatuses.map((option) => {
                            const isSelected = formData.status === option.value

                            return (
                                <label
                                    key={option.value}
                                    htmlFor={`status-${option.value.toLowerCase()}`}
                                    className={`flex cursor-pointer gap-3 rounded-lg border p-4 transition ${isSelected ? 'border-[#003B6D] bg-[#F4F9FD] ring-1 ring-[#003B6D]' : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                >
                                    <span className="sr-only">Select job status:</span>
                                    <input
                                        id={`status-${option.value.toLowerCase()}`}
                                        type="radio"
                                        name="status"
                                        value={option.value}
                                        checked={isSelected}
                                        onChange={handleFieldChange}
                                        className="mt-1 size-4 shrink-0 accent-[#003B6D]"
                                    />
                                    <span>
                                        <span className="block text-sm font-semibold text-gray-900">{option.label}</span>
                                        <span className="mt-1 block text-xs leading-5 text-gray-600">{option.description}</span>
                                    </span>
                                </label>
                            )
                        })}
                    </div>
                </fieldset>

                {submissionError ? (
                    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                        <p className="font-semibold">The vacancy was not saved.</p>
                        <p className="mt-1">{submissionError} Your form entries are still here so you can try again.</p>
                    </div>
                ) : null}

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:cursor-wait disabled:opacity-70"
                    >
                        {submitLabel}
                    </button>
                </div>
            </form>
        </section>
    );
};

const CreateJobForm = ({ initialJob }: { initialJob?: Job }) => {
    return <CreateJobFormContent initialJob={initialJob} />
}

export default CreateJobForm;
