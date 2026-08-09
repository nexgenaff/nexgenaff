import type { Metadata } from "next";
import PublishersClient from "./PublishersClient";

export const metadata: Metadata = {
  title: "For Publishers — Earn With CPC Offers | Afficixo",
  description:
    "Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.",
  keywords: [
    "affiliate publishers",
    "publisher platform",
    "monetize traffic",
    "CPC offers",
    "click tracking",
    "performance marketing",
  ],
  alternates: {
    canonical: "https://www.weebly.pro/publishers",
  },
  openGraph: {
    title: "For Publishers — Earn With CPC Offers | Afficixo",
    description:
      "Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.",
    type: "website",
    url: "https://www.weebly.pro/publishers",
    siteName: "Afficixo",
    images: [
      {
        url: "https://www.weebly.pro/og-image.png",
        secureUrl: "https://www.weebly.pro/og-image.png",
        width: 1200,
        height: 630,
        alt: "Afficixo Pay Per Click Affiliate Marketplace",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "For Publishers — Earn With CPC Offers | Afficixo",
    description:
      "Join Afficixo as a publisher, discover CPC campaigns, promote affiliate offers, track valid clicks, and monetize your traffic.",
    images: ["https://www.weebly.pro/og-image.png"],
    creator: "Afficixo",
  },
};

export default function PublishersPage() {
  return <PublishersClient />;
}