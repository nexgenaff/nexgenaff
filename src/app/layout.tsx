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
  metadataBase: new URL('https://nexgenaffiliates.vercel.app'),
  title: 'NexGen Affiliates',
  description: 'Click tracking, bot filtering, and smarter campaign routing for affiliate and growth teams.',
  keywords: 'affiliate tracking, click fraud detection, link management, traffic quality, campaign routing',
  authors: [{ name: 'NexGen Affiliates' }],
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'NexGen Affiliates',
    description: 'Click tracking, bot filtering, and smarter campaign routing for affiliate and growth teams.',
    type: 'website',
    url: 'https://nexgenaffiliates.vercel.app',
    images: [
      {
        url: '/favicon.png',
        width: 1200,
        height: 630,
        alt: 'NexGen Affiliates social preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexGen Affiliates',
    description: 'Click tracking, bot filtering, and smarter campaign routing for affiliate and growth teams.',
    images: ['/favicon.png'],
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <div className="min-h-screen animate-fade-in">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}