'use client'

import { IoLocation } from "react-icons/io5";
import { IoMail } from "react-icons/io5";
import ContactForm from '@/components/ContactForm'
import { usePlatformSettings } from '@/components/PlatformSettingsProvider'

const Contact: React.FC = () => {
    const { supportEmail } = usePlatformSettings()
    return (
        <div className="max-w-7xl mx-auto">
            <section className="text-center px-12 my-12">
                <h1 className="text-[#1B1F87] font-bold text-5xl">Contact Us</h1>
                <p className="mx-auto max-w-3xl text-[#1A1A19]">At MCC Jobs Lounge, we&apos;re here to assist you every step of the way. Whether you have a question, need assistance, or want to provide feedback, our dedicated team is ready to help. Get in touch with us today and let&apos;s start the conversation.</p>
            </section>
            <section className="relative z-50 flex flex-col items-center justify-evenly gap-8 px-6 md:flex-row md:px-12" aria-labelledby="contact-form-title">
                <address className="space-y-5 not-italic">
                    <div className="flex gap-4">
                        <IoMail aria-hidden="true" size={32} color="#473BF0" className="mt-1" />
                        <p className="text-xl">
                            <a className="underline" href={`mailto:${supportEmail}`}>{supportEmail}</a>
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <IoLocation aria-hidden="true" size={32} color="#473BF0" className="mt-1" />
                        <p className="text-xl">14, Lanre Awolokun Street <br /> Lagos, Nigeria</p>
                    </div>
                </address>
                <ContactForm />
            </section>
            <section className="h-[450px] relative z-10 -mt-[50px]">
                <iframe
                    title="Lagos Map"
                    className="h-full w-full"
                    loading="lazy"
                    src="https://www.openstreetmap.org/export/embed.html?bbox=3.20%2C6.40%2C3.60%2C6.70&layer=mapnik&marker=6.5244%2C3.3792"
                />
            </section>
        </div>
    )
}

export default Contact
