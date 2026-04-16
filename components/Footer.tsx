import Image from "next/image";
import Link from "next/link";
import { FaInstagram } from "react-icons/fa";
import { FaFacebook } from "react-icons/fa";
import { FaLinkedinIn } from "react-icons/fa";

export default function Footer(): React.JSX.Element {
    return (
        <footer className="bg-[#1B1F87] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-white p-12">
            <div className="">
                <Image src='/logowhite.svg' className="mb-6" width={400} height={100} alt="logo white" />
                <p className="md:w-10/12  text-sm sm:text-base">Mark Calthers Consulting is a leading management consulting firm that offers a comprehensive range of human resource management and business consulting services. <span className="underline"><Link href={'https://markcalthers.com/services/'}>Read more.</Link></span></p>
            </div>
            <div className="">
                <h3 className="font-semibold text-xl md:text-2xl lg:text-3xl mb-3 lg:mb-6">CONTACT US</h3>
                <div className="space-y-2 md:space-y-4 text-sm sm:text-base">
                    <p>info@markcalthers.com</p>
                    <p>14, Lanre Awolokun Street, Gbagada Phase ll Gbagada,Lagos.</p>
                    <p>   16 Suite 12, 2nd Floor, Ogun House, Central Area, Abuja.</p>
                    <p>+234 806 888 8885</p>
                </div>
            </div>
            <div className="">
                <h3 className="font-semibold text-xl md:text-2xl lg:text lg:text-3xl mb-3 lg:mb-6">FOLLOW US</h3>
                <div className="flex gap-3">
                    <Link href=''><FaInstagram color="white" size={36} /></Link>
                    <Link href=''><FaFacebook color="white" size={36} /></Link>
                    <Link href=''><FaLinkedinIn color="white" size={36} /></Link>
                </div>
            </div>
        </footer>
    )
}