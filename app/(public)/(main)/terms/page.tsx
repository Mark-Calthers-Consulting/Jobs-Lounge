import type { Metadata } from 'next'

import LegalPage from '@/components/legal/LegalPage'

const siteUrl = 'https://jobslounge.markcalthers.com'

export const metadata: Metadata = {
    title: 'Terms of Service | Jobs Lounge',
    description: 'The terms that apply when using the Jobs Lounge careers platform.',
    alternates: { canonical: `${siteUrl}/terms` },
}

const sections = [
    {
        title: 'About these terms',
        content: (
            <p>
                These terms govern your use of Jobs Lounge, a careers platform operated by Mark Calthers
                Consulting Limited. By creating an account or using the service, you agree to these terms and our{' '}
                <a href="/privacy">Privacy Policy</a>.
            </p>
        ),
    },
    {
        title: 'Accounts and eligibility',
        content: (
            <>
                <p>
                    You must provide accurate account information, protect your sign in details, and notify us if
                    you believe your account has been compromised. You are responsible for activity performed
                    through your account unless caused by our failure to protect the service.
                </p>
                <p>You must be legally able to seek work and enter into these terms under applicable law.</p>
            </>
        ),
    },
    {
        title: 'Candidate profiles and applications',
        content: (
            <>
                <p>
                    Candidates are responsible for keeping profile, CV, and application information accurate and
                    current. You should only upload documents that belong to you or that you are authorized to use.
                </p>
                <p>
                    Submitting an application confirms that it has been received by Jobs Lounge. It does not
                    guarantee an interview, progression to another stage, employment, or a response from an
                    employer. Hiring decisions remain with the relevant employer or recruitment team.
                </p>
            </>
        ),
    },
    {
        title: 'Vacancies and recruitment activity',
        content: (
            <p>
                Vacancy information may change, close, or be withdrawn. We aim to keep listings accurate but do
                not guarantee that every vacancy remains available or that information supplied by an employer is
                complete. Authorized staff must use candidate information only for legitimate recruitment activity
                and in accordance with applicable law.
            </p>
        ),
    },
    {
        title: 'Acceptable use',
        content: (
            <>
                <p>You must not:</p>
                <ul>
                    <li>Provide false, misleading, unlawful, or discriminatory content.</li>
                    <li>Upload malware or attempt to bypass security and access controls.</li>
                    <li>Access another person&apos;s account or collect data without authorization.</li>
                    <li>Interfere with the platform or use automated methods that place an unreasonable load on it.</li>
                    <li>Use Jobs Lounge to send spam, commit fraud, or violate another person&apos;s rights.</li>
                </ul>
            </>
        ),
    },
    {
        title: 'Our content and your content',
        content: (
            <>
                <p>
                    Jobs Lounge and its original design, software, branding, and content belong to Mark Calthers
                    Consulting Limited or its licensors. These terms do not transfer ownership to you.
                </p>
                <p>
                    You retain ownership of content you provide. You give us permission to host, process, display,
                    and share that content only as reasonably required to operate Jobs Lounge and provide the
                    services you request.
                </p>
            </>
        ),
    },
    {
        title: 'Third party services',
        content: (
            <p>
                Jobs Lounge relies on third party services for functions such as hosting, document storage, and
                email delivery. Links to external websites are provided for convenience. Their own terms and
                privacy policies apply when you use them.
            </p>
        ),
    },
    {
        title: 'Availability and changes',
        content: (
            <p>
                We may maintain, update, suspend, or change parts of Jobs Lounge. We do not promise uninterrupted
                or error free availability, but we will take reasonable steps to operate the service reliably and
                protect stored information.
            </p>
        ),
    },
    {
        title: 'Suspension and termination',
        content: (
            <p>
                We may restrict or close an account that violates these terms, creates risk for users or the
                service, or must be restricted to comply with law. You may stop using Jobs Lounge at any time and
                may contact us about closing your account, subject to legitimate retention requirements.
            </p>
        ),
    },
    {
        title: 'Responsibility and liability',
        content: (
            <p>
                Jobs Lounge provides a platform for vacancy discovery and recruitment activity. To the extent
                permitted by law, we are not responsible for hiring decisions, employer conduct, candidate conduct,
                or losses caused by information supplied by another user. Nothing in these terms excludes liability
                that cannot legally be excluded.
            </p>
        ),
    },
    {
        title: 'Governing law',
        content: (
            <p>
                These terms are governed by the laws of the Federal Republic of Nigeria. The parties will first
                try to resolve disputes in good faith before pursuing any remedy available under applicable law.
            </p>
        ),
    },
    {
        title: 'Contact us',
        content: (
            <p>
                Questions about these terms can be sent to{' '}
                <a href="mailto:support@jobslounge.markcalthers.com">
                    support@jobslounge.markcalthers.com
                </a>{' '}
                or Mark Calthers Consulting Limited at 14, Lanre Awolokun Street, Gbagada Phase II, Lagos,
                Nigeria.
            </p>
        ),
    },
]

export default function TermsPage(): React.JSX.Element {
    return (
        <LegalPage
            eyebrow="Using Jobs Lounge"
            title="Terms of service"
            summary="These terms explain the rules and responsibilities that apply when you use Jobs Lounge."
            effectiveDate="15 October 2026"
            sections={sections}
        />
    )
}
