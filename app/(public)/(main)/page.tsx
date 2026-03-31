import Image from "next/image";
import Link from "next/link";
import { MdOutlineAssignment } from "react-icons/md";
import { FaCloudArrowUp } from "react-icons/fa6";
import { PiExam } from "react-icons/pi";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { LuUserRound } from "react-icons/lu";
import { Container } from "@/components/Container";



export default function Home() {
  return (
    // <div className="flex-1 max-w-screen-2xl mx-auto">
      <Container>

        <section className="relative">
          <div className="flex flex-col items-center md:flex-row px-12">
            <section className="w-full md:w-1/2 space-y-6">
              <h1 className="text-[#003B6D] text-4xl md:text-6xl font-bold">Find your dream job<br />  in seconds.</h1>
              <p className="text-lg max-w-md">Our platform connects you with highly qualified job seekers across industries, helping you build your team with ease.</p>
              <Link
                href={"/vacancies"}
                className="inline-block bg-[#003B6D] text-white px-6 py-3 cursor-pointer font-medium hover:bg-blue-800 transition"
              >
                Explore Vacancies
              </Link>
            </section>
            <section className="w-full relative borde md:w-1/2  h-[400px] md:h-[500px] overflow-x-hidden">
              <Image src='/hero.webp' fill sizes="50vw" priority className="z-100 object-contain object-right" alt="standing woman" />

              <Image src='/bgcircles.png' height={20} width={20} sizes="50vw" className="absolute z-50 -translate-y-1/2 w-100 right-0 opacity-20 top-1/2" alt="circles" />
            </section>
          </div>
        </section>

        <section className="w-full text-center">
          <p className="bg-[#161C2D] py-3 text-white ">Enthusiastic about experiencing the comprehensive offerings of Jobs Lounge? Watch our video <Link target="_blank" href='https://www.youtube.com/@mcchrtv'><span className="underline cursor-pointer">here</span></Link></p>
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

        <section className="borde py-12 px-12 space-y-12">
          <div className="relative flex flex-col-reverse sm:flex-row ">
            <div className="w-full sm:w-1/2 h-72">
              {/* <Image src='/mission.webp' fill sizes="50vw" priority className="z-100 object-contain object-left" alt="mission icon" /> */}
              <Image
                src="/mission.webp"
                width={600}
                height={400}
                className="object-contain object-left w-full h-full"
                alt="mission icon"
                priority
              />
            </div>
            <div className="w-full sm:w-1/2 text-center sm:text-right space-y-4 borde">
              <h6 className="text-[#335F84]">Driving Positive Transformation</h6>
              <h2 className="text-4xl font-black text-[#003B6D]">OUR MISSION</h2>
              <p className="md:w-8/12 ml-auto leading-8 font-semibold text-[#335F84]">At Jobs Lounge, our mission is to revolutionize the job search experience by providing a user-friendly platform that seamlessly connects job seekers with employers.</p>
            </div>
          </div>

          <div className="relative flex flex-col-reverse sm:flex-row-reverse">
            <div className="w-full sm:w-1/2 h-72">
              <Image
                src="/vision.webp"
                width={600}
                height={400}
                className="object-contain object-right w-full h-full"
                alt="mission icon"
                priority
              />
            </div>
            <div className="w-full sm:w-1/2 text-center sm:text-left space-y-4 borde">
              <h6 className="text-[#335F84]">Picturing Tomorrow, Today</h6>
              <h2 className="text-4xl font-black text-[#003B6D]">OUR VISION</h2>
              <p className="md:w-8/12 mr-auto leading-8 font-semibold text-[#335F84]">To be the leading online job portal, connecting individuals with meaningful employment opportunities and empowering organizations to build their dream teams, while fostering a dynamic and inclusive global workforce.</p>
            </div>
          </div>
        </section>

        <section className="px-12 py-12 bg-[#3C3CC6] my-6 text-center w-[80%] mx-auto rounded-2xl">
          <h2 className="text-white font-black text-5xl">FAQ's</h2>
          <p className="text-white my-3 text-2xl">Frequently Asked Questions</p>

          <div className="text-left max-w-6xl mx-auto grid grid-cols-1 gap-3 md:grid-cols-2">
            <details className="group bg-white p-6 mb-4 max-w-xl h-max" open>
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>How do I create an account on MCC Job Lounge?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                All you need to do is sign up on the website or mobile app
              </p>
            </details>

            <details className="group bg-white p-6 mb-4 max-w-xl h-max" >
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>Can I apply for multiple positions at the same time?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                Yes, you are welcome to apply for multiple roles that match your skills and experience. However, we recommend focusing your applications on the positions that best align with your primary career goals.
              </p>
            </details>

            <details className="group bg-white p-6 mb-4 max-w-xl h-max" >
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>What happens after I submit my application?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                Once submitted, your profile and resume will be reviewed by our recruitment team. If your qualifications match our requirements, we will reach out to you via email to schedule the next steps, which may include an initial screening call or an online assessment.
              </p>
            </details>

            <details className="group bg-white p-6 mb-4 max-w-xl h-max" >
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>How can I get notified about new job openings at MCC?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                To stay updated on the latest opportunities, you can set up "Job Alerts" in your profile settings and we will email you as soon as a matching position is posted.
              </p>
            </details>

            <details className="group bg-white p-6 mb-4 max-w-xl h-max" >
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>Can I update my resume or cover letter after applying for a role?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                You can update your master profile and resume at any time in your Account Settings. However, changes made after you have already submitted an application for a specific role may not reflect on that specific application.
              </p>
            </details>

            <details className="group bg-white p-6 mb-4 max-w-xl h-max" >
              <summary className="flex justify-between items-center cursor-pointer list-none:hidden focus:outline-none text-slate-800 font-semibold">
                <span>How long does the hiring process typically take?</span>
                <span className="flex items-center justify-center w-8 h-8 shrink-0 ml-4 bg-blue-600 text-white text-xl font-normal group-open:bg-blue-600 group-open:text-white">
                  <span className="block group-open:hidden">+</span>
                  <span className="hidden group-open:block">&minus;</span>
                </span>
              </summary>

              <p className="mt-4 text-slate-500 text-sm leading-relaxed pr-10">
                We strive to move quickly, but the process usually takes between 2 to 4 weeks from the application closing date to the final offer, depending on the seniority of the role and the number of interview stages.
              </p>
            </details>
          </div>
        </section>

        <section className="text-center my-6 py-12">
          <Image width={70} height={70} className="mx-auto" src='/logo.svg' alt='logo' />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold my-7 text-[#003B6D]">Be the first to know about new <br /> opportunities at MCC</h2>
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
            <div className="flex relative w-max">
              <LuUserRound color="#7E7E7E" className="absolute left-2 top-1/2 -translate-y-1/2" />
              <input className="border border-[#7E7E7E] rounded-full px-8 py-2 w-72" placeholder="Enter your email" type="text" />
            </div>
            <button className="bg-[#3C3CC6] text-white rounded-full w-48 sm:w-max py-2 px-4 cursor-pointer">Get Alerts</button>
          </div>
        </section>
      </Container>
    // </div>
  );
}
