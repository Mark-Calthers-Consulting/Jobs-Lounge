import type { Metadata } from 'next'

import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import NotFoundContent from '@/components/NotFoundContent'

export const metadata: Metadata = {
  title: 'Page not found | Jobs Lounge',
}

const NotFound = () => (
  <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex flex-1 items-center">
      <NotFoundContent />
    </main>
    <Footer />
  </div>
)

export default NotFound
