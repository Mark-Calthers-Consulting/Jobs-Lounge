import Image from "next/image";
import Link from "next/link";
import { MdOutlineAssignment } from "react-icons/md";
import { FaCloudArrowUp } from "react-icons/fa6";
import { PiExam } from "react-icons/pi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";



export default function Home() {
  return (
    <div className="flex-1">

      <div className="flex flex-col items-center md:flex-row px-12">
        <section className="w-full md:w-1/2 space-y-6">
          <h1 className="text-[#003B6D] text-4xl md:text-6xl font-bold">Find your dream job<br />  in seconds.</h1>
          <p className="text-lg max-w-md">Our platform connects you with highly qualified job seekers across industries, helping you build your team with ease.</p>
          <Link href='/vacancies' className="bg-[#003B6D] text-white px-6 py-3 rounded-md font-medium hover:bg-blue-800 transition">
            <button>Explore Vacancies</button>
          </Link>
        </section>
        <section className="w-full max-w- borde md:w-1/2 relative h-[400px] md:h-[500px] overflow-hidden">
          <Image src='/hero.webp' fill sizes="50vw" priority className="z-100 object-contain object-right" alt="standing woman" />

          <Image src='/bgcircles.png' height={20} width={20} sizes="50vw" className="absolute -translate-y-1/2 w-100 opacity-20 top-1/2 -right-30" alt="circles" />
        </section>
      </div>

      <section className="w-full text-center">
        <p className="bg-[#161C2D] text-white ">Enthusiastic about experiencing the comprehensive offerings of Jobs Lounge? Watch our video <span className="underline">here</span></p>
      </section>

      <section className="px-12 py-12">
        <h1 className="text-[#161C2D] text-center font-bold text-4xl  mb-12">How It Works</h1>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          <div className="bg-[#3FA2F7] rounded py-12 text-white flex flex-col gap-8 items-center">
            <MdOutlineAssignment size={40} />
            <p className="font-semibold">Step 1</p>
            <h6 className="w-8/12 text-center font-bold text-2xl">Sign up on Platform</h6>
            <p className="w-8/12 text-center text-lg">Begin by signing up, it's quick and easy.</p>
          </div>
          <div className="bg-[#3FA2F7] rounded py-12 text-white flex flex-col gap-8 items-center">
            <FaCloudArrowUp size={40} />
            <p className="font-semibold">Step 2</p>
            <h6 className="w-8/12 text-center font-bold text-2xl">Browse Job Openings</h6>
            <p className="w-8/12 text-center text-lg">Discover and browse through our carefully curated job listings easily.</p>
          </div>
          <div className="bg-[#3FA2F7] rounded py-12 text-white flex flex-col gap-8 items-center">
            <PiExam size={40} />
            <p className="font-semibold">Step 3</p>
            <h6 className="w-8/12 text-center font-bold text-2xl">Tests & Interviews</h6>
            <p className="w-8/12 text-center text-lg">Prepare for success by taking tests and acing interviews effortlessly.</p>
          </div>
          <div className="bg-[#3FA2F7] rounded py-12 text-white flex flex-col gap-8 items-center">
            <IoMdCheckmarkCircleOutline size={40} />
            <p className="font-semibold">Step 1</p>
            <h6 className="w-8/12 text-center font-bold text-2xl">Get Hired</h6>
            <p className="w-8/12 text-center text-lg">Achieve success as you secure your dream job with ease.</p>
          </div>
        </div>
      </section>

      <section className="px-12">
        <div className="relative flex">
          <div className="w-1/2">
            <Image src='/mission.webp' fill sizes="50vw" priority className="z-100 object-contain object-left" alt="mission icon" />
          </div>
          <div className="w-1/2 text-right space-y-4 border">
            <h6>Driving Positive Transformation</h6>
            <h2 className="text-4xl font-black">OUR MISSION</h2>
            <p className="w-8/12 ml-auto leading-8">At Jobs Lounge, our mission is to revolutionize the job search experience by providing a user-friendly platform that seamlessly connects job seekers with employers.</p>
          </div>
        </div>
          <div className="relative flex flex-row-reverse">
          <div className="w-1/2">
            <Image src='/mission.webp' fill sizes="50vw" priority className="z-100 object-contain object-right" alt="mission icon" />
          </div>
          <div className="w-1/2 text-left space-y-4 border">
            <h6>Picturing Tomorrow, Today</h6>
            <h2 className="text-4xl font-black">OUR VISION</h2>
            <p className="w-8/12 mr-auto leading-8">To be the leading online job portal, connecting individuals with meaningful employment opportunities and empowering organizations to build their dream teams, while fostering a dynamic and inclusive global workforce.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
