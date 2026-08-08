import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PageTransition from '@/components/ui/PageTransition'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://weebly.pro'),
  title: 'Afficixo | Affiliate Offers & Routing Infrastructure',
  description:
    'Afficixo helps affiliates and advertisers scale revenue with high-converting offers, advanced routing, fraud protection, and transparent analytics.',
  keywords:
    'affiliate marketing, affiliate offers, campaign routing, click fraud detection, traffic monetization, CPA network, performance marketing, affiliate analytics',
  authors: [{ name: 'Afficixo' }],
  creator: 'Afficixo',
  alternates: {
    canonical: 'https://weebly.pro',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      noarchive: false,
    },
  },
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05070b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
  icons: {
    icon: '/afficixo.png?v=2',
    apple: '/afficixo.png?v=2',
  },
  openGraph: {
    title: 'Afficixo | Affiliate Offers & Routing Infrastructure',
    description:
      'Afficixo helps affiliates and advertisers scale revenue with high-converting offers, advanced routing, fraud protection, and transparent analytics.',
    type: 'website',
    url: 'https://weebly.pro',
    images: [
      {
        url: 'https://weebly.pro/afficixo.png?v=2',
        secureUrl: 'https://weebly.pro/afficixo.png?v=2',
        width: 256,
        height: 256,
        alt: 'Afficixo logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afficixo | Affiliate Offers & Routing Infrastructure',
    description:
      'Afficixo helps affiliates and advertisers scale revenue with high-converting offers, advanced routing, fraud protection, and transparent analytics.',
    images: ['https://weebly.pro/afficixo.png?v=2'],
    site: '@afficixo',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}