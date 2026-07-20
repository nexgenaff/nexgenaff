'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Bot,
  Briefcase,
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

  const publisherBenefits = [
    'Highest payouts with transparent tracking across every campaign.',
    'Dedicated support for optimization, scaling, and offer discovery.',
    'Live dashboards that make it easy to spot the winners quickly.',
  ]

  const advertiserBenefits = [
    'Targeted traffic with quality signals that protect your budget.',
    'Flexible campaign setup for geo, device, and source-aware routing.',
    'Real-time visibility into the movement that matters most.',
  ]

  const verticals = [
    { name: 'Finance', icon: TrendingUp },
    { name: 'Health', icon: Shield },
    { name: 'Sweepstakes', icon: Sparkles },
    { name: 'Jobs', icon: Briefcase },
    { name: 'Gaming', icon: Zap },
    { name: 'Travel', icon: Globe2 },
  ]

  const services = [
    {
      title: 'Offer Management',
      description: 'Keep your portfolio organized with exclusive offers and performance-led recommendations.',
      icon: Link2,
    },
    {
      title: 'Advanced Tracking',
      description: 'Monitor conversions, route logic, and weak traffic in one premium control center.',
      icon: BarChart3,
    },
    {
      title: 'Affiliate Support',
      description: 'Get expert help when you need to scale faster or clean up underperforming flows.',
      icon: Shield,
    },
  ]

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(135deg,#020617_0%,#071224_45%,#0b1f3a_100%)] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.28),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(129,140,248,0.24),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_28%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:56px_56px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-3 py-3 sm:px-6 sm:py-4 lg:px-8">
        <motion.nav
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-4 flex flex-col items-stretch gap-3 rounded-[24px] border border-cyan-400/25 bg-[rgba(2,8,23,0.78)] px-3 py-3 shadow-[0_0_0_1px_rgba(255,255,255,0.03),0_20px_40px_rgba(2,8,23,0.35)] backdrop-blur-xl sm:mb-6 sm:flex-row sm:items-center sm:justify-between sm:rounded-full sm:px-4"
        >
          <Logo variant="full" size="lg" showAnimation />
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4">
            <Link href="/login" className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white sm:px-5">
              Login
            </Link>
            <a
              href="https://t.me/affiliate_king_rafsan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-cyan-400/20"
            >
              <Sparkles className="h-4 w-4" />
              Contact team
            </a>
          </div>
        </motion.nav>

        <main className="flex-1">
          <section className="grid gap-4 rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(6,15,32,0.94),rgba(10,20,44,0.96))] p-4 shadow-[0_24px_70px_rgba(2,8,23,0.45)] backdrop-blur-xl sm:gap-8 sm:rounded-[36px] sm:p-6 lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-center"
            >
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
                <CheckCircle className="h-3.5 w-3.5 text-cyan-300" />
                Premium CPA platform • premium offers
              </div>

              <h1 className="mt-5 max-w-3xl text-3xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:mt-6 sm:text-4xl lg:text-6xl">
                Elevate your earnings with premium offers and sharper visibility.
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:mt-4 sm:text-base sm:leading-8 lg:text-lg">
                Bring your links, filters, and reporting into one polished workspace so you can move with confidence and keep every campaign clean.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:flex-wrap">
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/30 bg-gradient-to-r from-cyan-400/20 to-indigo-500/20 px-5 py-3 text-sm font-semibold text-cyan-100 transition hover:from-cyan-400/30 hover:to-indigo-500/30 sm:w-auto"
                >
                  <Rocket className="h-4 w-4" />
                  Open dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#insights"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-white/10 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/15 sm:w-auto"
                >
                  Explore platform
                  <ChevronRight className="h-4 w-4" />
                </a>
              </div>

              <div className="mt-6 grid gap-3 sm:mt-8 sm:grid-cols-3">
                {proofPoints.map((point, index) => (
                  <div key={index} className="rounded-2xl border border-cyan-400/20 bg-[rgba(2,8,23,0.72)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
              className="rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(7,16,35,0.98),rgba(10,21,44,0.98))] p-4 shadow-[0_18px_40px_rgba(2,8,23,0.32)] sm:rounded-[26px] sm:p-8"
            >
              <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
                <Shield className="h-4 w-4" />
                What you gain
              </div>
              <div className="mt-6 space-y-3">
                {[
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
                ].map((item, index) => (
                  <div key={index} className="rounded-2xl border border-slate-700/70 bg-[rgba(2,8,23,0.76)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
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
            <div className="rounded-[24px] border border-cyan-400/20 bg-[rgba(7,15,31,0.84)] p-4 sm:rounded-[26px] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Why work with us?</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
                Premium support, stronger routing, and better signal.
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-700/70 bg-[rgba(2,8,23,0.76)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <h3 className="text-lg font-semibold text-white">For publishers</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
                    {publisherBenefits.map((item) => (
                      <li key={item} className="flex gap-2"><CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-300" />{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-slate-700/70 bg-[rgba(2,8,23,0.76)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <h3 className="text-lg font-semibold text-white">For advertisers</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-400">
                    {advertiserBenefits.map((item) => (
                      <li key={item} className="flex gap-2"><CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-cyan-300" />{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(7,16,35,0.95),rgba(10,21,44,0.95))] p-4 sm:rounded-[26px] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Popular verticals</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {verticals.map(({ name, icon: Icon }) => (
                  <div key={name} className="rounded-2xl border border-slate-700/70 bg-[rgba(2,8,23,0.76)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-white">{name}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-[24px] border border-cyan-400/20 bg-[rgba(7,15,31,0.84)] p-4 sm:mt-8 sm:rounded-[28px] sm:p-8">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Services to boost your affiliate earnings</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-white sm:text-3xl lg:text-4xl">
                Everything needed to move premium traffic without friction.
              </h2>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {services.map((service) => (
                <div key={service.title} className="rounded-2xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(8,17,36,0.95),rgba(10,20,42,0.95))] p-6 shadow-[0_16px_40px_rgba(2,8,23,0.3)]">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                    <service.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">{service.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-[24px] border border-cyan-400/20 bg-[linear-gradient(135deg,rgba(8,17,36,0.98),rgba(15,30,60,0.98))] p-5 text-center shadow-[0_20px_50px_rgba(2,8,23,0.38)] sm:mt-8 sm:rounded-[30px] sm:p-8">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-white sm:text-2xl lg:text-3xl">
              Make the next campaign feel more deliberate.
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
              Set up faster, spot signal sooner, and keep your attention on the traffic that is actually moving the needle.
            </p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">
              <Rocket className="h-4 w-4" />
              Get started
            </Link>
          </section>
        </main>

        <footer className="mt-6 py-2 sm:mt-8">
          <div className="flex flex-col gap-3 rounded-[24px] border border-cyan-400/20 bg-[rgba(7,15,31,0.84)] px-4 py-4 text-sm text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <Logo variant="compact" size="sm" />
              <span>Built for teams that care about traffic quality.</span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-end">
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