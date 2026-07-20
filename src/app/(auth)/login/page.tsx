'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { User, Lock, ArrowLeft, AlertCircle, Rocket, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/admin/dashboard')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#030712_0%,#07111f_45%,#0b1730_100%)] px-3 py-3 text-slate-100 sm:px-6 sm:py-5 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.12),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_24%)]" />
      <div className="absolute inset-0 opacity-[0.03] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col">
        <div className="mb-4 flex flex-col items-start gap-3 rounded-[24px] border border-slate-700/70 bg-slate-950/70 px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.02)] backdrop-blur-sm sm:mb-5 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-4">
          <Link href="/" className="inline-flex items-center gap-3 text-sm text-slate-200 transition hover:text-white">
            <Logo variant="compact" size="sm" />
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>

        <div className="grid flex-1 gap-4 rounded-[24px] border border-slate-700/70 bg-[rgba(6,12,24,0.74)] p-2 shadow-[0_18px_48px_rgba(2,8,23,0.36)] backdrop-blur-xl sm:gap-5 sm:rounded-[30px] sm:p-3 lg:grid-cols-[0.95fr_1.05fr] lg:p-4">
          <div className="flex flex-col justify-center rounded-[20px] border border-slate-700/70 bg-[linear-gradient(135deg,#071223_0%,#030712_100%)] p-5 sm:rounded-[24px] sm:p-7 lg:p-10">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-sky-200">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure access
            </div>

            <h1 className="mt-5 text-2xl font-semibold tracking-[-0.03em] text-white sm:mt-6 sm:text-3xl lg:text-4xl">
              A clearer way to manage campaign performance.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Keep your team aligned around one focused workspace for traffic quality, reporting, and next-step decisions.
            </p>

            <div className="mt-5 space-y-3 sm:mt-6">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3.5">
                <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                <span className="text-sm leading-7 text-slate-300">See the signal clearly, without noise or unnecessary clutter.</span>
              </div>
              <div className="flex items-start gap-3 rounded-2xl border border-slate-700/70 bg-slate-900/60 p-3.5">
                <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-300" />
                <span className="text-sm leading-7 text-slate-300">Protect budgets by catching weak traffic before it impacts performance.</span>
              </div>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="rounded-[20px] border border-slate-700/70 bg-[#050a13]/95 p-4 shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-6 lg:p-8"
          >
            <div className="mb-5 flex justify-center sm:mb-6">
              <Logo variant="icon" size="lg" showAnimation={true} />
            </div>

            <div className="mb-5 text-center sm:mb-6">
              <h2 className="text-xl font-semibold text-white sm:text-2xl">Welcome back</h2>
              <p className="mt-1 text-sm text-slate-400">Use your credentials to continue to the workspace.</p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 backdrop-blur animate-fadeInUp">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <span className="leading-6">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label className="form-label">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your username"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10"
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-sky-400/20 bg-gradient-to-r from-sky-400/15 to-cyan-400/15 px-4 py-3 text-sm font-semibold text-sky-100 transition hover:from-sky-400/25 hover:to-cyan-400/25 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4" />
                    Sign in
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 border-t border-slate-700/70 pt-4 text-center text-sm text-slate-400 sm:mt-6">
              Need access?{' '}
              <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="font-medium text-cyan-300 transition hover:text-cyan-200">
                Contact the team
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}