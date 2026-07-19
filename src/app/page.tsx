'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle,
  ChevronRight,
  Globe2,
  Link2,
  Rocket,
  Shield,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  const proofPoints = [
    { value: '24/7', label: 'live visibility', icon: TrendingUp },
    { value: '98%', label: 'traffic clarity', icon: Zap },
    { value: '3x', label: 'faster decisions', icon: BarChart3 },
  ]

  const highlights = [
    {
      title: 'Track every touchpoint',
      description: 'Bring links, clicks, and campaign movement together in one place so nothing slips through the cracks.',
      icon: Link2,
    },
    {
      title: 'Filter weak activity early',
      description: 'Separate suspicious or low-value traffic before it distorts reporting or burns budget.',
      icon: Bot,
    },
    {
      title: 'Route with intent',
      description: 'Send each visit to the right destination based on region, device, or campaign conditions.',
      icon: Globe2,
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Create the flow',
      description: 'Set up a campaign, drop in the link, and let the tracking start immediately.',
    },
    {
      number: '02',
      title: 'Surface the signal',
      description: 'Review clicks, quality signals, and movement patterns without hunting across spreadsheets.',
    },
    {
      number: '03',
      title: 'Scale the winners',
      description: 'Double down on the offers, routes, and audiences that are already proving themselves.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(135deg,#020817_0%,#071224_45%,#0b1f3a_100%)] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.28),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_28%),radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_22%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-full border border-sky-400/20 bg-slate-950/70 px-3 py-2.5 shadow-[0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-sm sm:px-4"
        >
          <Logo variant="full" size="lg" showAnimation />
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate-300 transition hover:text-white sm:px-5">
              Login
            </Link>
            <a
              href="https://t.me/affiliate_king_rafsan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08]"
            >
              <Sparkles className="h-4 w-4" />
              Contact team
            </a>
          </div>
        </motion.nav>

        <main className="flex-1">
          <section className="grid gap-8 rounded-[32px] border border-sky-400/20 bg-[rgba(6,15,32,0.78)] p-6 shadow-[0_18px_48px_rgba(2,8,23,0.42)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-3 py-1.5 text-[11px] font-medium uppercase tracking-[0.3em] text-sky-200">
                <CheckCircle className="h-3.5 w-3.5 text-cyan-300" />
                Campaign intelligence • cleaner growth
              </div>

              <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
                See which traffic is actually worth paying for.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-8 text-slate-400 sm:text-lg">
                Bring your links, filters, and reporting into one calm workspace so you can make better moves with less noise.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-2xl border border-sky-400/30 bg-gradient-to-r from-sky-400/20 to-cyan-400/20 px-5 py-3 text-sm font-semibold text-sky-100 transition hover:from-sky-400/30 hover:to-cyan-400/30"
                >
                  <Rocket className="h-4 w-4" />
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#insights"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-700/70 bg-white/10 px-5 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/15"
                >
                  Explore platform
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {proofPoints.map((point, index) => (
                  <div key={index} className="rounded-2xl border border-sky-400/20 bg-slate-900/70 p-4">
                    <point.icon className="mb-3 h-4 w-4 text-cyan-300" />
                    <p className="text-lg font-semibold text-white">{point.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{point.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.12 }}
              className="rounded-[26px] border border-sky-400/20 bg-[linear-gradient(180deg,rgba(7,16,35,0.96),rgba(10,21,44,0.96))] p-6 sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.3em] text-sky-300">
                <Shield className="h-4 w-4" />
                What you gain
              </div>
              <div className="mt-6 space-y-3">
                {highlights.map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-700/70 bg-slate-800/70 p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-semibold text-white">{item.title}</h2>
                        <p className="mt-1 text-sm leading-7 text-slate-400">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section id="insights" className="mt-8 grid gap-4 lg:grid-cols-[1.04fr_0.96fr]">
            <div className="rounded-[26px] border border-sky-400/20 bg-[rgba(7,15,31,0.84)] p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">The problem</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                Weak traffic hides in plain sight.
              </h2>
              <p className="mt-3 max-w-2xl text-base leading-8 text-slate-400">
                Low quality activity can quietly eat into your budget while your reporting still looks healthy. The point is to see the signal early and act without friction.
              </p>
            </div>

            <div className="rounded-[26px] border border-sky-400/20 bg-[linear-gradient(180deg,rgba(7,16,35,0.95),rgba(10,21,44,0.95))] p-6 sm:p-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-sky-400/20 bg-slate-900/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Truth</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Cleaner decisions</p>
                </div>
                <div className="rounded-2xl border border-sky-400/20 bg-slate-900/70 p-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Action</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Better spend</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-8 rounded-[28px] border border-sky-400/20 bg-[rgba(7,15,31,0.84)] p-6 sm:p-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">How it works</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-4xl">
                Keep the path from click to conversion simple.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {steps.map((step) => (
                <div key={step.number} className="rounded-2xl border border-sky-400/20 bg-[linear-gradient(180deg,rgba(8,17,36,0.95),rgba(10,20,42,0.95))] p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">{step.number}</p>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-[30px] border border-sky-400/20 bg-[linear-gradient(135deg,rgba(8,17,36,0.98),rgba(15,30,60,0.98))] p-8 text-center shadow-[0_16px_40px_rgba(2,8,23,0.38)]">
            <h2 className="text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl">
              Make the next campaign feel more deliberate.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base leading-8 text-slate-400">
              Set up faster, spot signal sooner, and keep your attention on the traffic that is actually moving the needle.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              <Rocket className="h-4 w-4" />
              Get started
            </Link>
          </section>
        </main>

        <footer className="mt-8 py-2">
          <div className="flex flex-col gap-3 rounded-[24px] border border-sky-400/20 bg-[rgba(7,15,31,0.84)] px-4 py-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3">
              <Logo variant="compact" size="sm" />
              <span>Built for teams that care about traffic quality.</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <a href="#" className="transition hover:text-white">Privacy</a>
              <a href="#" className="transition hover:text-white">Terms</a>
              <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="transition hover:text-white">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}