import { IoLocation } from "react-icons/io5";
import { IoMail } from "react-icons/io5";

const Contact: React.FC = () => {
    return (
        <div>
            <section className="text-center px-12 my-12">
                <h1 className="text-[#1B1F87] font-bold text-5xl">Contact Us</h1>
                <p className="w-1/2 mx-auto text-[#1A1A19]">At MCC Jobs Lounge, we're here to assist you every step of the way. Whether you have a question, need assistance, or want to provide feedback, our dedicated team is ready to help. Get in touch with us today and let's start the conversation.</p>
            </section>
            <section className="px-12 flex justify-evenly items-center relative z-50">
                <div className="space-y-5">
                    <div className="flex gap-4">
                        <IoMail size={32} color="473BF0" className="mt-1" />
                        <p className="text-xl">support@markcaltherconsulting.com <br /> contact@mccjobslounge.com</p>
                    </div>
                    <div className="flex gap-3">
                        <IoLocation size={32} color="473BF0" className="mt-1" />
                        <p className="text-xl">14, Lanre Awolokun Street <br /> Lagos, Nigeria</p>
                    </div>
                </div>
                <form className="bg-[#335F84] rounded space-y-5 text-white py-12 px-24">
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="name">First & Last Name</label>
                        <input type="text" name="name" id="name" className="bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-4 text-lg font-medium" htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" className="bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="name">Subject</label>
                        <input type="text" name="subject" id="subject" className="bg-white px-3 py-2 rounded text-black" />
                    </div>
                    <div className="">
                        <label className="block my-3 text-lg font-medium" htmlFor="name">Message</label>
                        <textarea className="bg-white px-3 py-2 w-full rounded text-black" />
                    </div>
                    <button className="bg-[#473BF0] rounded  w-full py-2 text-center">Send</button>
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