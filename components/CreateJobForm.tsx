'use client';

import { useCreatejob } from '@/hooks/useApplications';
import { ChangeEvent, FormEvent, KeyboardEvent, useState } from 'react';
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
};

type ListInputs = Record<ListFieldKey, string>;
type ListValues = Record<ListFieldKey, string[]>;

const categoryOptions = [
    'FMCG',
    'Manufacturing & Production',
    'Oil, Gas & Energy',
    'Banking, Finance & Insurance',
    'Technology & ICT',
    'Legal, Compliance & Audit',
    'Real Estate & Construction',
    'Consulting & Strategy',
    'Supply Chain, Procurement & Logistics',
    'Human Resources & Admin',
    'Sales, Marketing & Retail',
    'Customer Service & Support',
    'Healthcare & Pharmaceuticals',
    'Hospitality, Travel & Tourism',
    'Education & Training',
    'Engineering (Non-IT)',
    'NGO & Non-Profit',
    'Other',
];

const workModeOptions = ['On-site', 'Hybrid', 'Remote'];

const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Temporary',
    'Internship',
];

const levelOptions = [
    'Entry',
    'Junior',
    'Mid',
    'Senior',
    'Lead',
    'Manager',
    'Executive',
];

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
    'w-full rounded-md border border-gray-300 px-4 py-2 outline-none transition focus:border-black';
const labelClassName = 'mb-1 text-sm font-medium text-gray-800';

const CreateJobForm = () => {
    const [formData, setFormData] = useState<JobFormData>({
        jobTitle: '',
        jobDescription: '',
        companyName: '',
        companyWebsite: '',
        category: '',
        jobLocation: '',
        workMode: '',
        jobType: '',
        level: '',
        minSalary: '',
        maxSalary: '',
        yearsOfExperience: '',
        deadline: '',
    });

    const [listInputs, setListInputs] = useState<ListInputs>({
        benefits: '',
        responsibilities: '',
        requirements: '',
        skills: '',
    });

    const createJobMutation = useCreatejob()

    const [listValues, setListValues] = useState<ListValues>({
        benefits: [],
        responsibilities: [],
        requirements: [],
        skills: [],
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
            const payload = {
                title: formData.jobTitle,
                description: formData.jobDescription,
                company: {
                    name: formData.companyName,
                    website: formData.companyWebsite,
                    // logo: "" // Add this if you implement image uploads later
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
                responsibilities: listValues.responsibilities,
                benefits: listValues.benefits,
                requirements: listValues.requirements,
                skills: listValues.skills,
            };

            console.log('Transformed Payload:', payload);

            await createJobMutation.mutateAsync(payload);
            toast.success("Job created successfully!");

            // Optional: Reset form here
        } catch (error: any) {
            toast.error(error?.response?.data?.message || "Could not create job");
            console.error(error);
        }
    };

    return (
        <section className="w-full max-w-4xl mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Create Job</h1>
                <p className="text-sm text-gray-600">
                    Fill in the details below to create a new job listing.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
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
                            />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="companyWebsite" className={labelClassName}>
                                Company Website
                            </label>
                            <input
                                className={inputClassName}
                                type="string"
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
                                    <label className={`${labelClassName} block`}>
                                        {field.label}
                                    </label>

                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <input
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
                                            onClick={() => addListItem(key)}
                                            className="rounded-md border border-black px-4 py-2 text-sm font-medium hover:bg-black hover:text-white transition"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    {listValues[key].length > 0 && (
                                        <ul className="mt-3 space-y-2">
                                            {listValues[key].map((item, index) => (
                                                <li
                                                    key={`${item}-${index}`}
                                                    className="flex items-center justify-between gap-3 rounded-md border border-gray-200 px-3 py-2"
                                                >
                                                    <span className="text-sm">{item}</span>
                                                    <button
                                                        type="button"
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
                        className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 transition"
                    >
                        Create Job
                    </button>
                </div>
            </form>
        </section>
    );
};

export default CreateJobForm;