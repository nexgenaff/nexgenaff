import type { Metadata } from "next";
import LoginClient from "./LoginClient";

export const metadata: Metadata = {
  title: "Login | Afficixo Affiliate Platform",
  description:
    "Access your Afficixo account to manage affiliate links, view analytics, and optimize performance across top offers.",
};

export default function LoginPage() {
  return <LoginClient />
}
