'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  Globe2, 
  BarChart3, 
  Link2, 
  Bot, 
  TrendingUp, 
  Shield,
  Rocket,
  Zap,
  CheckCircle,
  Gauge,
  ChevronRight,
  Send,
  Sparkles,
  Crown,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function HomePage() {
  const features = [
    {
      icon: Globe2,
      title: 'Geo Targeting',
      description: 'Redirect visitors based on their country with custom offers for each region.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Track clicks, unique visitors, and geo statistics in real-time with beautiful charts.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Link2,
      title: 'Custom Domains',
      description: 'Use your own domains with REAL DNS verification and auto SSL.',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: Bot,
      title: 'AI Bot Detection',
      description: 'Advanced AI bot detection with 99.9% accuracy. Redirect bots to Facebook.',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: TrendingUp,
      title: 'Public Dashboards',
      description: 'Share analytics with anyone using secure, public dashboard links.',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption, SSL support, and advanced protection for your data.',
      color: 'from-gray-700 to-gray-900'
    },
  ]

  const stats = [
    { value: '1M+', label: 'Clicks Processed', icon: Zap },
    { value: '10K+', label: 'Active Links', icon: Link2 },
    { value: '99.9%', label: 'Uptime', icon: Gauge },
    { value: '50+', label: 'Countries', icon: Globe2 },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(168,85,247,0.12),transparent_32%),linear-gradient(135deg,#020617_0%,#030712_45%,#02050f_100%)] text-slate-100">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] [background-size:54px_54px] opacity-18" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(34,211,238,0.08),transparent_26%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.1),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(14,165,233,0.08),transparent_24%)]" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-cyan-400/8 blur-[90px]" />
        <div className="absolute -top-20 -right-16 h-64 w-64 rounded-full bg-violet-600/12 blur-[90px]" />
        <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-emerald-400/8 blur-[100px]" style={{ animationDelay: '1.7s' }} />
      </div>

      <div className="container-responsive relative z-10">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 py-4 sm:py-6"
        >
          <Logo variant="full" size="lg" showAnimation={true} />
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/login" className="px-4 sm:px-6 py-2 text-slate-300/90 hover:text-white font-medium transition text-sm sm:text-base">
              Login
            </Link>
            <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="px-4 sm:px-6 py-2 btn-premium rounded-xl text-sm sm:text-base flex items-center gap-2">
              <Send className="w-4 h-4" />
              Contact Team
            </a>
          </div>
        </motion.nav>

        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-center max-w-4xl mx-auto py-12 sm:py-20"
        >
          <div className="web3-badge inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 animate-pulseGlow">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs sm:text-sm font-medium text-cyan-100">System: Operational • 99.9% Uptime</span>
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </div>
          
          <h1 className="mb-4 text-4xl font-semibold leading-[0.95] tracking-[-0.03em] text-slate-50 sm:mb-6 sm:text-6xl lg:text-7xl">
            Smart Link Tracking &{' '}
            <span className="gradient-text">Geo Redirect</span>
          </h1>

          <p className="mb-3 text-xs uppercase tracking-[0.38em] text-cyan-200/95 sm:text-sm">
            Luxury Web3 Startup • Verified Routing • Onchain Ready
          </p>
          
          <p className="mx-auto mb-6 max-w-2xl text-base leading-8 text-slate-300/95 sm:mb-8 sm:text-lg lg:text-xl">
            The most advanced affiliate tracking platform with REAL DNS verification,
            AI bot detection, and enterprise-grade analytics built for high-trust growth teams.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl px-6 py-3 text-base font-medium shadow-[0_10px_24px_rgba(99,102,241,0.18)] sm:px-8 sm:py-4 sm:text-lg btn-premium">
              <Rocket className="w-5 h-5" />
              Start Today
            </a>
            <a href="#features" className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-950/45 px-6 py-3 text-base text-white/90 transition hover:bg-white/10 backdrop-blur-sm sm:px-8 sm:py-4 sm:text-lg">
              See Features
              <ChevronRight className="w-5 h-5" />
            </a>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 py-8 sm:py-12"
        >
          {stats.map((stat, index) => (
            <div key={index} className="stat-card rounded-2xl border border-white/10 bg-slate-950/45 p-4 text-center shadow-[0_6px_18px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:p-6">
              <stat.icon className="mx-auto mb-2 h-6 w-6 text-cyan-300 sm:h-8 sm:w-8" />
              <p className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{stat.value}</p>
              <p className="mt-1 text-xs text-slate-400 sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Features Grid */}
        <motion.div 
          id="features" 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="py-12 sm:py-20"
        >
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-[-0.02em] text-slate-50">Platform Features</h2>
            <p className="text-base sm:text-lg text-slate-400 mt-3 sm:mt-4 max-w-2xl mx-auto">
              Everything you need for modern affiliate marketing operations
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative web3-card rounded-2xl p-6 sm:p-8 card-hover"
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <h3 className="mb-2 text-lg font-semibold tracking-[-0.01em] text-slate-100 sm:text-xl">
                  {feature.title}
                </h3>
                <p className="text-sm leading-7 text-slate-400/95 sm:text-base">
                  {feature.description}
                </p>
                <div className="absolute top-4 right-4">
                  <Crown className="w-5 h-5 text-yellow-400/30 group-hover:text-yellow-400 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="py-12 sm:py-20"
        >
          <div className="web3-cta text-center relative overflow-hidden rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 gradient-bg">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.2),transparent_36%)]"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-[-0.02em] text-slate-50 mb-3 sm:mb-4">
                Ready to Get Started?
              </h2>
              <p className="mx-auto mb-6 max-w-2xl text-base text-slate-300/95 sm:mb-8 sm:text-lg">
                Join teams using NexGen Affiliates to track, redirect, and grow faster.
              </p>
              <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-base font-semibold text-slate-900 shadow-[0_12px_32px_rgba(255,255,255,0.15)] transition hover:bg-slate-100 sm:px-8 sm:py-4 sm:text-lg">
                <Rocket className="w-5 h-5" />
                Start Now
              </a>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="py-6 sm:py-8"
        >
<div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-4 py-5 shadow-[0_6px_18px_rgba(0,0,0,0.14)] backdrop-blur-sm sm:px-6 sm:py-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.1),transparent_30%),radial-gradient(circle_at_center,rgba(99,102,241,0.08),transparent_44%)]" />
              <div className="absolute -top-10 right-6 h-24 w-24 rounded-full bg-cyan-400/8 blur-2xl" />
              <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-fuchsia-500/8 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Logo variant="compact" size="sm" />
                <div className="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-200/95">
                  Premium Affiliate Infrastructure
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <a href="#" className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-white/75 transition hover:border-cyan-400/50 hover:text-cyan-100">Privacy</a>
                <a href="#" className="rounded-full border border-white/10 bg-slate-950/60 px-3 py-1.5 text-xs text-white/75 transition hover:border-cyan-400/50 hover:text-cyan-100">Terms</a>
                <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="rounded-full border border-fuchsia-400/35 bg-fuchsia-500/12 px-3 py-1.5 text-xs font-medium text-fuchsia-100 transition hover:bg-fuchsia-500/20 hover:text-white">Support</a>
              </div>
            </div>

            <div className="relative z-10 mt-4 flex flex-col gap-2 border-t border-white/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-400/90 sm:text-sm">
                © 2024 NexGen Affiliates. All rights reserved.
              </p>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-200/90">
                Built for high-trust growth systems
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}