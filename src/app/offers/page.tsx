import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.weebly.pro'),
  title: "CPC Affiliate Offers & Campaigns — Afficixo Marketplace",
  description:
    "Browse thousands of high-paying CPC affiliate offers on Afficixo. Find the best campaigns, generate tracking links, promote offers, and earn from valid clicks with our reliable affiliate marketplace.",
  keywords: [
    "CPC affiliate offers",
    "affiliate marketplace",
    "pay per click offers",
    "tracking links",
    "valid clicks",
    "publisher campaigns",
    "affiliate traffic",
    "high paying offers",
    "CPC campaigns",
    "promote offers",
    "earn per click offers",
    "affiliate links",
  ],
  alternates: {
    canonical: "https://www.weebly.pro/offers",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "CPC Affiliate Offers & Campaigns — Afficixo",
    description:
      "Browse thousands of high-paying CPC affiliate offers. Generate tracking links, promote campaigns, and earn from valid clicks.",
    type: "website",
    url: "https://www.weebly.pro/offers",
    siteName: "Afficixo",
    locale: "en_US",
    images: [
      {
        url: "https://www.weebly.pro/og.png",
        secureUrl: "https://www.weebly.pro/og.png",
        width: 1200,
        height: 630,
        alt: "Afficixo Pay Per Click Affiliate Offers",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CPC Affiliate Offers — Afficixo Marketplace",
    description:
      "Browse high-paying CPC offers, generate tracking links, and start earning from valid clicks today.",
    images: ["https://www.weebly.pro/og.png"],
    creator: "@afficixo",
    site: "@afficixo",
  },
};


export default function OffersPage() {
  redirect("/publishers");
}
