import type { Metadata } from "next"
import SignupClient from "./SignupClient"

export const metadata: Metadata = {
  title: "Sign Up | Afficixo Affiliate Platform",
  description:
    "Create an Afficixo account to access premium affiliate offers, track campaigns, and grow revenue with advanced routing and analytics.",
}

export default function SignupPage() {
  return <SignupClient />
}
