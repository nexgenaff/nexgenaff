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
  metadataBase: new URL('https://www.weebly.pro'),
  title: 'Afficixo — Pay Per Click Affiliate Marketplace',
  description:
    'Afficixo is a pay-per-click affiliate marketplace where publishers find CPC offers, promote campaigns, generate valid clicks, track traffic, and earn from quality visitors.',
  keywords: [
    'Afficixo',
    'pay per click affiliate marketplace',
    'CPC affiliate marketplace',
    'pay per click affiliate network',
    'CPC affiliate network',
    'affiliate marketplace',
    'CPC offers',
    'pay per click offers',
    'earn per click',
    'affiliate CPC network',
    'affiliate marketing',
    'publisher network',
    'traffic monetization',
    'click tracking platform',
    'affiliate links',
  ],
  authors: [{ name: 'Afficixo' }],
  creator: 'Afficixo',
  alternates: {
    canonical: 'https://www.weebly.pro',
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
  icons: {
    icon: '/favicon.png',
    apple: '/AFFICIXO.png',
  },
  openGraph: {
    title: 'Afficixo — Pay Per Click Affiliate Marketplace',
    description:
      'Join Afficixo and discover CPC affiliate offers, promote campaigns, track your traffic, and earn from valid clicks.',
    type: 'website',
    url: 'https://www.weebly.pro',
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
    title: 'Afficixo — CPC Affiliate Marketplace',
    description:
      'Discover CPC offers, promote campaigns, track valid clicks, and monetize your traffic with Afficixo.',
    images: ['https://www.weebly.pro/og-image.png'],
    site: '@afficixo',
    creator: 'Afficixo',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#05070b' },
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
  ],
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