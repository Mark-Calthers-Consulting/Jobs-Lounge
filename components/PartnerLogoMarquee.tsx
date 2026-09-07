'use client'

import Image from 'next/image'
import { useState } from 'react'

const organizations = [
  {
    name: 'Coca-Cola',
    src: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/Coca-Cola_logo.svg',
    width: 400,
    height: 130,
    imageClassName: 'w-32',
  },
  {
    name: 'Access Bank',
    src: 'https://global.ariseplay.com/amg/www.thisdaylive.com/uploads/Access-Bank.png',
    width: 809,
    height: 500,
    imageClassName: 'w-32',
  },
  {
    name: 'Lufthansa',
    src: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/Lufthansa_Logo_2018.svg',
    width: 600,
    height: 139,
    imageClassName: 'w-36',
  },
  {
    name: 'Arik Air',
    src: 'https://arikair.com/assets/images/logo.png',
    width: 129,
    height: 55,
    imageClassName: 'w-32 brightness-0',
  },
  {
    name: 'Nigerian Bottling Company',
    src: 'https://www.businesslist.com.ng/img/ng/d/1606407605-76-nigeria-bottling-company.png',
    width: 600,
    height: 424,
    imageClassName: 'w-24',
  },
  {
    name: 'Nigerian Breweries',
    src: 'https://www.nbplc.com/wp-content/uploads/elementor/thumbs/Nigerian-Breweries-PLC-Logo-pm0gzum3j8fis9d8drd0av8uespkmpsaie97avob1k.png',
    width: 100,
    height: 100,
    imageClassName: 'w-12',
  },
]

const LogoImage = ({ organization }: { organization: (typeof organizations)[number] }) => {
  const [failed, setFailed] = useState(false)

  if (failed) {
    return (
      <span aria-hidden="true" className="text-center text-sm font-semibold leading-tight text-slate-700">
        {organization.name}
      </span>
    )
  }

  return (
    <Image
      src={organization.src}
      alt=""
      width={organization.width}
      height={organization.height}
      sizes="176px"
      onError={() => setFailed(true)}
      className={`h-auto shrink-0 object-contain ${organization.imageClassName}`}
    />
  )
}

const LogoSet = ({ duplicate = false }: { duplicate?: boolean }) => (
  <div aria-hidden={duplicate || undefined} className="flex shrink-0 items-center gap-6 pr-6 sm:gap-8 sm:pr-8">
    {organizations.map((organization) => (
      <div
        key={organization.name}
        aria-label={duplicate ? undefined : organization.name}
        className="flex h-14 w-36 shrink-0 items-center justify-center overflow-hidden opacity-75 grayscale transition-[filter,opacity] hover:opacity-100 hover:grayscale-0 sm:w-44"
      >
        <LogoImage organization={organization} />
        {!duplicate ? <span className="sr-only">{organization.name}</span> : null}
      </div>
    ))}
  </div>
)

export default function PartnerLogoMarquee() {
  return (
    <section aria-labelledby="organizations-heading" className="border-b border-slate-200 bg-white">
      <h2 id="organizations-heading" className="sr-only">Organizations working with Jobs Lounge</h2>
      <div className="logo-marquee overflow-hidden px-4 sm:px-6">
        <div className="logo-marquee__track flex w-max items-center py-5 sm:py-6">
          <LogoSet />
          <LogoSet duplicate />
        </div>
      </div>
    </section>
  )
}
