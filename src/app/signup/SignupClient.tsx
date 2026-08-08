"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ArrowRight, Lock, User, Mail, Rocket, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

const GOOGLE_BUTTON_CLASS = "group flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-300 hover:border-indigo-400/40 hover:bg-white/10 hover:shadow-lg hover:shadow-indigo-500/20"

export default function SignupClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const turnstileContainerRef = useRef<HTMLDivElement | null>(null)
  const turnstileWidgetIdRef = useRef<string | null>(null)
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""
  const turnstileScriptLoadedRef = useRef(false)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState("")
  const [turnstileReady, setTurnstileReady] = useState(false)
  const [turnstileError, setTurnstileError] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  useEffect(() => {
    if (!turnstileSiteKey) {
      setTurnstileReady(false)
      setTurnstileError("Turnstile is not configured yet. Add NEXT_PUBLIC_TURNSTILE_SITE_KEY to enable it.")
      return
    }

    const renderTurnstile = () => {
      const turnstile = (window as Window & { turnstile?: any }).turnstile
      if (!turnstile || !turnstileContainerRef.current) {
        setTurnstileError("Security check could not be loaded. Please refresh the page.")
        return
      }

      try {
        if (turnstileWidgetIdRef.current) {
          turnstile.remove(turnstileWidgetIdRef.current)
        }

        const widgetId = turnstile.render(turnstileContainerRef.current, {
          sitekey: turnstileSiteKey,
          theme: "dark",
          appearance: "always",
          callback: (token: string) => {
            setTurnstileToken(token)
            setTurnstileError("")
          },
          "error-callback": () => {
            setTurnstileToken("")
            setTurnstileError("Security check failed. Please try again.")
          },
          "expired-callback": () => {
            setTurnstileToken("")
            setTurnstileError("Security check expired. Please try again.")
          },
        })

        turnstileWidgetIdRef.current = widgetId
        setTurnstileReady(true)
        setTurnstileError("")
      } catch (error) {
        console.error("Turnstile render failed", error)
        setTurnstileReady(false)
        setTurnstileError("Security check could not be loaded. Please refresh the page.")
      }
    }

    if (typeof window === "undefined") return

    const turnstile = (window as Window & { turnstile?: any }).turnstile
    if (turnstile) {
      renderTurnstile()
      return
    }

    if (turnstileScriptLoadedRef.current) return

    turnstileScriptLoadedRef.current = true
    const script = document.createElement("script")
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    script.async = true
    script.defer = true
    script.onload = renderTurnstile
    script.onerror = () => {
      setTurnstileReady(false)
      setTurnstileError("Security check could not be loaded. Please refresh the page.")
    }
    document.body.appendChild(script)

    return () => {
      if (turnstileWidgetIdRef.current) {
        const turnstile = (window as Window & { turnstile?: any }).turnstile
        if (turnstile?.remove) {
          turnstile.remove(turnstileWidgetIdRef.current)
        }
      }
    }
  }, [turnstileSiteKey])

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "google_auth_failed") {
      setError("Google sign-up could not be completed. Please try again or use the form below.")
    } else if (errorParam === "missing_code") {
      setError("Google returned an incomplete sign-up response. Please try again.")
    } else if (errorParam === "google_not_configured") {
      setError("Google sign-up is not configured yet. Add your Google OAuth credentials to continue.")
    } else {
      setError("")
    }

    const successParam = searchParams.get("success")
    if (successParam === "google-authenticated") {
      setSuccess("Google sign-up was successful. Redirecting you to your dashboard...")
      const redirectPath = searchParams.get("redirect") || "/admin/dashboard"
      const timer = window.setTimeout(() => {
        router.replace(redirectPath)
      }, 1000)
      return () => window.clearTimeout(timer)
    }

    setSuccess("")
  }, [router, searchParams])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (turnstileSiteKey && !turnstileToken) {
      setError("Please complete the security check before signing up.")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, turnstileToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Signup failed")
      }

      setSuccess("Account created successfully. Redirecting you to your dashboard...")
      window.setTimeout(() => {
        router.push("/admin/dashboard")
      }, 500)
    } catch (err: any) {
      setSuccess("")
      setError(err.message || "We could not create your account right now. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-[#05070b] text-white overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#05070b] via-[#0d1724] to-[#101827]" />
        <motion.div
          className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-gradient-radial from-indigo-900/30 via-transparent to-transparent blur-3xl"
          animate={{ x: [0, 60, -30, 0], y: [0, -40, 20, 0], opacity: [0.6, 1, 0.6, 0.6] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 right-0 w-[600px] h-[600px] bg-gradient-radial from-purple-700/20 via-transparent to-transparent blur-3xl"
          animate={{ x: [0, -50, 30, 0], y: [0, 30, -20, 0], opacity: [0.4, 0.8, 0.4, 0.4] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute bottom-0 right-1/3 w-[700px] h-[700px] bg-gradient-radial from-pink-900/15 via-transparent to-transparent blur-3xl"
          animate={{ x: [0, 40, -60, 0], y: [0, -20, 30, 0], opacity: [0.3, 0.7, 0.3, 0.3] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-all hover:gap-3"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="w-full max-w-md rounded-3xl bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-indigo-500/5 hover:shadow-indigo-500/10 transition-shadow duration-500"
        >
          <div className="space-y-6">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center">
                <Image
                  src="/afficixo.png"
                  alt="Afficixo logo"
                  width={128}
                  height={128}
                  className="object-cover"
                  priority
                />
              </div>
              <h1 className="mt-4 text-xl font-semibold text-white">Create your account</h1>
              <p className="mt-1 text-sm text-slate-400">Sign up to start creating links and tracking your own campaigns.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300 backdrop-blur">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="leading-6">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 backdrop-blur">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span className="leading-6">{success}</span>
              </div>
            )}

            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-slate-500">
              <div className="h-px flex-1 bg-white/10" />
              <span>or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled={googleLoading || loading}
              onClick={() => {
                setGoogleLoading(true)
                window.location.assign('/api/auth/google/start?redirect=/admin/dashboard')
              }}
              className={`${GOOGLE_BUTTON_CLASS} ${googleLoading ? 'cursor-wait opacity-80' : ''}`}
            >
              {googleLoading ? (
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M21.6 12.23c0-.78-.07-1.53-.2-2.25H12v4.26h5.38a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.75 2.98-4.33 2.98-7.53Z" />
                  <path fill="#34A853" d="M12 22c2.7 0 4.96-.89 6.62-2.41l-3.24-2.5c-.9.6-2.05.96-3.38.96-2.6 0-4.8-1.75-5.59-4.11H2.9v2.58A10 10 0 0 0 12 22Z" />
                  <path fill="#FBBC05" d="M6.41 13.94A6.02 6.02 0 0 1 6.41 10.06V7.48H2.9A10 10 0 0 0 2 12c0 1.62.39 3.15 1.09 4.52l3.32-2.58Z" />
                  <path fill="#EA4335" d="M12 6.04c1.47 0 2.79.5 3.83 1.49l2.87-2.87A9.96 9.96 0 0 0 12 2A10 10 0 0 0 2.9 7.48l3.51 2.58c.79-2.36 2.99-4.11 5.59-4.11Z" />
                </svg>
              )}
              <span>{googleLoading ? "Redirecting to Google..." : "Join with Google"}</span>
            </button>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Username</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Choose a username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pl-10 text-white placeholder-slate-500 focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-all duration-300 hover:border-white/20"
                    placeholder="Create a strong password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="rounded-xl border border-indigo-400/20 bg-indigo-500/10 p-3 text-sm text-slate-200">
                <div className="mb-2 font-medium text-indigo-200">Security check</div>
                {turnstileReady ? (
                  <div ref={turnstileContainerRef} className="flex justify-center" />
                ) : (
                  <div className="text-sm text-slate-300">{turnstileError || "Loading security check..."}</div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {loading ? (
                    <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Sign up
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
              </button>
            </form>

            <div className="border-t border-white/10 pt-5 text-center text-sm text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-indigo-300 hover:text-indigo-200 underline underline-offset-2">
                Sign in
              </Link>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full max-w-md mt-6 text-center text-xs text-slate-500 border-t border-white/5 pt-4"
        >
          <span>© 2026 Afficixo. All rights reserved.</span>
        </motion.div>
      </div>
    </div>
  )
}
