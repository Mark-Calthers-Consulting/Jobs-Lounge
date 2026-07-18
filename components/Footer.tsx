import Image from "next/image";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

export default function Footer(): React.JSX.Element {
    return (
        <footer className="bg-[#1B1F87] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-white p-12">
            <div className="">
                <Image src='/logowhite.svg' className="mb-6" width={400} height={100} alt="Mark Calthers Consulting" />
                <p className="md:w-10/12 text-sm sm:text-base">Mark Calthers Consulting is a leading management consulting firm that offers a comprehensive range of human resource management and business consulting services. <a className="underline" href="https://markcalthers.com/services/">Read more about our services.</a></p>
            </div>
            <div className="">
                <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl mb-3 lg:mb-6">Contact us</h2>
                <address className="space-y-2 not-italic md:space-y-4 text-sm sm:text-base">
                    <p><a className="underline" href="mailto:info@markcalthers.com">info@markcalthers.com</a></p>
                    <p>14, Lanre Awolokun Street, Gbagada Phase II, Lagos.</p>
                    <p>Suite 12, 2nd Floor, Ogun House, Central Area, Abuja.</p>
                    <p><a className="underline" href="tel:+2348068888885">+234 806 888 8885</a></p>
                </address>
            </div>
            <div className="">
                <h2 className="font-semibold text-xl md:text-2xl lg:text-3xl mb-3 lg:mb-6">Follow us</h2>
                <div className="flex gap-3" aria-hidden="true">
                    <FaInstagram color="white" size={36} />
                    <FaFacebook color="white" size={36} />
                    <FaLinkedinIn color="white" size={36} />
                </div>
            </div>
        </footer>
    )
}
