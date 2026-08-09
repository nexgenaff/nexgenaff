import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About Afficixo — CPC Affiliate Marketplace',
  description:
    'Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.',
  keywords: [
    'Afficixo',
    'CPC affiliate marketplace',
    'pay per click affiliate marketplace',
    'affiliate offers',
    'traffic monetization',
    'click tracking',
    'publisher tools',
    'affiliate campaigns',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/about',
  },
  openGraph: {
    title: 'About Afficixo — CPC Affiliate Marketplace',
    description:
      'Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.',
    type: 'website',
    url: 'https://www.weebly.pro/about',
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
    title: 'About Afficixo — CPC Affiliate Marketplace',
    description:
      'Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
}

export default function AboutPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#0d1724]/70 to-[#101827]/95" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">About</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              About Afficixo
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Afficixo is a pay-per-click affiliate marketplace created for publishers and traffic partners. Our platform connects publishers with affiliate campaigns and provides tools for managing offers, generating tracking links, monitoring clicks, and analyzing performance.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Our goal is to make traffic monetization simple, transparent, and accessible for publishers of different sizes.
            </p>
          </div>

          <div className="space-y-12 px-6 py-10 sm:px-10">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">A Publisher-First Marketplace</h2>
              <p className="text-slate-300 leading-7">
                We built Afficixo to help publishers discover CPC offers that match their traffic and audience. From campaign selection to reporting, our platform is optimized for ease of use, transparency, and reliable payouts.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">CPC Offers and Valid Clicks</h2>
              <p className="text-slate-300 leading-7">
                Publishers can browse campaigns, create tracking links, and promote offers across approved traffic sources. We focus on valid clicks and quality traffic so publishers can earn more from every campaign.
              </p>
            </section>

            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-white">Tools for Growth</h2>
              <p className="text-slate-300 leading-7">
                Afficixo provides actionable analytics, campaign performance details, and traffic insights. With these tools, publishers can optimize campaigns, monitor earnings, and scale their monetization strategy over time.
              </p>
            </section>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-2xl font-semibold text-white">Ready to get started?</h3>
              <p className="mt-3 text-slate-300 leading-7">
                Join Afficixo today and start monetizing your traffic with CPC offers built for publishers.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/signup" className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity">
                  Join Now
                </Link>
                <Link href="/offers" className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:border-cyan-300 transition-colors">
                  Browse Offers
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
