'use client';

import { useCreatejob } from '@/hooks/useApplications';
import { useUpdateAdminJob } from '@/hooks/useAdmin'
import { JOB_ENUMS } from '@/constants/enums';
import { jobFormSchema } from '@/schemas/jobSchema';
import type { Job } from '@/types/types'
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

const categoryOptions = JOB_ENUMS.category;
const workModeOptions = JOB_ENUMS.workMode;
const jobTypeOptions = JOB_ENUMS.jobType;
const levelOptions = JOB_ENUMS.level;
const statusOptions = ['Draft', 'Open', 'Closed'] as const

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
                    logo: initialJob?.company.logo,
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
                deadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
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

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">{initialJob ? 'Edit Job' : 'Create Job'}</h1>
                <p className="text-sm text-gray-600">
                    {initialJob ? 'Update the listing details below.' : 'Fill in the details below to create a new job listing.'}
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8" aria-busy={activeMutation.isPending}>
                <div className="rounded-xl border border-gray-200 p-4 md:p-6">
                    <h2 className="mb-4 text-lg font-semibold">Job Overview</h2>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col md:col-span-2">
                            <label htmlFor="jobTitle" className={labelClassName}>
                                Job Title
                            </label>
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
                            <label htmlFor="jobDescription" className={labelClassName}>
                                Description
                            </label>
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
                            <label htmlFor="companyName" className={labelClassName}>
                                Company Name
                            </label>
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
                            <label htmlFor="category" className={labelClassName}>
                                Category
                            </label>
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
                            <label htmlFor="jobLocation" className={labelClassName}>
                                Job Location
                            </label>
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
                            <label htmlFor="workMode" className={labelClassName}>
                                Work Mode
                            </label>
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
                            <label htmlFor="jobType" className={labelClassName}>
                                Job Type
                            </label>
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
                            <label htmlFor="level" className={labelClassName}>
                                Job Level
                            </label>
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
                            <label htmlFor="yearsOfExperience" className={labelClassName}>
                                Years of Experience
                            </label>
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
                                Deadline
                            </label>
                            <input
                                className={inputClassName}
                                type="date"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleFieldChange}
                            />
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
