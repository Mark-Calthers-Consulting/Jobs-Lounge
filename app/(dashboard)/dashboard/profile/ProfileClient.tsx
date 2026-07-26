'use client'

import {
    documentsProfileSchema,
    identityProfileSchema,
    personalProfileSchema,
    professionalProfileSchema,
    type DocumentsProfileValues,
    type IdentityProfileValues,
    type PersonalProfileValues,
    type ProfessionalProfileValues,
} from '@/schemas/profileSchema'
import { useEditUserDetails, useUser } from '@/hooks/useUsers'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, type ReactNode } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { FiCheck, FiExternalLink } from 'react-icons/fi'
import { toast } from 'sonner'

const EDUCATION_SUGGESTIONS = [
    'Secondary school',
    'National Diploma (ND)',
    'Nigeria Certificate in Education (NCE)',
    'Higher National Diploma (HND)',
    "Bachelor's degree",
    'Postgraduate diploma',
    "Master's degree",
    'Doctorate',
]

const inputClass = 'mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#184aa2] focus:ring-2 focus:ring-[#184aa2]/20'
const labelClass = 'block text-sm font-medium text-gray-800'

const emptyToNull = (value?: string) => value?.trim() || null
const safeHttpUrl = (value?: string) => {
    if (!value) return undefined
    try {
        const url = new URL(value)
        return ['http:', 'https:'].includes(url.protocol) ? url.toString() : undefined
    } catch {
        return undefined
    }
}

const Field = ({
    id,
    label,
    error,
    children,
    optional = false,
}: {
    id: string
    label: string
    error?: string
    children: ReactNode
    optional?: boolean
}) => (
    <div>
        <label htmlFor={id} className={labelClass}>
            {label} {optional && <span className="font-normal text-gray-500">(optional)</span>}
        </label>
        {children}
        {error && <p id={`${id}-error`} role="alert" className="mt-1 text-sm text-red-700">{error}</p>}
    </div>
)

const Section = ({
    title,
    description,
    children,
}: {
    title: string
    description: string
    children: ReactNode
}) => (
    <section className="rounded-xl border border-gray-200 bg-white p-5 sm:p-6">
        <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-950">{title}</h2>
            <p className="mt-1 text-sm text-gray-600">{description}</p>
        </div>
        {children}
    </section>
)

const SaveButton = ({ pending }: { pending: boolean }) => (
    <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-[#184aa2] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#123d87] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#184aa2] focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60"
    >
        {pending ? 'Saving…' : 'Save changes'}
    </button>
)

const RootError = ({ message }: { message?: string }) => (
    message ? <p role="alert" className="text-sm text-red-700">{message}</p> : null
)

const ProfileClient = () => {
    const { data: user, isLoading, isError, error } = useUser()
    const identityMutation = useEditUserDetails()
    const professionalMutation = useEditUserDetails()
    const documentsMutation = useEditUserDetails()
    const personalMutation = useEditUserDetails()

    const identityForm = useForm<IdentityProfileValues>({
        resolver: zodResolver(identityProfileSchema),
        defaultValues: { firstName: '', middleName: '', lastName: '', telephone: '', whatsapp: '' },
    })
    const professionalForm = useForm<ProfessionalProfileValues>({
        resolver: zodResolver(professionalProfileSchema),
        defaultValues: {
            highestEducation: '',
            nyscStatus: 'not-started',
            yearCompletedNysc: '',
            postNyscExperience: '',
        },
    })
    const documentsForm = useForm<DocumentsProfileValues>({
        resolver: zodResolver(documentsProfileSchema),
        defaultValues: { cvLink: '', coverLetterLink: '' },
    })
    const personalForm = useForm<PersonalProfileValues>({
        resolver: zodResolver(personalProfileSchema),
        defaultValues: { otherName: '', gender: '', dob: '', maritalStatus: '', residentialAddress: '' },
    })
    const nyscStatus = useWatch({
        control: professionalForm.control,
        name: 'nyscStatus',
    })

    useEffect(() => {
        if (!user) return
        identityForm.reset({
            firstName: user.firstName ?? '',
            middleName: user.middleName ?? '',
            lastName: user.lastName ?? '',
            telephone: user.telephone ?? '',
            whatsapp: user.whatsapp ?? '',
        })
        professionalForm.reset({
            highestEducation: user.highestEducation ?? '',
            nyscStatus: user.nyscStatus ?? 'not-started',
            yearCompletedNysc: user.yearCompletedNysc?.toString() ?? '',
            postNyscExperience: user.postNyscExperience?.toString() ?? '',
        })
        documentsForm.reset({
            cvLink: user.cvLink ?? '',
            coverLetterLink: user.coverLetterLink ?? '',
        })
        personalForm.reset({
            otherName: user.otherName ?? '',
            gender: user.gender ?? '',
            dob: user.dob ? user.dob.slice(0, 10) : '',
            maritalStatus: user.maritalStatus ?? '',
            residentialAddress: user.residentialAddress ?? '',
        })
    }, [user, identityForm, professionalForm, documentsForm, personalForm])

    const save = async (
        mutation: ReturnType<typeof useEditUserDetails>,
        setRootError: (message: string) => void,
        payload: Record<string, unknown>,
    ) => {
        try {
            await mutation.mutateAsync(payload)
            toast.success('Profile section updated')
        } catch (caught) {
            const message = caught instanceof Error ? caught.message : 'Unable to update profile'
            setRootError(message)
            toast.error(message)
        }
    }

    if (isLoading) return <p role="status">Loading profile…</p>
    if (isError || !user) {
        return <p role="alert" className="text-red-700">{error?.message || 'Unable to load your profile.'}</p>
    }

    const completion = user.profileCompletion
    const currentCvUrl = safeHttpUrl(user.cvLink)

    return (
        <div className="mx-auto max-w-4xl space-y-5">
            <header>
                <h1 className="text-3xl font-bold text-gray-950">My profile</h1>
                <p className="mt-2 text-gray-600">Keep your information current so recruiters can review your applications confidently.</p>
            </header>

            {completion && (
                <section aria-labelledby="profile-progress-title" className="rounded-xl border border-blue-100 bg-blue-50/60 p-5">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 id="profile-progress-title" className="font-semibold text-[#123d87]">
                                {completion.complete ? 'Profile complete' : `${completion.completedSteps} of ${completion.totalSteps} steps complete`}
                            </h2>
                            <p className="mt-1 text-sm text-gray-700">
                                {completion.complete
                                    ? 'Your recruitment profile has the essential information.'
                                    : 'Complete the remaining sections when you are ready.'}
                            </p>
                        </div>
                        <span className="text-sm font-semibold text-[#184aa2]">{completion.percentage}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
                        <div className="h-full rounded-full bg-[#184aa2]" style={{ width: `${completion.percentage}%` }} />
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                        {completion.steps.map((step) => (
                            <li key={step.id} className="flex items-center gap-2 text-sm text-gray-700">
                                <span className={`grid h-5 w-5 place-items-center rounded-full ${step.complete ? 'bg-emerald-100 text-emerald-700' : 'border border-gray-300 bg-white text-gray-400'}`}>
                                    {step.complete && <FiCheck aria-hidden="true" size={13} />}
                                </span>
                                {step.label}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <Section title="Identity and contact" description="Your primary contact details. Your email address is managed through your account.">
                <form
                    className="space-y-5"
                    noValidate
                    onSubmit={identityForm.handleSubmit((values) => save(
                        identityMutation,
                        (message) => identityForm.setError('root', { message }),
                        {
                            ...values,
                            middleName: emptyToNull(values.middleName),
                            whatsapp: emptyToNull(values.whatsapp),
                        },
                    ))}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="profile-first-name" label="First name" error={identityForm.formState.errors.firstName?.message}>
                            <input id="profile-first-name" className={inputClass} aria-invalid={Boolean(identityForm.formState.errors.firstName)} {...identityForm.register('firstName')} />
                        </Field>
                        <Field id="profile-middle-name" label="Middle name" optional error={identityForm.formState.errors.middleName?.message}>
                            <input id="profile-middle-name" className={inputClass} {...identityForm.register('middleName')} />
                        </Field>
                        <Field id="profile-last-name" label="Last name" error={identityForm.formState.errors.lastName?.message}>
                            <input id="profile-last-name" className={inputClass} aria-invalid={Boolean(identityForm.formState.errors.lastName)} {...identityForm.register('lastName')} />
                        </Field>
                        <Field id="profile-email" label="Email address">
                            <input id="profile-email" className={`${inputClass} bg-gray-50 text-gray-600`} value={user.email} readOnly />
                        </Field>
                        <Field id="profile-telephone" label="Phone number" error={identityForm.formState.errors.telephone?.message}>
                            <input id="profile-telephone" type="tel" className={inputClass} aria-invalid={Boolean(identityForm.formState.errors.telephone)} {...identityForm.register('telephone')} />
                        </Field>
                        <Field id="profile-whatsapp" label="WhatsApp number" optional error={identityForm.formState.errors.whatsapp?.message}>
                            <input id="profile-whatsapp" type="tel" className={inputClass} {...identityForm.register('whatsapp')} />
                        </Field>
                    </div>
                    <RootError message={identityForm.formState.errors.root?.message} />
                    <SaveButton pending={identityMutation.isPending} />
                </form>
            </Section>

            <Section title="Professional profile" description="Tell recruiters about your education and experience.">
                <form
                    className="space-y-5"
                    noValidate
                    onSubmit={professionalForm.handleSubmit((values) => save(
                        professionalMutation,
                        (message) => professionalForm.setError('root', { message }),
                        {
                            highestEducation: values.highestEducation,
                            nyscStatus: values.nyscStatus,
                            yearCompletedNysc: values.nyscStatus === 'completed'
                                ? Number(values.yearCompletedNysc)
                                : null,
                            postNyscExperience: Number(values.postNyscExperience),
                        },
                    ))}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="profile-education" label="Highest education" error={professionalForm.formState.errors.highestEducation?.message}>
                            <>
                                <input id="profile-education" list="education-suggestions" className={inputClass} {...professionalForm.register('highestEducation')} />
                                <datalist id="education-suggestions">
                                    {EDUCATION_SUGGESTIONS.map((option) => <option key={option} value={option} />)}
                                </datalist>
                            </>
                        </Field>
                        <Field id="profile-nysc-status" label="NYSC status" error={professionalForm.formState.errors.nyscStatus?.message}>
                            <select id="profile-nysc-status" className={inputClass} {...professionalForm.register('nyscStatus')}>
                                <option value="completed">Completed</option>
                                <option value="exempted">Exempted</option>
                                <option value="not-started">Not started</option>
                            </select>
                        </Field>
                        {nyscStatus === 'completed' && (
                            <Field id="profile-nysc-year" label="NYSC completion year" error={professionalForm.formState.errors.yearCompletedNysc?.message}>
                                <input id="profile-nysc-year" type="number" min="1960" max={new Date().getFullYear()} className={inputClass} {...professionalForm.register('yearCompletedNysc')} />
                            </Field>
                        )}
                        <Field id="profile-experience" label="Post-NYSC experience (years)" error={professionalForm.formState.errors.postNyscExperience?.message}>
                            <input id="profile-experience" type="number" min="0" max="60" step="1" className={inputClass} {...professionalForm.register('postNyscExperience')} />
                        </Field>
                    </div>
                    <RootError message={professionalForm.formState.errors.root?.message} />
                    <SaveButton pending={professionalMutation.isPending} />
                </form>
            </Section>

            <Section title="Documents" description="Use shareable links that recruiters can open without requesting access.">
                <form
                    className="space-y-5"
                    noValidate
                    onSubmit={documentsForm.handleSubmit((values) => save(
                        documentsMutation,
                        (message) => documentsForm.setError('root', { message }),
                        {
                            cvLink: values.cvLink,
                            coverLetterLink: emptyToNull(values.coverLetterLink),
                        },
                    ))}
                >
                    <Field id="profile-cv" label="CV link" error={documentsForm.formState.errors.cvLink?.message}>
                        <input id="profile-cv" type="url" inputMode="url" placeholder="https://example.com/my-cv" className={inputClass} {...documentsForm.register('cvLink')} />
                    </Field>
                    <Field id="profile-cover-letter" label="Cover-letter link" optional error={documentsForm.formState.errors.coverLetterLink?.message}>
                        <input id="profile-cover-letter" type="url" inputMode="url" placeholder="https://example.com/my-cover-letter" className={inputClass} {...documentsForm.register('coverLetterLink')} />
                    </Field>
                    <div className="flex flex-wrap items-center gap-3">
                        <SaveButton pending={documentsMutation.isPending} />
                        {currentCvUrl && (
                            <a href={currentCvUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-[#184aa2] underline-offset-4 hover:underline">
                                View current CV <FiExternalLink aria-hidden="true" />
                            </a>
                        )}
                    </div>
                    <RootError message={documentsForm.formState.errors.root?.message} />
                </form>
            </Section>

            <Section title="Optional personal details" description="These details are optional and do not affect profile completion.">
                <form
                    className="space-y-5"
                    noValidate
                    onSubmit={personalForm.handleSubmit((values) => save(
                        personalMutation,
                        (message) => personalForm.setError('root', { message }),
                        {
                            otherName: emptyToNull(values.otherName),
                            gender: values.gender || null,
                            dob: values.dob || null,
                            maritalStatus: values.maritalStatus || null,
                            residentialAddress: emptyToNull(values.residentialAddress),
                        },
                    ))}
                >
                    <div className="grid gap-4 sm:grid-cols-2">
                        <Field id="profile-other-name" label="Other name" optional error={personalForm.formState.errors.otherName?.message}>
                            <input id="profile-other-name" className={inputClass} {...personalForm.register('otherName')} />
                        </Field>
                        <Field id="profile-gender" label="Gender" optional error={personalForm.formState.errors.gender?.message}>
                            <select id="profile-gender" className={inputClass} {...personalForm.register('gender')}>
                                <option value="">Prefer not to provide</option>
                                <option value="female">Female</option>
                                <option value="male">Male</option>
                                <option value="other">Other</option>
                            </select>
                        </Field>
                        <Field id="profile-dob" label="Date of birth" optional error={personalForm.formState.errors.dob?.message}>
                            <input id="profile-dob" type="date" max={new Date().toISOString().slice(0, 10)} className={inputClass} {...personalForm.register('dob')} />
                        </Field>
                        <Field id="profile-marital-status" label="Marital status" optional error={personalForm.formState.errors.maritalStatus?.message}>
                            <select id="profile-marital-status" className={inputClass} {...personalForm.register('maritalStatus')}>
                                <option value="">Prefer not to provide</option>
                                <option value="single">Single</option>
                                <option value="married">Married</option>
                                <option value="divorced">Divorced</option>
                                <option value="widowed">Widowed</option>
                            </select>
                        </Field>
                    </div>
                    <Field id="profile-address" label="Residential address" optional error={personalForm.formState.errors.residentialAddress?.message}>
                        <textarea id="profile-address" rows={3} maxLength={500} className={inputClass} {...personalForm.register('residentialAddress')} />
                    </Field>
                    <RootError message={personalForm.formState.errors.root?.message} />
                    <SaveButton pending={personalMutation.isPending} />
                </form>
            </Section>
        </div>
    )
}

export default ProfileClient
