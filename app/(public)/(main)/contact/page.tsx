import { IoLocation } from "react-icons/io5";
import { IoMail } from "react-icons/io5";

const Contact: React.FC = () => {
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
                        <p className="text-xl"><a className="underline" href="mailto:support@markcaltherconsulting.com">support@markcaltherconsulting.com</a><br /><a className="underline" href="mailto:contact@mccjobslounge.com">contact@mccjobslounge.com</a></p>
                    </div>
                    <div className="flex gap-3">
                        <IoLocation aria-hidden="true" size={32} color="#473BF0" className="mt-1" />
                        <p className="text-xl">14, Lanre Awolokun Street <br /> Lagos, Nigeria</p>
                    </div>
                </address>
                <form className="w-full max-w-xl rounded bg-[#335F84] px-6 py-10 text-white md:px-12" aria-labelledby="contact-form-title">
                    <h2 id="contact-form-title" className="mb-5 text-2xl font-semibold">Send us a message</h2>
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="name">First & Last Name</label>
                        <input required autoComplete="name" type="text" name="name" id="name" className="w-full bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-4 text-lg font-medium" htmlFor="email">Email</label>
                        <input required autoComplete="email" type="email" name="email" id="email" className="w-full bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="subject">Subject</label>
                        <input required type="text" name="subject" id="subject" className="w-full bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="message">Message</label>
                        <textarea required name="message" id="message" rows={5} className="bg-white px-3 py-2 w-full rounded text-black" />
                    </div>
                    <button type="submit" className="mt-5 w-full rounded bg-[#2F25C9] py-2 text-center text-white">Send</button>
                </form>
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
