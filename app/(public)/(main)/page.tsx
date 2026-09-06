import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  FiArrowRight,
  FiBookmark,
  FiCheck,
  FiClipboard,
  FiCompass,
  FiSearch,
  FiTarget,
  FiTrendingUp,
  FiUser,
} from 'react-icons/fi'

import HomepageDiscovery from '@/components/HomepageDiscovery'

const origin = 'https://jobslounge.markcalthers.com'

export const metadata: Metadata = {
  title: 'Jobs Lounge | Find your next opportunity',
  description: 'Discover curated vacancies, apply with confidence, and keep track of your next career move with Jobs Lounge.',
  alternates: { canonical: origin },
  openGraph: {
    type: 'website',
    url: origin,
    siteName: 'Jobs Lounge',
    title: 'Jobs Lounge | Find your next opportunity',
    description: 'Discover curated vacancies, apply with confidence, and keep track of your next career move with Jobs Lounge.',
    images: [{ url: `${origin}/hero.jpeg`, alt: '' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Jobs Lounge | Find your next opportunity',
    description: 'Discover curated vacancies, apply with confidence, and keep track of your next career move with Jobs Lounge.',
    images: [`${origin}/hero.jpeg`],
  },
}

const steps = [
  {
    title: 'Create your profile',
    description: 'Tell us about your experience and add a CV link recruiters can access.',
    icon: FiUser,
  },
  {
    title: 'Explore vacancies',
    description: 'Find open roles by category, location, work arrangement, and experience level.',
    icon: FiSearch,
  },
  {
    title: 'Apply with confidence',
    description: 'Review the role carefully and submit your application directly through Jobs Lounge.',
    icon: FiClipboard,
  },
  {
    title: 'Track your applications',
    description: 'Return to your dashboard to see every application and its current status.',
    icon: FiCheck,
  },
]

const reasons = [
  {
    title: 'Curated vacancies',
    description: 'Focus on clearly presented opportunities published through a managed recruitment process.',
    icon: FiCompass,
  },
  {
    title: 'Straightforward applications',
    description: 'Keep your profile and documents ready, then apply without repeating unnecessary steps.',
    icon: FiTarget,
  },
  {
    title: 'One place to keep track',
    description: 'Review submitted applications and vacancies you saved for later from your dashboard.',
    icon: FiBookmark,
  },
  {
    title: 'More relevant discovery',
    description: 'Choose your career interests and receive explainable vacancy recommendations.',
    icon: FiTrendingUp,
  },
]

const faqs = [
  {
    question: 'How do I create a Jobs Lounge account?',
    answer: 'Select Create your profile, enter your basic details, and follow the prompts to prepare your candidate profile. Creating an account is free.',
  },
  {
    question: 'What do I need before I apply?',
    answer: 'You need a valid CV link beginning with http:// or https://. Make sure recruiters can open the link without signing in or requesting access.',
  },
  {
    question: 'Can I apply for more than one vacancy?',
    answer: 'Yes. You can apply for multiple roles when they genuinely match your skills and experience. Each application remains visible in your dashboard.',
  },
  {
    question: 'What happens after I submit an application?',
    answer: 'Your submission appears in Applications on your dashboard. The recruitment team reviews it and may update its status or contact you directly about the next step.',
  },
  {
    question: 'Can I change my CV after applying?',
    answer: 'You can update the CV link on your profile for future applications. An application you have already submitted keeps the document link supplied at the time you applied.',
  },
  {
    question: 'How does Jobs Lounge recommend vacancies?',
    answer: 'Select up to three job categories in your account preferences. Matching open vacancies appear first, followed by other recently published roles you have not applied for.',
  },
]

export default function Home() {
  return (
    <div className="overflow-hidden bg-white">
      <section className="relative isolate flex min-h-[520px] items-center bg-[#101A35] sm:min-h-[560px] lg:min-h-[600px]">
        <Image
          src="/hero.jpeg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-[58%_40%] sm:object-center"
        />
        <div className="absolute inset-0 -z-10 bg-[#071126]/70" />
        <div className="mx-auto w-full max-w-7xl px-5 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <p className="mb-5 text-sm font-semibold text-blue-200">Your next move starts here</p>
            <h1 className="text-balance text-4xl font-bold leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Find the opportunity that moves you forward.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-200 sm:text-lg sm:leading-8">
              Discover roles that match your skills, goals, and ambition in a job search experience built to feel clear, modern, and effortless.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/vacancies" className="inline-flex min-h-12 items-center justify-center gap-2 bg-white px-6 text-sm font-semibold text-[#101A35] transition-colors hover:bg-slate-100">
                Browse opportunities <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/auth?mode=register" className="inline-flex min-h-12 items-center justify-center border border-white/55 px-6 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10">
                Create your profile
              </Link>
            </div>
            <p className="mt-7 text-sm text-slate-300">Curated roles. Clear applications. Progress you can track.</p>
          </div>
        </div>
      </section>

      <HomepageDiscovery />

      <section aria-labelledby="how-it-works-heading" className="bg-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-[#184aa2]">A clearer way to apply</p>
            <h2 id="how-it-works-heading" className="mt-2 text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">How Jobs Lounge works</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Go from discovering a role to following your application without losing track of the details.</p>
          </div>

          <ol className="relative mt-12 grid gap-0 border-y border-slate-200 lg:grid-cols-4 lg:border-y-0 lg:border-t">
            {steps.map(({ title, description, icon: Icon }, index) => (
              <li key={title} className="relative border-b border-slate-200 py-8 last:border-b-0 lg:border-b-0 lg:border-r lg:px-7 lg:py-10 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0">
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center bg-[#101A35] text-sm font-semibold text-white">{index + 1}</span>
                  <Icon aria-hidden="true" className="text-xl text-[#184aa2]" />
                </div>
                <h3 className="mt-7 text-lg font-semibold text-[#101A35]">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Our mission and vision" className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid items-center gap-10 border-b border-slate-200 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
            <div className="order-2 lg:order-1">
              <p className="text-sm font-semibold text-[#184aa2]">Driving positive transformation</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">Our mission</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">At Jobs Lounge, our mission is to revolutionize the job search experience by providing a user-friendly platform that seamlessly connects job seekers with employers.</p>
            </div>
            <div className="order-1 flex min-h-80 items-center justify-center bg-white p-8 lg:order-2 lg:min-h-[420px]">
              <Image src="/illustrations/shared-goals.svg" width={665} height={499} alt="" className="h-auto max-h-80 w-full object-contain" />
            </div>
          </div>

          <div className="grid items-center gap-10 py-16 lg:grid-cols-2 lg:gap-20 lg:py-24">
            <div className="flex min-h-80 items-center justify-center bg-white p-8 lg:min-h-[420px]">
              <Image src="/illustrations/career-development.svg" width={992} height={519} alt="" className="h-auto max-h-80 w-full object-contain" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#184aa2]">Picturing tomorrow, today</p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">Our vision</h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">To be the leading online job portal, connecting individuals with meaningful employment opportunities and empowering organizations to build their dream teams, while fostering a dynamic and inclusive global workforce.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="bg-[#101A35] py-16 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold text-blue-200">Built around your next move</p>
              <h2 id="why-heading" className="mt-3 max-w-md text-3xl font-bold tracking-[-0.025em] sm:text-4xl">Less friction between you and the right opportunity</h2>
              <p className="mt-5 max-w-md text-base leading-7 text-slate-300">Jobs Lounge keeps the important parts of your search organised, understandable, and within reach.</p>
            </div>
            <div className="grid border-t border-white/15 sm:grid-cols-2">
              {reasons.map(({ title, description, icon: Icon }) => (
                <article key={title} className="border-b border-white/15 py-7 sm:px-7 sm:[&:nth-child(odd)]:border-r">
                  <Icon aria-hidden="true" className="text-xl text-blue-200" />
                  <h3 className="mt-5 font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="bg-[#eef4fb] py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20 lg:px-8">
          <div>
            <p className="text-sm font-semibold text-[#184aa2]">Good to know</p>
            <h2 id="faq-heading" className="mt-3 text-3xl font-bold tracking-[-0.025em] text-[#101A35] sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-5 max-w-sm text-base leading-7 text-slate-600">The essentials about setting up your account, applying, and following your progress.</p>
          </div>

          <div className="border-t border-slate-300">
            {faqs.map(({ question, answer }, index) => (
              <details key={question} className="group border-b border-slate-300" open={index === 0}>
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 font-semibold text-[#101A35] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <span aria-hidden="true" className="text-xl font-normal text-[#184aa2]">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 pr-10 text-sm leading-7 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white py-14 sm:py-18">
        <div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <h2 className="text-2xl font-bold tracking-[-0.02em] text-[#101A35] sm:text-3xl">Your next opportunity could be here.</h2>
            <p className="mt-2 text-base text-slate-600">Explore open roles or prepare your profile for the right one.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/vacancies" className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#101A35] px-5 text-sm font-semibold text-white hover:bg-[#172447]">
              Browse vacancies <FiArrowRight aria-hidden="true" />
            </Link>
            <Link href="/auth?mode=register" className="inline-flex min-h-11 items-center justify-center border border-slate-300 px-5 text-sm font-semibold text-[#101A35] hover:border-slate-400 hover:bg-slate-50">
              Create your account
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
