import type { Metadata } from "next";
import AboutClient from "./AboutClient";

export const metadata: Metadata = {
  metadataBase: new URL('https://www.weebly.pro'),
  title: "About Afficixo — Premium CPC Affiliate Marketplace for Publishers",
  description:
    "Discover Afficixo's mission to empower publishers with a reliable CPC affiliate marketplace. Learn about our platform, team, and commitment to high-paying CPC offers and transparent click tracking.",
  keywords: [
    "Afficixo",
    "CPC affiliate marketplace",
    "pay per click affiliate marketplace",
    "affiliate offers",
    "traffic monetization",
    "click tracking",
    "publisher tools",
    "affiliate campaigns",
    "about Afficixo",
    "CPC publisher platform",
    "affiliate network about",
  ],
  alternates: {
    canonical: "https://www.weebly.pro/about",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "About Afficixo — Premium CPC Affiliate Marketplace",
    description:
      "Discover Afficixo's mission to empower publishers with a reliable CPC affiliate marketplace and transparent click tracking.",
    type: "website",
    url: "https://www.weebly.pro/about",
    siteName: "Afficixo",
    locale: "en_US",
    images: [
      {
        url: "https://www.weebly.pro/og.png",
        secureUrl: "https://www.weebly.pro/og.png",
        width: 1200,
        height: 630,
        alt: "Afficixo Pay Per Click Affiliate Marketplace",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Afficixo — Premium CPC Affiliate Marketplace",
    description:
      "Discover Afficixo's mission to empower publishers with reliable CPC offers and transparent click tracking.",
    images: ["https://www.weebly.pro/og.png"],
    creator: "@afficixo",
    site: "@afficixo",
  },
};

export default function AboutPage() {
  return <AboutClient />;
}
