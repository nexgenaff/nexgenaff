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
  title: 'Afficixo | Professional Routing Infrastructure',
  description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
  keywords: 'affiliate tracking, click fraud detection, link management, traffic quality, campaign routing, CPA platform',
  authors: [{ name: 'Afficixo' }],
  icons: {
    icon: '/afficixo.png?v=2',
    apple: '/afficixo.png?v=2',
  },
  openGraph: {
    title: 'Afficixo | Professional Routing Infrastructure',
    description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
    type: 'website',
    url: 'https://nexgenaffiliates.vercel.app',
    images: [
      {
        url: 'https://nexgenaffiliates.vercel.app/afficixo.png?v=2',
        secureUrl: 'https://nexgenaffiliates.vercel.app/afficixo.png?v=2',
        width: 256,
        height: 256,
        alt: 'Afficixo logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afficixo | Professional Routing Infrastructure',
    description: 'Secure, auditable affiliate routing and traffic control for teams that need precision, clarity, and dependable execution.',
    images: ['https://nexgenaffiliates.vercel.app/afficixo.png?v=2'],
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
        <div className="min-h-screen animate-fade-in">
          <PageTransition>{children}</PageTransition>
        </div>
      </body>
    </html>
  )
}