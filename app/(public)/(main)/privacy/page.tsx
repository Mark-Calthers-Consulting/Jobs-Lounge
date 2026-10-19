import type { Metadata } from 'next'

import LegalPage from '@/components/legal/LegalPage'

const siteUrl = 'https://jobslounge.markcalthers.com'

export const metadata: Metadata = {
    title: 'Privacy Policy | Jobs Lounge',
    description: 'How Jobs Lounge collects, uses, stores, and protects personal information.',
    alternates: { canonical: `${siteUrl}/privacy` },
}

const sections = [
    {
        title: 'Who we are',
        content: (
            <p>
                Jobs Lounge is a careers platform operated by Mark Calthers Consulting Limited. This policy
                explains how we handle personal information when candidates, team members, and visitors use
                Jobs Lounge.
            </p>
        ),
    },
    {
        title: 'Information we collect',
        content: (
            <>
                <p>Depending on how you use Jobs Lounge, we may collect:</p>
                <ul>
                    <li>Account details such as your name, email address, and authentication information.</li>
                    <li>Profile information such as your skills, experience, education, interests, and preferences.</li>
                    <li>Application information, including answers, supporting documents, and the vacancies you apply for.</li>
                    <li>CV files that you choose to upload to your profile.</li>
                    <li>Communications sent through our contact, support, and email preference features.</li>
                    <li>Technical and usage information such as device data, access times, and activity needed to secure and improve the service.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'How we use information',
        content: (
            <>
                <p>We use personal information to:</p>
                <ul>
                    <li>Create and manage accounts and candidate profiles.</li>
                    <li>Process applications and make them available to authorized recruitment staff.</li>
                    <li>Store and provide controlled access to CV files selected by candidates.</li>
                    <li>Send account, application, security, and preference based communications.</li>
                    <li>Operate, secure, troubleshoot, and improve Jobs Lounge.</li>
                    <li>Comply with legal obligations and protect the rights and safety of our users.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Google Drive and Google user data',
        content: (
            <>
                <p>
                    Jobs Lounge uses the Google Drive API with a company controlled Google account to create,
                    store, retrieve, replace, and delete CV files uploaded through Jobs Lounge. Candidates are
                    not asked to grant Jobs Lounge access to their personal Google Drive accounts.
                </p>
                <p>
                    Our access is limited to files and folders created or managed by Jobs Lounge. We do not use
                    this access to scan unrelated files in the connected company account. Google Drive data is
                    used only to provide secure document storage and controlled document access for the Jobs
                    Lounge service.
                </p>
                <p>
                    Jobs Lounge&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                    <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Google API Services User Data Policy
                    </a>
                    , including its Limited Use requirements.
                </p>
            </>
        ),
    },
    {
        title: 'How we share information',
        content: (
            <>
                <p>We share personal information only where needed to operate the service, including with:</p>
                <ul>
                    <li>Authorized recruiters and administrators reviewing relevant applications.</li>
                    <li>Service providers that support hosting, storage, email delivery, security, and analytics.</li>
                    <li>Professional advisers, regulators, or law enforcement where legally required.</li>
                    <li>A successor organization if our business is reorganized, subject to appropriate safeguards.</li>
                </ul>
                <p>We do not sell personal information.</p>
            </>
        ),
    },
    {
        title: 'Storage, retention, and security',
        content: (
            <>
                <p>
                    We use access controls and reasonable technical and organizational safeguards to protect
                    personal information. CV files stored in Google Drive are kept restricted and are accessed
                    through authorized Jobs Lounge services rather than public sharing links.
                </p>
                <p>
                    We retain information for as long as needed to provide the service, maintain appropriate
                    business and recruitment records, resolve disputes, and meet legal obligations. Retention
                    periods may differ by data type. Information is deleted or anonymized when it is no longer
                    reasonably required.
                </p>
            </>
        ),
    },
    {
        title: 'Cookies and analytics',
        content: (
            <p>
                Jobs Lounge may use essential browser storage to keep accounts secure and preserve user choices.
                We may also use analytics to understand aggregate platform usage and improve the service. Where
                applicable law requires consent, we will request it before using nonessential analytics.
            </p>
        ),
    },
    {
        title: 'Your choices and rights',
        content: (
            <>
                <p>
                    You can update much of your profile and communication preferences from your account. You may
                    also ask us to access, correct, delete, restrict, or provide a copy of your personal
                    information, subject to applicable law and legitimate record keeping requirements.
                </p>
                <p>
                    You may withdraw consent where processing relies on consent. This does not affect processing
                    that occurred before withdrawal. You may also unsubscribe from eligible communications using
                    the preference controls or unsubscribe link provided.
                </p>
            </>
        ),
    },
    {
        title: 'International processing',
        content: (
            <p>
                Some service providers may process information outside Nigeria. Where this occurs, we take
                reasonable steps to use appropriate safeguards and require providers to protect the information
                consistently with applicable data protection requirements.
            </p>
        ),
    },
    {
        title: 'Changes to this policy',
        content: (
            <p>
                We may update this policy as Jobs Lounge changes or legal requirements develop. We will publish
                the revised policy here and update the effective date. We may provide an additional notice when a
                change materially affects how we handle personal information.
            </p>
        ),
    },
    {
        title: 'Contact us',
        content: (
            <p>
                For privacy questions or requests, email{' '}
                <a href="mailto:support@jobslounge.markcalthers.com">
                    support@jobslounge.markcalthers.com
                </a>{' '}
                or write to Mark Calthers Consulting Limited at 14, Lanre Awolokun Street, Gbagada Phase II,
                Lagos, Nigeria.
            </p>
        ),
    },
]

export default function PrivacyPage(): React.JSX.Element {
    return (
        <LegalPage
            eyebrow="Your privacy"
            title="Privacy policy"
            summary="This policy explains what information Jobs Lounge collects, why we use it, and the choices available to you."
            effectiveDate="15 October 2026"
            sections={sections}
        />
    )
}
