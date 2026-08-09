import type { Metadata } from "next";
import FAQClient from "./FAQClient";

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
        text: 'CPC affiliate offers pay publishers for each valid click or visit that meets the campaign\'s traffic and quality requirements.',
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
  return <FAQClient faqData={faqStructuredData} />;
}