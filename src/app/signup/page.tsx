import type { Metadata } from "next"
import { Suspense } from "react"
import SignupClient from "./SignupClient"

export const metadata: Metadata = {
  title: "Sign Up | Afficixo Affiliate Platform",
  description:
    "Create an Afficixo account to access premium affiliate offers, track campaigns, and grow revenue with advanced routing and analytics.",
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#05070b] text-white">Loading...</div>}>
      <SignupClient />
    </Suspense>
  )
}
