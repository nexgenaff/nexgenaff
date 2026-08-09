import type { Metadata } from "next";
import OffersClient from "./OffersClient";

"use client";

import type { Metadata } from "next";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  Globe2,
  Users,
  Target,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  Shield,
  Award,
  BarChart3,
  Link as LinkIcon,
  Smartphone,
  Monitor,
  Gamepad2,
  Briefcase,
  Gift,
  CreditCard,
  Ticket,
  Sparkles,
  ChevronDown,
  LayoutGrid,
  List,
  Eye,
  HeartHandshake,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CPC Affiliate Offers — Afficixo",
  description:
    "Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.",
  keywords: [
    "CPC affiliate offers",
    "affiliate marketplace",
    "pay per click offers",
    "tracking links",
    "valid clicks",
    "publisher campaigns",
    "affiliate traffic",
  ],
  alternates: {
    canonical: "https://www.weebly.pro/offers",
  },
  openGraph: {
    title: "CPC Affiliate Offers — Afficixo",
    description:
      "Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.",
    type: "website",
    url: "https://www.weebly.pro/offers",
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
    title: "CPC Affiliate Offers — Afficixo",
    description:
      "Explore CPC affiliate offers on Afficixo. Find campaigns, generate tracking links, promote offers, and earn from eligible valid clicks.",
    images: ["https://www.weebly.pro/og-image.png"],
    creator: "Afficixo",
  },
};


export default function OffersPage() {
  return <OffersClient />;
}
