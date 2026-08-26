import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";
import AfficixoLoading from "@/components/ui/AfficixoLoading";

export const metadata: Metadata = {
  title: 'Publisher Login — Afficixo',
  description:
    'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
  keywords: [
    'publisher login',
    'Afficixo login',
    'affiliate dashboard',
    'offer management login',
    'click tracking login',
  ],
  alternates: {
    canonical: 'https://www.weebly.pro/login',
  },
  openGraph: {
    title: 'Publisher Login — Afficixo',
    description:
      'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
    type: 'website',
    url: 'https://www.weebly.pro/login',
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
    title: 'Publisher Login — Afficixo',
    description:
      'Log in to your Afficixo publisher account to manage offers, affiliate links, traffic, clicks, analytics, and earnings.',
    images: ['https://www.weebly.pro/og-image.png'],
    creator: 'Afficixo',
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<AfficixoLoading text="Loading sign in" />}>
      <LoginClient />
    </Suspense>
  );
}
