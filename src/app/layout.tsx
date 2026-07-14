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
  title: 'NexGen Affiliates',
  description: 'Affiliate tracking, geo redirect, and public analytics for modern marketing teams.',
  keywords: 'affiliate tracking, geo redirect, link management, public analytics, SEO optimize',
  authors: [{ name: 'NexGen Affiliates' }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'NexGen Affiliates',
    description: 'Affiliate tracking, geo redirect, and public analytics for modern marketing teams.',
    type: 'website',
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