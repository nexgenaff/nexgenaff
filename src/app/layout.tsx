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
  title: 'Afficixo — Best CPC Affiliate Marketplace for Publishers',
  description:
    'Afficixo is the premier pay-per-click affiliate marketplace where publishers find high-paying CPC offers, promote campaigns, generate valid clicks, track traffic, and earn from quality visitors worldwide.',
  keywords: [
    'CPC affiliate marketplace',
    'pay per click offers',
    'affiliate network',
    'publisher network',
    'click tracking',
    'traffic monetization',
    'affiliate marketing',
    'earn per click',
    'Afficixo',
    'CPC advertising',
    'affiliate links',
    'campaign management',
    'valid clicks',
    'publisher earnings',
    'online monetization',
  ],
  authors: [{ name: 'Afficixo' }],
  creator: 'Afficixo',
  publisher: 'Afficixo',
  category: 'Business',
  alternates: {
    canonical: 'https://www.weebly.pro',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Afficixo — Pay Per Click Affiliate Marketplace',
    description:
      'Join Afficixo and discover CPC affiliate offers, promote campaigns, track your traffic, and earn from valid clicks.',
    type: 'website',
    url: 'https://www.weebly.pro',
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
    title: 'Afficixo — CPC Affiliate Marketplace',
    description:
      'Discover CPC offers, promote campaigns, track valid clicks, and monetize your traffic with Afficixo.',
    images: ['https://www.weebly.pro/og.png'],
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