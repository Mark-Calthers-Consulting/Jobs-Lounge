'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { FiArrowUpRight, FiMail, FiMapPin, FiPhone } from 'react-icons/fi'

import { usePlatformSettings } from '@/components/PlatformSettingsProvider'

const exploreLinks = [
    { href: '/vacancies', label: 'Browse vacancies' },
    { href: '/blog', label: 'Career insights' },
    { href: '/contact', label: 'Contact us' },
    { href: '/auth', label: 'Candidate sign in' },
]

const networkLinks = [
    {
        href: 'https://markcalthers.com/',
        label: 'Mark Calthers Consulting',
    },
    {
        href: 'https://connect.markcalthers.com/',
        label: 'Mark Calthers Connect',
    },
    {
        href: 'https://mcmstudio.markcalthers.com/',
        label: 'MCM Studio',
    },
]

const socialLinks = [
    {
        href: 'https://www.instagram.com/markcalthers/',
        label: 'Mark Calthers on Instagram',
        icon: FaInstagram,
    },
    {
        href: 'https://web.facebook.com/markcalthersconsulting',
        label: 'Mark Calthers Consulting on Facebook',
        icon: FaFacebookF,
    },
    {
        href: 'https://www.linkedin.com/company/mark-calthers-consulting-limited/',
        label: 'Mark Calthers Consulting on LinkedIn',
        icon: FaLinkedinIn,
    },
]

const ExternalLink = ({ href, label }: { href: string; label: string }) => (
    <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex w-fit items-center gap-1.5 text-sm text-slate-300 transition-colors hover:text-white"
    >
        <span>{label}</span>
        <FiArrowUpRight
            aria-hidden="true"
            className="text-xs text-slate-500 transition-colors group-hover:text-white"
        />
        <span className="sr-only">(opens in a new tab)</span>
    </a>
)

export default function Footer(): React.JSX.Element {
    const { supportEmail } = usePlatformSettings()
    const currentYear = new Date().getFullYear()

    return (
        <footer className="w-full border-t border-white/10 bg-[#101A35] text-white [&_a:focus-visible]:outline-white">
            <div className="mx-auto max-w-7xl px-6 py-10 sm:px-9 sm:py-12 lg:px-12">
                    <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
                        <div className="sm:col-span-2 lg:col-span-4 lg:pr-10">
                            <Link
                                href="/"
                                aria-label="Jobs Lounge home"
                                className="inline-flex rounded-md"
                            >
                                <Image
                                    src="/logowhite.svg"
                                    width={400}
                                    height={48}
                                    alt=""
                                    className="h-auto w-[210px] max-w-full"
                                />
                            </Link>
                            <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
                                A focused careers platform for discovering opportunities, applying with confidence,
                                and taking the next step.
                            </p>
                            <div className="mt-6 flex items-center gap-2">
                                {socialLinks.map(({ href, label, icon: Icon }) => (
                                    <a
                                        key={label}
                                        href={href}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label={`${label} (opens in a new tab)`}
                                        className="inline-flex size-9 items-center justify-center rounded-full border border-white/15 text-slate-300 transition-colors hover:border-white/30 hover:bg-white/10 hover:text-white"
                                    >
                                        <Icon aria-hidden="true" className="text-sm" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        <nav aria-label="Footer navigation" className="lg:col-span-2">
                            <h2 className="text-sm font-semibold text-white">Explore</h2>
                            <ul className="mt-4 space-y-3">
                                {exploreLinks.map(({ href, label }) => (
                                    <li key={href}>
                                        <Link
                                            href={href}
                                            className="text-sm text-slate-300 transition-colors hover:text-white"
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>

                        <div className="lg:col-span-3">
                            <h2 className="text-sm font-semibold text-white">MCC network</h2>
                            <ul className="mt-4 space-y-3">
                                {networkLinks.map(({ href, label }) => (
                                    <li key={href}>
                                        <ExternalLink href={href} label={label} />
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <address className="not-italic lg:col-span-3">
                            <h2 className="text-sm font-semibold text-white">Get in touch</h2>
                            <div className="mt-4 space-y-3">
                                <a
                                    href={`mailto:${supportEmail}`}
                                    className="flex w-fit items-start gap-2 text-sm leading-5 text-slate-300 transition-colors hover:text-white"
                                >
                                    <FiMail aria-hidden="true" className="mt-0.5 shrink-0 text-slate-500" />
                                    <span className="break-all sm:whitespace-nowrap sm:break-normal">{supportEmail}</span>
                                </a>
                                <a
                                    href="tel:+2348068888885"
                                    className="flex w-fit items-center gap-2 text-sm text-slate-300 transition-colors hover:text-white"
                                >
                                    <FiPhone aria-hidden="true" className="shrink-0 text-slate-500" />
                                    <span>+234 806 888 8885</span>
                                </a>
                                <p className="flex items-start gap-2 text-sm leading-5 text-slate-400">
                                    <FiMapPin aria-hidden="true" className="mt-0.5 shrink-0 text-slate-500" />
                                    <span>Lagos &amp; Abuja, Nigeria</span>
                                </p>
                            </div>
                        </address>
                    </div>

                    <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-5 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                        <p>&copy; {currentYear} Jobs Lounge. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <span>Powered by Mark Calthers Consulting</span>
                            <Link
                                href="/admin-center/login"
                                className="text-slate-400 transition-colors hover:text-white"
                            >
                                Team sign in
                            </Link>
                        </div>
                    </div>
            </div>
        </footer>
    )
}
