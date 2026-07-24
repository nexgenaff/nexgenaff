from pathlib import Path

content = ''''use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CheckCircle,
  Globe2,
  Shield,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

const proofPoints = [
  { value: '21K+', label: 'Publishers', icon: TrendingUp },
  { value: '70+', label: 'Countries', icon: Globe2 },
  { value: '95%', label: 'Network Quality', icon: CheckCircle },
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
  { name: 'Finance', description: 'Loans, credit cards, and investment offers.' },
  { name: 'Health & Beauty', description: 'Supplements, skincare, and fitness.' },
  { name: 'Sweepstakes', description: 'Win cash prizes, gadgets, and gift cards.' },
  { name: 'Jobs', description: 'Career, make money, and work from home.' },
  { name: 'Gaming', description: 'Mobile games, consoles, and in-game rewards.' },
  { name: 'Travel', description: 'Flight deals, hotels, and vacation packages.' },
  { name: 'Insurance', description: 'Car, home, and life insurance offers.' },
]

const services = [
  {
    title: 'Offer Management',
    description: 'Optimize campaigns with top-converting offers and exclusive vertical access.',
    icon: TrendingUp,
  },
  {
    title: 'Advanced Tracking',
    description: 'Real-time analytics, fraud filtering, and conversion clarity for every source.',
    icon: BarChart3,
  },
  {
    title: 'Affiliate Support',
    description: 'Dedicated account managers and performance guidance around the clock.',
    icon: Shield,
  },
]

const FAQ_ITEMS = [
  {
    question: 'How do I sign up as an affiliate with Affroyal?',
    answer: 'Create an account, browse premium offers, and start sending traffic to high-converting campaigns.',
  },
  {
    question: 'What payment methods do you offer?',
    answer: 'We support reliable payouts through commonly used methods for global affiliates.',
  },
  {
    question: 'What types of offers are available on Affroyal’s network?',
    answer: 'Access verticals like jobs, rewards, finance, sweepstakes and mobile offers through our premium network.',
  },
]

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.16),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.14),transparent_22%),linear-gradient(180deg,#020617_0%,#071224_40%,#0a1735_100%)] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(56,189,248,0.18),transparent_20%),radial-gradient(circle_at_85%_8%,rgba(168,85,247,0.14),transparent_20%)]" />
      <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:52px_52px]" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-4 sm:px-6 lg:px-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="mb-6 flex flex-col gap-4 rounded-full border border-cyan-400/15 bg-slate-950/50 px-4 py-4 shadow-[0_18px_50px_rgba(4,12,29,0.35)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="inline-flex items-center gap-3 text-slate-100">
              <Logo variant="full" size="lg" />
            </Link>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-3 text-sm text-slate-300 sm:justify-end">
            <a href="#publishers" className="transition hover:text-white">Publishers</a>
            <a href="#advertisers" className="transition hover:text-white">Advertisers</a>
            <a href="#verticals" className="transition hover:text-white">Verticals</a>
            <a href="#about" className="transition hover:text-white">About</a>
            <a href="#contact" className="transition hover:text-white">Contact</a>
          </nav>

          <div className="flex flex-wrap items-center justify-end gap-3">
            <Link href="/login" className="rounded-full border border-slate-700/70 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10">
              Sign In
            </Link>
            <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300">
              Start Earning
            </Link>
          </div>
        </motion.header>

        <main className="flex-1">
          <section id="hero" className="grid gap-8 rounded-[32px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(10,19,44,0.96),rgba(5,8,20,0.96))] p-6 shadow-[0_24px_80px_rgba(2,8,23,0.5)] backdrop-blur-xl sm:grid-cols-[1.05fr_0.95fr] sm:p-8 lg:p-10">
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="flex flex-col justify-between"
            >
              <div>
                <p className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
                  <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                  Global Premium CPA Network
                </p>

                <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                  Affroyal: Your Trusted CPA Network for Higher Conversions
                </h1>

                <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base sm:leading-8 lg:text-lg">
                  Maximize your earnings with exclusive high-paying offers, reliable payouts, and dedicated support. Join a unified platform built for publishers and advertisers who want premium traffic performance.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-auto"
                  >
                    Start Earning
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/80 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10 sm:w-auto"
                  >
                    Sign In
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {proofPoints.map((point) => (
                  <div key={point.label} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.75)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <point.icon className="mb-3 h-5 w-5 text-cyan-300" />
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
              className="rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(7,15,35,0.95),rgba(8,18,48,0.96))] p-6 shadow-[0_20px_50px_rgba(2,8,23,0.32)] sm:p-8"
            >
              <div className="flex items-center gap-3 text-sm font-semibold uppercase tracking-[0.32em] text-cyan-300">
                <Shield className="h-4 w-4" />
                Top Global Leads
              </div>
              <p className="mt-5 text-sm text-slate-400">Top countries and niches showing strong conversion activity today.</p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { country: 'Canada', label: 'Health & Fitness' },
                  { country: 'Germany', label: 'Survey & Finance' },
                  { country: 'New Zealand', label: 'Finance Trending' },
                  { country: 'UK', label: 'Rewards' },
                  { country: 'USA', label: 'Jobs & Credit' },
                  { country: 'Australia', label: 'Rewards & Sweepstakes' },
                ].map((item) => (
                  <div key={item.country} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.8)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{item.country}</p>
                        <p className="mt-1 text-xs text-slate-400">{item.label}</p>
                      </div>
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-400/15 text-sm font-semibold text-cyan-200">
                        {item.country.slice(0,2).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  { title: 'For Publishers', description: 'Boost your earnings with exclusive offers and faster payouts.' },
                  { title: 'For Advertisers', description: 'Access quality traffic with data-driven delivery and split optimization.' },
                ].map((item) => (
                  <div key={item.title} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.8)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <p className="text-base font-semibold text-white">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </section>

          <section id="publishers" className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.4)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Publishers</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Premium traffic, higher payouts, and easy campaign setup.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Access top-converting offers from finance, rewards, jobs, sweepstakes, gaming, and more with real-time tracking and dedicated publisher support.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {publisherBenefits.map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex items-start gap-3 text-cyan-300">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div id="advertisers" className="rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.4)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Advertisers</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Better campaign control with premium audience signals.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Reach high-quality traffic through segmented routing, geo-targeted optimization, and fraud-aware delivery that protects your budget.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {advertiserBenefits.map((item) => (
                  <div key={item} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex items-start gap-3 text-cyan-300">
                      <CheckCircle className="mt-1 h-4 w-4 flex-shrink-0" />
                      <span className="text-sm text-slate-200">{item}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="verticals" className="mt-8 rounded-[28px] border border-cyan-400/10 bg-[linear-gradient(180deg,rgba(7,15,35,0.94),rgba(4,9,22,0.95))] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.38)] sm:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Popular verticals</p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Convert more traffic in the hottest niches.</h2>
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                Browse Offers
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {verticals.map((vertical) => (
                <div key={vertical.name} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <Briefcase className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-white">{vertical.name}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-400">{vertical.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="about" className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.38)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">About Affroyal</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Unified support for affiliates and advertisers alike.</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Affroyal connects publishers with premium offers and helps advertisers spend smarter with traffic quality controls, audience optimization, and transparent analytics.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {services.map((service) => (
                  <div key={service.title} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10 text-cyan-300">
                      <service.icon className="h-5 w-5" />
                    </div>
                    <p className="mt-4 text-lg font-semibold text-white">{service.title}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{service.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div id="contact" className="rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.38)] sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Get in touch</p>
              <h2 className="mt-4 text-3xl font-semibold text-white sm:text-4xl">Need help launching your next campaign?</h2>
              <p className="mt-4 text-sm leading-7 text-slate-400 sm:text-base sm:leading-8">
                Our team is ready to support publishers and advertisers with campaign setup, traffic verification, and revenue optimization.
              </p>

              <div className="mt-8 space-y-4 rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Email</p>
                  <a href="mailto:hello@affroyal.com" className="mt-2 block text-base font-semibold text-white hover:text-cyan-300">hello@affroyal.com</a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Advertiser</p>
                  <a href="mailto:adv@affroyal.com" className="mt-2 block text-base font-semibold text-white hover:text-cyan-300">adv@affroyal.com</a>
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Address</p>
                  <p className="mt-2 text-base font-semibold text-white">30 N Gould St Ste R, Sheridan, WY 82801</p>
                </div>
              </div>
            </div>
          </section>

          <section id="faqs" className="mt-8 rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] p-6 shadow-[0_18px_50px_rgba(2,8,23,0.38)] sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">Frequently asked questions</p>
                <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Everything affiliates and advertisers need to know.</h2>
              </div>
              <Link href="/login" className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:bg-white/10">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question} className="rounded-3xl border border-slate-700/70 bg-[rgba(3,11,24,0.78)] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <p className="text-base font-semibold text-white">{item.question}</p>
                  <p className="mt-3 text-sm leading-7 text-slate-400">{item.answer}</p>
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer className="mt-10 rounded-[28px] border border-cyan-400/10 bg-[rgba(7,15,35,0.94)] px-6 py-6 text-sm text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] sm:px-8">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Logo variant="compact" size="sm" />
                <span className="text-slate-300">Affroyal - Premium Affiliate Network</span>
              </div>
              <p>Experience premium offers, fast payouts, and dedicated support for affiliates and advertisers.</p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href="/login" className="transition hover:text-white">Support</Link>
              <Link href="/login" className="transition hover:text-white">Privacy</Link>
              <Link href="/login" className="transition hover:text-white">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
'''

path = Path(r'c:\Users\robiu\Projects\nexgenaff\src\app\page.tsx')
path.write_text(content, encoding='utf-8')
print('page.tsx updated')
