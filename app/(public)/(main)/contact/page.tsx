'use client'

import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi'

import ContactForm from '@/components/ContactForm'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'

const Contact = (): React.JSX.Element => {
    const { supportEmail } = usePlatformSettings()

    return (
        <div className="bg-white">
            <section
                aria-labelledby="contact-page-title"
                className="relative isolate min-h-[300px] overflow-hidden bg-[#101A35] text-white lg:min-h-[340px]"
            >
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute -right-28 -top-44 size-[430px] rounded-full border border-white/10" />
                    <div className="absolute -right-5 -top-20 size-[310px] rounded-full border border-white/10" />
                    <div className="absolute right-24 top-12 size-[190px] rounded-full border border-white/10" />
                    <div className="absolute -bottom-28 left-[42%] size-[230px] rounded-full border border-blue-300/10" />
                    <div className="absolute inset-y-0 right-[18%] w-px bg-white/10" />
                </div>

                <div className="relative mx-auto flex min-h-[300px] max-w-7xl items-center px-5 py-14 sm:px-6 sm:py-16 lg:min-h-[340px] lg:px-8">
                    <div className="relative max-w-2xl">
                        <p className="text-sm font-medium text-blue-200">
                            Contact Jobs Lounge
                        </p>
                        <h1
                            id="contact-page-title"
                            className="mt-4 text-4xl font-semibold tracking-[-0.035em] sm:text-5xl lg:text-6xl"
                        >
                            We&apos;re here to help.
                        </h1>
                        <p className="mt-5 max-w-xl text-base leading-7 text-slate-300 sm:text-lg">
                            Questions about your profile, an application, using the platform, or working with
                            Jobs Lounge? Tell us what you need and our team will point you in the right direction.
                        </p>
                    </div>
                </div>
            </section>

            <section
                aria-labelledby="contact-details-title"
                className="mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12 lg:px-8 lg:py-20"
            >
                <div>
                    <p className="text-sm font-medium text-[#1B1F87]">
                        Get in touch
                    </p>
                    <h2
                        id="contact-details-title"
                        className="mt-3 max-w-lg text-3xl font-semibold tracking-[-0.025em] text-slate-950 sm:text-4xl"
                    >
                        Tell us how we can support you.
                    </h2>
                    <p className="mt-4 max-w-lg text-base leading-7 text-slate-600">
                        Send us a message for account assistance, application questions, employer enquiries,
                        feedback, or anything else related to Jobs Lounge.
                    </p>

                    <address className="mt-10 grid gap-x-8 gap-y-7 not-italic sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] bg-blue-50 text-[#1B1F87]">
                                    <FiMail aria-hidden="true" />
                                </span>
                                <h3 className="text-sm font-semibold text-slate-950">Email</h3>
                            </div>
                            <a
                                href={`mailto:${supportEmail}`}
                                className="mt-3 block break-all text-sm leading-6 text-slate-600 transition-colors hover:text-[#1B1F87]"
                            >
                                {supportEmail}
                            </a>
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] bg-blue-50 text-[#1B1F87]">
                                    <FiPhone aria-hidden="true" />
                                </span>
                                <h3 className="text-sm font-semibold text-slate-950">Telephone</h3>
                            </div>
                            <a
                                href="tel:+2348068888885"
                                className="mt-3 block text-sm leading-6 text-slate-600 transition-colors hover:text-[#1B1F87]"
                            >
                                +234 806 888 8885
                            </a>
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] bg-blue-50 text-[#1B1F87]">
                                    <FiMapPin aria-hidden="true" />
                                </span>
                                <h3 className="text-sm font-semibold text-slate-950">Lagos office</h3>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                14, Lanre Awolokun Street, Gbagada Phase II, Lagos.
                            </p>
                        </div>

                        <div className="border-t border-slate-200 pt-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-[3px] bg-blue-50 text-[#1B1F87]">
                                    <FiMapPin aria-hidden="true" />
                                </span>
                                <h3 className="text-sm font-semibold text-slate-950">Abuja office</h3>
                            </div>
                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                Suite 12, 2nd Floor, Ogun House, Central Area, Abuja.
                            </p>
                        </div>
                    </address>
                </div>

                <ContactForm />
            </section>

            <section
                aria-labelledby="contact-map-title"
                className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 lg:px-8 lg:pb-20"
            >
                <div className="mb-6">
                    <p className="text-sm font-medium text-[#1B1F87]">
                        Our location
                    </p>
                    <h2
                        id="contact-map-title"
                        className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-slate-950 sm:text-3xl"
                    >
                        Find our Lagos office
                    </h2>
                </div>
                <div className="h-[340px] overflow-hidden rounded-[3px] border border-slate-200 bg-slate-100 sm:h-[430px]">
                    <iframe
                        title="Map showing the Jobs Lounge Lagos office"
                        className="h-full w-full border-0 grayscale-[20%]"
                        loading="lazy"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=3.20%2C6.40%2C3.60%2C6.70&layer=mapnik&marker=6.5244%2C3.3792"
                    />
                </div>
            </section>
        </div>
    )
}

export default Contact
