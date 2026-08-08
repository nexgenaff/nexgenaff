import type { Metadata } from "next";
import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | Afficixo Affiliate Platform",
  description:
    "Access your Afficixo account to manage affiliate links, view analytics, and optimize performance across top offers.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#05070b] text-white">Loading...</div>}>
      <LoginClient />
    </Suspense>
  );
}
