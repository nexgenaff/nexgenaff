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
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl"></div>
        <div className="absolute -top-32 -right-20 w-80 h-80 bg-violet-600 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-28 -left-20 w-96 h-96 bg-emerald-500 rounded-full mix-blend-screen filter blur-3xl opacity-12 animate-float" style={{ animationDelay: '1.7s' }}></div>
      </div>

      <div className="container-responsive relative">
        {/* Navigation */}
        <motion.nav 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center justify-between gap-4 py-4 sm:py-6"
        >
          <Logo variant="full" size="lg" showAnimation={true} />
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Link href="/login" className="px-4 sm:px-6 py-2 text-white/60 hover:text-white font-medium transition text-sm sm:text-base">
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
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Smart Link Tracking &{' '}
            <span className="gradient-text">Geo Redirect</span>
          </h1>

          <p className="text-xs sm:text-sm uppercase tracking-[0.38em] text-cyan-300/80 mb-3">
            Luxury Web3 Startup • Verified Routing • Onchain Ready
          </p>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/60 mb-6 sm:mb-8 max-w-2xl mx-auto">
            The most advanced affiliate tracking platform with REAL DNS verification,
            AI bot detection, and enterprise-grade analytics built for high-trust growth teams.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="px-6 sm:px-8 py-3 sm:py-4 btn-premium rounded-xl text-base sm:text-lg shadow-2xl shadow-purple-500/20 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Start Today
            </a>
            <a href="#features" className="px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 transition text-base sm:text-lg flex items-center gap-2">
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
            <div key={index} className="stat-card text-center bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
              <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 mx-auto text-purple-400 mb-2" />
              <p className="text-2xl sm:text-3xl font-bold gradient-text">{stat.value}</p>
              <p className="text-xs sm:text-sm text-white/40 mt-1">{stat.label}</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Platform Features</h2>
            <p className="text-base sm:text-lg text-white/40 mt-3 sm:mt-4 max-w-2xl mx-auto">
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
                <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-white/40">
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
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-indigo-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join teams using NexGen Affiliates to track, redirect, and grow faster.
              </p>
              <a href="https://t.me/affiliate_king_rafsan" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-base sm:text-lg font-semibold shadow-2xl">
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
          <div className="relative overflow-hidden rounded-[28px] border border-cyan-400/25 bg-[linear-gradient(135deg,rgba(10,16,34,0.98),rgba(18,24,51,0.96),rgba(7,11,24,0.98))] px-4 py-5 sm:px-6 sm:py-6 shadow-[0_0_0_1px_rgba(34,211,238,0.08),0_20px_60px_rgba(0,0,0,0.5),0_0_38px_rgba(34,211,238,0.13)] backdrop-blur-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.34),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.24),transparent_30%),radial-gradient(circle_at_center,rgba(99,102,241,0.26),transparent_44%)]"></div>
            <div className="absolute -top-10 right-6 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl"></div>
            <div className="absolute -bottom-12 left-8 h-28 w-28 rounded-full bg-fuchsia-500/20 blur-2xl"></div>

            <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                <Logo variant="compact" size="sm" />
                <div className="text-[11px] font-semibold uppercase tracking-[0.38em] text-cyan-100/90">
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
              <p className="text-xs sm:text-sm text-white/55">
                © 2024 NexGen Affiliates. All rights reserved.
              </p>
              <p className="text-[11px] uppercase tracking-[0.32em] text-cyan-100/75">
                Built for high-trust growth systems
              </p>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}