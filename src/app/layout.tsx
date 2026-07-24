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
  title: 'NexGen Affiliates | Professional Routing Infrastructure',
  description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
  keywords: 'affiliate tracking, click fraud detection, link management, traffic quality, campaign routing, CPA platform',
  authors: [{ name: 'NexGen Affiliates' }],
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
  openGraph: {
    title: 'NexGen Affiliates | Professional Routing Infrastructure',
    description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
    type: 'website',
    url: 'https://nexgenaffiliates.vercel.app',
    images: [
      {
        url: 'https://nexgenaffiliates.vercel.app/og-image.png',
        secureUrl: 'https://nexgenaffiliates.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'NexGen Affiliates social preview',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NexGen Affiliates | Professional Routing Infrastructure',
    description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
    images: ['https://nexgenaffiliates.vercel.app/og-image.png'],
    site: '@nexgenaffiliates',
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