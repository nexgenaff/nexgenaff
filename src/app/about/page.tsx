import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  title: "About Afficixo — CPC Affiliate Marketplace",
  description:
    "Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.",
  keywords: [
    "Afficixo",
    "CPC affiliate marketplace",
    "pay per click affiliate marketplace",
    "affiliate offers",
    "traffic monetization",
    "click tracking",
    "publisher tools",
    "affiliate campaigns",
  ],
  alternates: {
    canonical: "https://www.weebly.pro/about",
  },
  openGraph: {
    title: "About Afficixo — CPC Affiliate Marketplace",
    description:
      "Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.",
    type: "website",
    url: "https://www.weebly.pro/about",
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
    title: "About Afficixo — CPC Affiliate Marketplace",
    description:
      "Learn about Afficixo, a CPC affiliate marketplace built to help publishers discover offers, monetize traffic, track clicks, and grow their affiliate business.",
    images: ["https://www.weebly.pro/og-image.png"],
    creator: "Afficixo",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
