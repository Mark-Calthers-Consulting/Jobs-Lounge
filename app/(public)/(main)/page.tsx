import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { FiArrowRight } from 'react-icons/fi'

import HomepageDiscovery from '@/components/HomepageDiscovery'
import HomepageHeroVacancy from '@/components/HomepageHeroVacancy'
import HomepageCareerInsights from '@/components/HomepageCareerInsights'
import PartnerLogoMarquee from '@/components/PartnerLogoMarquee'

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
  },
  {
    title: 'Explore vacancies',
    description: 'Find open roles by category, location, work arrangement, and experience level.',
  },
  {
    title: 'Apply with confidence',
    description: 'Review the role carefully and submit your application directly through Jobs Lounge.',
  },
  {
    title: 'Track your applications',
    description: 'Return to your dashboard to see every application and its current status.',
  },
]

const reasons = [
  {
    title: 'Relevant opportunities',
    description: 'Explore curated vacancies with the details you need to decide what fits.',
  },
  {
    title: 'Straightforward applications',
    description: 'Keep your profile and CV ready, then apply without repeating unnecessary steps.',
  },
  {
    title: 'Application tracking',
    description: 'See submitted applications and saved vacancies together in your dashboard.',
  },
  {
    title: 'Personalised discovery',
    description: 'Choose your interests and receive clear, explainable vacancy recommendations.',
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
      <section className="border-b border-slate-200 bg-[#fbfcfe]">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 py-12 sm:px-6 sm:py-16 lg:min-h-[570px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-16 lg:px-8 lg:py-14">
          <div className="max-w-xl">
            <h1 className="font-editorial text-balance text-[3.35rem] font-normal leading-[0.98] tracking-[-0.045em] text-[#0b1734] sm:text-6xl lg:text-[4.65rem]">
              Find work that moves you forward.
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Discover roles that match your skills, goals, and ambition. Take your next step with clarity.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/vacancies" className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#071a3d] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#102957]">
                Browse vacancies <FiArrowRight aria-hidden="true" />
              </Link>
              <Link href="/auth?mode=register" className="inline-flex min-h-12 items-center justify-center border border-[#071a3d] px-6 text-sm font-semibold text-[#071a3d] transition-colors hover:bg-slate-100">
                Create your profile
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl pb-7 lg:pb-0">
            <span aria-hidden="true" className="absolute -left-8 -top-7 size-48 rounded-full bg-[#dbe8fb] sm:size-60" />
            <span aria-hidden="true" className="absolute -right-[12vw] top-20 h-48 w-40 bg-[#0d4cd3] lg:-right-[8vw]" />
            <div className="relative ml-auto aspect-[1.18/1] w-[92%] overflow-hidden rounded-[88px_48px_64px_64px] bg-slate-200 sm:w-[88%] sm:rounded-[144px_64px_80px_80px]">
              <Image
                src="/hero.jpeg"
                alt=""
                fill
                priority
                sizes="(max-width: 1023px) 90vw, 48vw"
                className="object-cover object-[53%_center]"
              />
            </div>
            <HomepageHeroVacancy />
          </div>
        </div>
      </section>

      <PartnerLogoMarquee />

      <HomepageDiscovery />

      <section aria-labelledby="how-it-works-heading" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-center gap-4">
            <span aria-hidden="true" className="h-9 w-0.5 bg-[#e23845]" />
            <h2 id="how-it-works-heading" className="font-editorial text-3xl font-normal text-[#101A35] sm:text-[2rem]">
              How Jobs Lounge works
            </h2>
          </div>

          <div className="grid overflow-hidden rounded-md lg:grid-cols-[1.45fr_0.85fr]">
            <div className="relative min-h-[320px] bg-slate-200 sm:min-h-[430px] lg:min-h-[500px]">
              <Image
                src="/hero-options/internet-03-team.jpg"
                alt="Professionals discussing work around a table"
                fill
                sizes="(min-width: 1024px) 62vw, 100vw"
                className="object-cover object-center"
              />
            </div>
            <ol className="bg-[#071a3d] px-6 py-5 text-white sm:px-9 sm:py-7 lg:px-8 lg:py-6">
              {steps.map(({ title, description }, index) => (
                <li key={title} className="grid grid-cols-[40px_1fr] gap-4 border-b border-white/15 py-5 last:border-b-0">
                  <span className="font-editorial text-2xl text-[#4f86ff]">0{index + 1}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                    <p className="mt-1.5 text-sm leading-5 text-slate-300">{description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <HomepageCareerInsights />

      <section aria-label="Our mission and vision" className="bg-white py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="relative min-h-[340px] overflow-hidden rounded-md bg-[#071a3d] sm:min-h-[390px]">
            <Image
              src="/hero-options/option-2-career-momentum.png"
              alt=""
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover object-[68%_center] opacity-55 sm:object-center"
            />
            <span aria-hidden="true" className="absolute inset-y-0 right-0 w-2 bg-[#0d4cd3] sm:w-4" />
            <div className="relative flex min-h-[340px] items-center px-7 py-12 sm:min-h-[390px] sm:px-12 lg:px-16">
              <h2 className="max-w-[650px] font-editorial text-[2.75rem] font-normal leading-[1.05] tracking-[-0.035em] text-white sm:text-6xl lg:text-[4rem]">
                Better opportunities.<br />
                Stronger careers.<br />
                Real impact.
              </h2>
            </div>
          </div>

          <div className="grid border-x border-b border-slate-200 md:grid-cols-2">
            <article className="px-7 py-9 sm:px-10 sm:py-11 lg:px-12">
              <span aria-hidden="true" className="block h-0.5 w-8 bg-[#e23845]" />
              <h3 className="mt-5 font-editorial text-3xl font-normal text-[#101A35]">Our mission</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">At Jobs Lounge, our mission is to revolutionize the job search experience by providing a user-friendly platform that seamlessly connects job seekers with employers.</p>
            </article>
            <article className="border-t border-slate-200 px-7 py-9 sm:px-10 sm:py-11 md:border-l md:border-t-0 lg:px-12">
              <span aria-hidden="true" className="block h-0.5 w-8 bg-[#0d4cd3]" />
              <h3 className="mt-5 font-editorial text-3xl font-normal text-[#101A35]">Our vision</h3>
              <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">To be the leading online job portal, connecting individuals with meaningful employment opportunities and empowering organizations to build their dream teams, while fostering a dynamic and inclusive global workforce.</p>
            </article>
          </div>
        </div>
      </section>

      <section aria-labelledby="why-heading" className="bg-white pb-14 sm:pb-18">
        <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 pt-1">
            <span aria-hidden="true" className="h-0.5 w-7 bg-[#e23845]" />
            <h2 id="why-heading" className="font-editorial text-2xl font-normal text-[#101A35]">What you can expect</h2>
          </div>

          <div className="mt-7 grid gap-y-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-y-0">
            {reasons.map(({ title, description }) => (
              <article key={title} className="sm:[&:nth-child(even)]:border-l sm:[&:nth-child(even)]:border-slate-200 sm:[&:nth-child(even)]:pl-8 lg:border-l lg:border-slate-200 lg:pl-8 lg:first:border-l-0 lg:first:pl-0">
                <h3 className="font-editorial text-xl font-normal text-[#101A35]">{title}</h3>
                <p className="mt-2 max-w-[15rem] text-sm leading-6 text-slate-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="border-t border-slate-200 bg-[#fbfcfe] py-14 sm:py-18">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-6 lg:grid-cols-[0.72fr_1.28fr] lg:gap-24 lg:px-8">
          <div className="lg:pt-1">
            <span aria-hidden="true" className="block h-0.5 w-7 bg-[#e23845]" />
            <h2 id="faq-heading" className="mt-5 max-w-xs font-editorial text-3xl font-normal leading-tight text-[#101A35] sm:text-4xl">
              Questions before you apply?
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-6 text-slate-600">Find quick answers here, or speak with us if you need more help.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0d4cd3] underline-offset-4 hover:underline">
              Contact support <FiArrowRight aria-hidden="true" />
            </Link>
          </div>

          <div className="border-t border-slate-300">
            {faqs.map(({ question, answer }, index) => (
              <details key={question} className="group border-b border-slate-300" open={index === 0}>
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-6 py-4 text-sm font-semibold text-[#101A35] marker:content-none [&::-webkit-details-marker]:hidden">
                  <span>{question}</span>
                  <span aria-hidden="true" className="shrink-0 text-xl font-normal text-[#184aa2]">
                    <span className="group-open:hidden">+</span>
                    <span className="hidden group-open:inline">−</span>
                  </span>
                </summary>
                <p className="max-w-2xl pb-5 pr-10 text-sm leading-6 text-slate-600">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0d4cd3] text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <h2 className="font-editorial text-2xl font-normal sm:text-[2rem]">Your next opportunity is closer than you think.</h2>
          <Link href="/vacancies" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-3 bg-white px-5 text-sm font-semibold text-[#0b1734] transition-colors hover:bg-slate-100">
            Browse vacancies <FiArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  )
}
