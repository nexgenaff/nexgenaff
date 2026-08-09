import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CPC Affiliate Offers — Afficixo',
  description:
    'Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.',
  keywords: [
    'CPC affiliate offers',
    'affiliate marketplace',
    'pay per click offers',
    'tracking links',
    'valid clicks',
    'publisher campaigns',
    'affiliate traffic',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/offers',
  },
  openGraph: {
    title: 'CPC Affiliate Offers — Afficixo',
    description:
      'Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.',
    type: 'website',
    url: 'https://www.weebly.pro/offers',
    siteName: 'Afficixo',
    images: [
      {
        url: 'https://www.weebly.pro/og-image.png',
        secureUrl: 'https://www.weebly.pro/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Afficixo Pay Per Click Affiliate Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CPC Affiliate Offers — Afficixo',
    description:
      'Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
}

export default function OffersPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#0d1724]/70 to-[#101827]/95" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Offers</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              CPC Affiliate Offers
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Discover CPC campaigns, generate tracking links, promote offers, and earn from eligible valid clicks with Afficixo.
            </p>
          </div>

          <div className="space-y-12 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Quality CPC Campaigns</h2>
              <p className="text-slate-300 leading-7">
                Browse a range of CPC affiliate offers designed for publishers and traffic partners. Each campaign includes clear payout terms, geo targeting, and traffic requirements.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Create Tracking Links</h2>
              <p className="text-slate-300 leading-7">
                Generate affiliate links for approved campaigns and promote them across websites, social channels, and other approved traffic sources.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Monitor Campaign Performance</h2>
              <p className="text-slate-300 leading-7">
                Track valid clicks, earnings, and campaign metrics in real time so you can optimize traffic sources and maximize your revenue.
              </p>
            </section>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Start promoting offers</h3>
              <p className="mt-3 text-slate-300 leading-7">
                Select offers that suit your audience, generate links, and begin earning from quality clicks.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  Join as Publisher
                </Link>
                <Link href="/contact" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:border-cyan-300 transition-colors">
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
