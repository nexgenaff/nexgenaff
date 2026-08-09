import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'For Publishers — Earn With CPC Offers | Afficixo',
  description:
    'Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.',
  keywords: [
    'affiliate publishers',
    'publisher platform',
    'monetize traffic',
    'CPC offers',
    'click tracking',
    'performance marketing',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/publishers',
  },
  openGraph: {
    title: 'For Publishers — Earn With CPC Offers | Afficixo',
    description:
      'Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.',
    type: 'website',
    url: 'https://www.weebly.pro/publishers',
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
    title: 'For Publishers — Earn With CPC Offers | Afficixo',
    description:
      'Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
}

export default function PublishersPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#0d1724]/70 to-[#101827]/95" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">Publishers</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Monetize Your Traffic With CPC Offers
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Join Afficixo and access CPC campaigns, click tracking, analytics, and publisher tools that help you earn from quality traffic.
            </p>
          </div>

          <div className="space-y-12 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Publisher Dashboard</h2>
              <p className="text-slate-300 leading-7">
                Manage your offers, links, clicks, and earnings from one place. Our dashboard gives you the visibility you need to optimize campaigns and scale performance.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Click Tracking</h2>
              <p className="text-slate-300 leading-7">
                Monitor every click with detailed analytics and transparent performance reporting. Know which sources drive valid traffic and where to focus your efforts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Traffic Monetization</h2>
              <p className="text-slate-300 leading-7">
                Turn your website traffic, social audience, and content channels into dependable revenue by promoting CPC offers that match your audience.
              </p>
            </section>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Get started as a publisher</h3>
              <p className="mt-3 text-slate-300 leading-7">
                Apply to Afficixo, choose relevant CPC offers, and start earning from validated click traffic.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  Create Account
                </Link>
                <Link href="/faq" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:border-cyan-300 transition-colors">
                  See FAQ
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
