import type { Metadata } from 'next'

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is Afficixo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Afficixo is a pay-per-click affiliate marketplace for publishers and traffic partners who want to earn from valid clicks using CPC offers.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does the Afficixo CPC marketplace work?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Publishers discover CPC offers, generate tracking links, promote campaigns, and earn when valid traffic converts according to offer rules.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do publishers earn with Afficixo?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Publishers earn money from valid clicks delivered to CPC affiliate offers. The more quality traffic you send, the more you can earn.',
      },
    },
    {
      '@type': 'Question',
      name: 'What are CPC affiliate offers?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CPC affiliate offers pay publishers for each valid click or visit that meets the campaign’s traffic and quality requirements.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are clicks tracked?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Clicks are tracked with secure affiliate links and reporting tools that record visitor activity, traffic sources, and campaign performance in real time.',
      },
    },
  ],
}

export const metadata: Metadata = {
  title: 'Afficixo FAQ — CPC Affiliate Marketplace',
  description:
    'Find answers to common questions about Afficixo, CPC offers, affiliate links, valid clicks, publisher accounts, tracking, and payments.',
  keywords: [
    'Afficixo FAQ',
    'CPC affiliate marketplace FAQ',
    'affiliate questions',
    'click tracking questions',
    'publisher support',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/faq',
  },
  openGraph: {
    title: 'Afficixo FAQ — CPC Affiliate Marketplace',
    description:
      'Find answers to common questions about Afficixo, CPC offers, affiliate links, valid clicks, publisher accounts, tracking, and payments.',
    type: 'website',
    url: 'https://www.weebly.pro/faq',
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
    title: 'Afficixo FAQ — CPC Affiliate Marketplace',
    description:
      'Find answers to common questions about Afficixo, CPC offers, affiliate links, valid clicks, publisher accounts, tracking, and payments.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
}

export default function FAQPage() {
  const items = [
    {
      q: 'What is Afficixo?',
      a: 'Afficixo is a pay-per-click affiliate marketplace for publishers and traffic partners who want to earn from valid clicks using CPC offers.',
    },
    {
      q: 'How does the Afficixo CPC marketplace work?',
      a: 'Publishers discover CPC offers, generate tracking links, promote campaigns, and earn when valid traffic converts according to offer rules.',
    },
    {
      q: 'How do publishers earn with Afficixo?',
      a: 'Publishers earn money from valid clicks delivered to CPC affiliate offers. The more quality traffic you send, the more you can earn.',
    },
    {
      q: 'What are CPC affiliate offers?',
      a: 'CPC affiliate offers pay publishers for each valid click or visit that meets the campaign’s traffic and quality requirements.',
    },
    {
      q: 'How are clicks tracked?',
      a: 'Clicks are tracked with secure affiliate links and reporting tools that record visitor activity, traffic sources, and campaign performance in real time.',
    },
    {
      q: 'What is considered a valid click?',
      a: 'A valid click is traffic that meets the offer’s rules, including approved sources, geo requirements, and anti-fraud checks.',
    },
    {
      q: 'How do I create an affiliate link?',
      a: 'Once approved, create tracking links from the dashboard, then promote those links across your website, social media, and other approved channels.',
    },
    {
      q: 'How can I promote Afficixo offers?',
      a: 'Promote offers using your approved traffic sources such as websites, social media, email, and display placements while following campaign guidelines.',
    },
    {
      q: 'How can I check my click statistics?',
      a: 'Your dashboard shows detailed analytics for clicks, earnings, campaign performance, and traffic quality so you can optimize in real time.',
    },
    {
      q: 'When are publisher payments processed?',
      a: 'Payments are processed based on your account terms and performance schedule, with updates visible in your earnings dashboard.',
    },
  ]

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070b] text-white">
      <div className="absolute inset-0 bg-gradient-to-br from-[#05070b]/90 via-[#0d1724]/70 to-[#101827]/95" />
      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/40 backdrop-blur-xl shadow-[0_40px_120px_-40px_rgba(15,23,42,0.8)]">
          <div className="border-b border-white/10 px-6 py-10 sm:px-10">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">FAQ</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-300 sm:text-lg">
              Find answers to common questions about Afficixo, CPC offers, publisher onboarding, tracking, and payments.
            </p>
          </div>

          <div className="space-y-4 px-6 py-10 sm:px-10">
            {items.map((item) => (
              <div key={item.q} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-semibold text-white">{item.q}</h2>
                <p className="mt-3 text-slate-300 leading-7">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
