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
      title: 'Geo Targeting Pro',
      description: 'Redirect visitors based on their country with custom offers for each region.',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics Pro',
      description: 'Track clicks, unique visitors, and geo statistics in real-time with beautiful charts.',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Link2,
      title: 'Custom Domains Pro',
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
      title: 'Public Dashboards Pro',
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
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}></div>
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
            <a href="https://t.me/yourusername" target="_blank" rel="noopener noreferrer" className="px-4 sm:px-6 py-2 btn-premium rounded-xl text-sm sm:text-base flex items-center gap-2">
              <Send className="w-4 h-4" />
              Contact Pro Team
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
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6 animate-pulseGlow">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-xs sm:text-sm font-medium text-purple-300">System: Operational • 99.9% Uptime</span>
            <Sparkles className="w-3 h-3 text-yellow-400" />
          </div>
          
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 leading-tight">
            Smart Link Tracking &{' '}
            <span className="gradient-text">Geo Redirect Pro</span>
          </h1>
          
          <p className="text-base sm:text-lg lg:text-xl text-white/60 mb-6 sm:mb-8 max-w-2xl mx-auto">
            The most advanced affiliate tracking platform with REAL DNS verification, 
            AI bot detection, and enterprise-grade analytics.
          </p>
          
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link href="/login" className="px-6 sm:px-8 py-3 sm:py-4 btn-premium rounded-xl text-base sm:text-lg shadow-2xl shadow-purple-500/20 flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Start Free Trial
            </Link>
            <a href="#features" className="px-6 sm:px-8 py-3 sm:py-4 bg-white/5 backdrop-blur-xl border border-white/10 text-white rounded-xl hover:bg-white/10 transition text-base sm:text-lg flex items-center gap-2">
              See Pro Features
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
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Pro Features</h2>
            <p className="text-base sm:text-lg text-white/40 mt-3 sm:mt-4 max-w-2xl mx-auto">
              Everything you need for professional affiliate marketing
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 card-hover"
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
          <div className="text-center relative overflow-hidden rounded-2xl sm:rounded-3xl p-8 sm:p-12 md:p-16 gradient-bg">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative z-10">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 sm:mb-4">
                Ready to Go Pro?
              </h2>
              <p className="text-indigo-100 text-base sm:text-lg mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join 10,000+ professionals using NextGen Affiliates Pro
              </p>
              <Link href="/login" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-white text-indigo-600 rounded-xl hover:bg-indigo-50 transition text-base sm:text-lg font-semibold shadow-2xl">
                <Rocket className="w-5 h-5" />
                Start Pro Trial
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="py-6 sm:py-8 border-t border-white/5"
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Logo variant="compact" size="sm" />
            <p className="text-xs sm:text-sm text-white/30">
              © 2024 NextGen Affiliates Pro. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              <a href="#" className="text-xs sm:text-sm text-white/30 hover:text-white/60 transition">Privacy</a>
              <a href="#" className="text-xs sm:text-sm text-white/30 hover:text-white/60 transition">Terms</a>
              <a href="#" className="text-xs sm:text-sm text-white/30 hover:text-white/60 transition">Support</a>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}