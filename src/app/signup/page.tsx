import type { Metadata } from "next"
import { Suspense } from "react"
import SignupClient from "./SignupClient"

export const metadata: Metadata = {
  title: 'Join Afficixo — Become a CPC Affiliate Publisher',
  description:
    'Create your Afficixo publisher account and access CPC affiliate offers, tracking tools, campaign management, and traffic monetization features.',
  keywords: [
    'join Afficixo',
    'CPC affiliate publisher',
    'publisher signup',
    'affiliate tracking tools',
    'traffic monetization platform',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/signup',
  },
  openGraph: {
    title: 'Join Afficixo — Become a CPC Affiliate Publisher',
    description:
      'Create your Afficixo publisher account and access CPC affiliate offers, tracking tools, campaign management, and traffic monetization features.',
    type: 'website',
    url: 'https://www.weebly.pro/signup',
    siteName: 'Afficixo',
    images: [
      {
        url: 'https://www.weebly.pro/og.png',
        secureUrl: 'https://www.weebly.pro/og.png',
        width: 1200,
        height: 630,
        alt: 'Afficixo Pay Per Click Affiliate Marketplace',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Join Afficixo — Become a CPC Affiliate Publisher',
    description:
      'Create your Afficixo publisher account and access CPC affiliate offers, tracking tools, campaign management, and traffic monetization features.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#05070b] text-white">Loading...</div>}>
      <SignupClient />
    </Suspense>
  )
}
