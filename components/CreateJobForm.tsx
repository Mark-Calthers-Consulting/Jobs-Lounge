'use client';

import { useCreatejob } from '@/hooks/useApplications';
import { useUpdateAdminJob } from '@/hooks/useAdmin'
import { JOB_ENUMS } from '@/constants/enums';
import { jobFormSchema } from '@/schemas/jobSchema';
import type { Job } from '@/types/types'
import Modal from '@/components/Modal';
import { ChangeEvent, FormEvent, KeyboardEvent, useState } from 'react';
import { useRouter } from 'next/navigation'
import { toast } from 'sonner';

type ListFieldKey = 'benefits' | 'responsibilities' | 'requirements' | 'skills';

type JobFormData = {
    jobTitle: string;
    jobDescription: string;
    companyName: string;
    companyWebsite: string;
    category: string;
    jobLocation: string;
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

const categoryOptions = JOB_ENUMS.category;
const workModeOptions = JOB_ENUMS.workMode;
const jobTypeOptions = JOB_ENUMS.jobType;
const levelOptions = JOB_ENUMS.level;
const statusOptions = ['Draft', 'Open', 'Closed'] as const
const maxJsonCharacters = 250_000

const listFieldMeta: Record<
    ListFieldKey,
    { label: string; placeholder: string }
> = {
    benefits: {
        label: 'Benefits',
        placeholder: 'e.g. Health insurance',
    },
    responsibilities: {
        label: 'Responsibilities',
        placeholder: 'e.g. Manage client accounts',
    },
    requirements: {
        label: 'Requirements',
        placeholder: 'e.g. 2+ years of experience',
    },
    skills: {
        label: 'Required Skills',
        placeholder: 'e.g. React',
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

const deadlineAtEndOfDay = (date: string) => new Date(`${date}T23:59:59.999`).toISOString()

const formatImportIssue = (path: PropertyKey[], message: string) => {
    const field = path.length > 0 ? path.join('.') : 'job'
    return `${field}: ${message}`
}

const CreateJobForm = ({ initialJob }: { initialJob?: Job }) => {
    const router = useRouter()
    const [formData, setFormData] = useState<JobFormData>({
        jobTitle: initialJob?.title ?? '',
        jobDescription: initialJob?.description ?? '',
        companyName: initialJob?.company.name ?? '',
        companyWebsite: initialJob?.company.website ?? '',
        category: initialJob?.category ?? '',
        jobLocation: initialJob?.location ?? '',
        workMode: initialJob?.workMode ?? '',
        jobType: initialJob?.jobType ?? '',
        level: initialJob?.level ?? '',
        minSalary: initialJob?.salary?.min?.toString() ?? '',
        maxSalary: initialJob?.salary?.max?.toString() ?? '',
        yearsOfExperience: initialJob?.experience?.toString() ?? '',
        deadline: initialJob?.deadline ? initialJob.deadline.slice(0, 10) : '',
        applyLink: initialJob?.applyLink ?? '',
        status: initialJob?.status ?? 'Open',
    });
    const [companyLogo, setCompanyLogo] = useState(initialJob?.company.logo ?? '')
    const [hasNoDeadline, setHasNoDeadline] = useState(!initialJob?.deadline)
    const [isDevModeEnabled, setIsDevModeEnabled] = useState(false)
    const [isDevModeConfirmationOpen, setIsDevModeConfirmationOpen] = useState(false)
    const [isJsonPanelExpanded, setIsJsonPanelExpanded] = useState(true)
    const [jobJson, setJobJson] = useState('')
    const [importFeedback, setImportFeedback] = useState<ImportFeedback | null>(null)

    const [listInputs, setListInputs] = useState<ListInputs>({
        benefits: '',
        responsibilities: '',
        requirements: '',
        skills: '',
    });

    const createJobMutation = useCreatejob()
    const updateJobMutation = useUpdateAdminJob()
    const activeMutation = initialJob ? updateJobMutation : createJobMutation

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
    };

    const handleListInputChange = (key: ListFieldKey, value: string) => {
        setListInputs((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleDeadlineModeChange = (e: ChangeEvent<HTMLInputElement>) => {
        const noDeadline = e.target.checked
        setHasNoDeadline(noDeadline)
        if (noDeadline) {
            setFormData((previous) => ({ ...previous, deadline: '' }))
        }
    }

    const handleDevModeToggle = (enabled: boolean) => {
        if (enabled) {
            setIsDevModeConfirmationOpen(true)
            return
        }

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

            setFormData({
                jobTitle: job.title,
                jobDescription: job.description,
                companyName: job.company.name,
                companyWebsite: job.company.website ?? '',
                category: job.category,
                jobLocation: job.location,
                workMode: job.workMode,
                jobType: job.jobType,
                level: job.level,
                minSalary: job.salary.min?.toString() ?? '',
                maxSalary: job.salary.max?.toString() ?? '',
                yearsOfExperience: job.experience.toString(),
                deadline: job.deadline?.slice(0, 10) ?? '',
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
            setImportFeedback({
                type: 'success',
                message: 'The JSON was loaded. Review the populated form before creating the job.',
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
                location: formData.jobLocation,
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
                    : deadlineAtEndOfDay(formData.deadline),
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
            } else {
                await createJobMutation.mutateAsync(validation.data)
                toast.success('Job created successfully')
            }
            router.push('/admin-center/jobs')
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message || 'Could not save job');
                return;
            }
            toast.error('Could not save job');
        }
    };

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
                ) : null}
            </div>

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

            <Modal
                isOpen={isDevModeConfirmationOpen}
                onClose={() => setIsDevModeConfirmationOpen(false)}
                onSubmit={confirmDevMode}
                title="Enable Dev Mode?"
                actionLabel="Enable dev mode"
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

            <form onSubmit={handleSubmit} className="space-y-8" aria-busy={activeMutation.isPending}>
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
                                required
                            />
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
                            <label htmlFor="status" className={labelClassName}>Status</label>
                            <select id="status" name="status" value={formData.status} onChange={handleFieldChange} className={inputClassName}>
                                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
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

                        <div className="flex flex-col">
                            <RequiredLabel htmlFor="jobLocation">
                                Job Location
                            </RequiredLabel>
                            <input
                                className={inputClassName}
                                type="text"
                                id="jobLocation"
                                name="jobLocation"
                                value={formData.jobLocation}
                                onChange={handleFieldChange}
                                placeholder="e.g. Lagos, Nigeria"
                                required
                            />
                        </div>

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

                            return (
                                <div key={key}>
                                    <label htmlFor={`${key}-input`} className={`${labelClassName} block`}>
                                        {field.label}
                                    </label>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
                                            id={`${key}-input`}
                                            type="text"
                                            value={listInputs[key]}
                                            onChange={(e) =>
                                                handleListInputChange(key, e.target.value)
                                            }
                                            onKeyDown={(e) => handleListKeyDown(e, key)}
                                            placeholder={field.placeholder}
                                            className={inputClassName}
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

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={activeMutation.isPending}
                        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition disabled:cursor-wait disabled:opacity-70"
                    >
                        {activeMutation.isPending ? 'Saving…' : initialJob ? 'Save changes' : 'Create job'}
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CreateJobForm;
