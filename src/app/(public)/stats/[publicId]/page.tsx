'use client'

import { use, useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { formatNumber } from '@/lib/utils/helpers'
import { getCountryFlag, getCountryLabel } from '@/lib/utils/country'
import { Chart } from '@/components/ui/Chart'
import {
  Eye,
  MousePointerClick,
  Users,
  Globe2,
  Bot,
  User,
  CheckCircle,
  XCircle,
  ExternalLink,
  Search,
  ChevronLeft,
  ChevronRight,
  Monitor,
  Smartphone,
  Tablet,
  Clock,
  Sparkles,
  ChevronDown,
  TrendingUp,
  MapPin,
  Activity,
  BarChart3,
  Zap,
  Shield,
  Gauge,
  Target,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Move,
  GripVertical,
  Layers,
  Compass,
  Radar,
  Cpu,
  Database,
  Network,
  Radio,
  Gauge as GaugeIcon,
  Timer,
  Heart,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion'

// Types
interface Stats {
  totalClicks: number
  uniqueClicks: number
  botClicks: number
  geoSummary: Array<{
    country: string
    totalClicks: number
    uniqueClicks: number
  }>
  clickTrend?: {
    labels: string[]
    datasets: Array<{
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      fill: boolean
      tension: number
      pointRadius: number
    }>
  }
  clicks: Array<{
    id: string
    timestamp: string
    country: string
    region: string | null
    city: string | null
    isp: string | null
    browser: string
    browserVersion: string | null
    os: string | null
    deviceType: string | null
    deviceBrand: string | null
    userAgent: string | null
    ipAddress: string
    referrer: string | null
    isUnique: boolean
    isBot: boolean
    createdAt: string
  }>
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Animated Components
const AnimatedMetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  subtitle,
  color = '#818CF8',
  index = 0,
  delay = 0,
}: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ 
        duration: 0.6, 
        delay: delay + index * 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.2 }
      }}
      className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-2xl hover:shadow-indigo-500/5"
    >
      {/* Animated gradient background */}
      <motion.div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
        style={{ 
          background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` 
        }}
      />
      
      {/* Floating particles */}
      <motion.div
        className="absolute -right-8 -top-8 h-32 w-32 rounded-full blur-2xl"
        style={{ background: `${color}10` }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <div className="relative flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
          <motion.p 
            className="text-2xl font-bold text-white tracking-tight"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : { scale: 0.9 }}
            transition={{ duration: 0.3, delay: delay + index * 0.1 + 0.2 }}
          >
            {value}
          </motion.p>
          {subtitle && <p className="text-xs text-white/30">{subtitle}</p>}
        </div>
        <motion.div 
          className={`rounded-lg p-2.5`}
          style={{ backgroundColor: `${color}20` }}
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <Icon className="h-4 w-4" style={{ color }} />
        </motion.div>
      </div>
      {change && (
        <motion.div 
          className="mt-3 flex items-center gap-1.5"
          initial={{ opacity: 0, x: -10 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -10 }}
          transition={{ duration: 0.3, delay: delay + index * 0.1 + 0.3 }}
        >
          <span className={`inline-flex items-center gap-1 text-xs font-medium ${
            changeType === 'up' ? 'text-emerald-400' :
            changeType === 'down' ? 'text-rose-400' :
            'text-white/30'
          }`}>
            {changeType === 'up' && <ArrowUpRight className="h-3 w-3" />}
            {changeType === 'down' && <ArrowDownRight className="h-3 w-3" />}
            {changeType === 'neutral' && <Minus className="h-3 w-3" />}
            {change}
          </span>
          <span className="text-xs text-white/20">vs last period</span>
        </motion.div>
      )}
      
      {/* Animated border glow */}
      <motion.div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ width: 0 }}
        animate={isInView ? { width: '100%' } : { width: 0 }}
        transition={{ duration: 0.8, delay: delay + index * 0.1 + 0.5 }}
      />
    </motion.div>
  )
}

const ScrollProgress = () => {
  const { scrollYProgress } = useScroll()
  
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 z-50"
      style={{ scaleX: scrollYProgress, transformOrigin: '0%' }}
    />
  )
}

const FloatingGlow = () => {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 500], [0, 100])
  const opacity = useTransform(scrollY, [0, 300], [0.3, 0.1])
  
  return (
    <motion.div
      className="fixed -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-3xl pointer-events-none"
      style={{ y, opacity }}
    />
  )
}

const AnimatedCountryBar = ({ country, clicks, total, max, index }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  const percentage = max > 0 ? (clicks / max) * 100 : 0
  
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -20 }}
      animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex items-center gap-3 group hover:bg-white/5 rounded-lg p-2 transition-colors"
    >
      <span className="text-lg w-8 flex-shrink-0">{getCountryFlag(country)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/70 truncate">{getCountryLabel(country)}</span>
          <span className="text-sm font-medium text-white/50">{formatNumber(clicks)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <motion.div 
            className="h-full rounded-full"
            style={{ 
              background: `linear-gradient(90deg, #818CF8, #A78BFA)`,
              width: '0%'
            }}
            animate={isInView ? { width: `${percentage}%` } : { width: '0%' }}
            transition={{ duration: 1, delay: index * 0.08, ease: [0.43, 0.13, 0.23, 0.96] }}
          />
        </div>
      </div>
    </motion.div>
  )
}

const AnimatedTableRow = ({ children, index }: any) => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })
  
  return (
    <motion.tr
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="hover:bg-white/[0.03] transition-colors"
    >
      {children}
    </motion.tr>
  )
}

const PulseDot = ({ active = true }) => (
  <motion.span
    className="relative flex h-2 w-2"
    animate={active ? {
      scale: [1, 1.2, 1],
      opacity: [1, 0.5, 1],
    } : {}}
    transition={{
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  >
    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
  </motion.span>
)

export default function PublicStatsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params)
  const publicId = resolvedParams.publicId

  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterUnique, setFilterUnique] = useState('')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const limit = 10

  const headerRef = useRef(null)
  const isHeaderInView = useInView(headerRef, { once: true })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(
          `/api/analytics/public/${publicId}?page=${page}&limit=${limit}&search=${search}&country=${filterCountry}&unique=${filterUnique}&range=${timeRange}`
        )
        if (!response.ok) throw new Error('Dashboard not found')
        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchStats()
  }, [publicId, page, search, filterCountry, filterUnique, timeRange])

  const getDeviceIcon = useCallback((deviceType: string | null) => {
    if (!deviceType) return Monitor
    const device = deviceType.toLowerCase()
    if (device.includes('mobile') || device.includes('phone')) return Smartphone
    if (device.includes('tablet')) return Tablet
    return Monitor
  }, [])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }, [])

  const countries = useMemo(() => 
    stats?.geoSummary?.map(e => e.country).filter(Boolean) || []
  , [stats?.geoSummary])

  const totalClicks = stats?.pagination?.total || stats?.clicks?.length || 0
  const totalPages = stats?.pagination?.totalPages || Math.ceil(totalClicks / limit) || 1
  const uniqueRate = stats?.totalClicks ? ((stats.uniqueClicks / stats.totalClicks) * 100).toFixed(1) : '0'
  const botRate = stats?.totalClicks ? ((stats.botClicks / stats.totalClicks) * 100).toFixed(1) : '0'
  const maxCountryClicks = stats?.geoSummary?.length 
    ? Math.max(...stats.geoSummary.map(c => c.totalClicks)) 
    : 0

  const chartData = {
    labels: stats?.clickTrend?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Clicks',
        data: stats?.clickTrend?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#818CF8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
        pointBackgroundColor: '#818CF8',
        borderWidth: 2,
      },
    ],
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="h-12 bg-white/5 rounded-xl mb-3 animate-pulse"
              style={{ width: `${100 - i * 5}%` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
      >
        <div className="text-center max-w-md">
          <motion.div 
            className="bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="h-10 w-10 text-rose-400" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Dashboard</h1>
          <p className="text-white/40 mb-6">{error}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </motion.button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-x-hidden">
      <ScrollProgress />
      <FloatingGlow />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <motion.div
          ref={headerRef}
          initial={{ opacity: 0, y: -20 }}
          animate={isHeaderInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: [0.43, 0.13, 0.23, 0.96] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <motion.div 
              className="bg-indigo-500/10 rounded-lg p-2.5 border border-indigo-500/20"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Logo variant="compact" size="sm" showAnimation={true} />
            </motion.div>
            <div>
              <motion.h1 
                className="text-xl font-semibold text-white"
                initial={{ opacity: 0, x: -20 }}
                animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                Public Analytics
              </motion.h1>
              <motion.p 
                className="text-sm text-white/40"
                initial={{ opacity: 0, x: -20 }}
                animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Real-time click statistics
              </motion.p>
            </div>
          </div>
          
          <motion.div 
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={isHeaderInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              {['7d', '30d', '90d'].map((range) => (
                <motion.button
                  key={range}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    timeRange === range 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {range}
                </motion.button>
              ))}
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, rotate: 180 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTimeRange(timeRange)}
              className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <Download className="h-4 w-4" />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <AnimatedMetricCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={formatNumber(stats?.totalClicks || 0)}
            change="+12.5%"
            changeType="up"
            color="#818CF8"
            index={0}
            delay={0.1}
          />
          <AnimatedMetricCard
            icon={Users}
            label="Unique Visitors"
            value={formatNumber(stats?.uniqueClicks || 0)}
            change="+8.3%"
            changeType="up"
            color="#34D399"
            index={1}
            delay={0.1}
          />
          <AnimatedMetricCard
            icon={Globe2}
            label="Countries"
            value={countries.length || 0}
            change="+2"
            changeType="up"
            color="#F472B6"
            subtitle={`${uniqueRate}% unique rate`}
            index={2}
            delay={0.1}
          />
          <AnimatedMetricCard
            icon={Bot}
            label="Bot Traffic"
            value={formatNumber(stats?.botClicks || 0)}
            change="-3.1%"
            changeType="down"
            color="#F87171"
            subtitle={`${botRate}% of total`}
            index={3}
            delay={0.1}
          />
        </div>

        {/* Chart & Geography */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {/* Chart */}
          <motion.div 
            className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5"
            whileHover={{ borderColor: 'rgba(255,255,255,0.2)', boxShadow: '0 0 40px rgba(129, 140, 248, 0.05)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <Activity className="h-4 w-4 text-indigo-400" />
                </motion.div>
                <span className="text-sm font-medium text-white/70">Click Activity</span>
                <PulseDot />
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-indigo-400" />
                  Clicks
                </span>
              </div>
            </div>
            <div className="h-[180px] w-full">
              <Chart 
                data={chartData}
                height={180}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
                    },
                    x: {
                      grid: { display: false },
                      ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 10 } },
                    },
                  },
                }}
              />
            </div>
          </motion.div>

          {/* Top Countries */}
          <motion.div 
            className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5"
            whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  transition: { duration: 30, repeat: Infinity, ease: "linear" }
                }}
              >
                <Globe2 className="h-4 w-4 text-indigo-400" />
              </motion.div>
              <span className="text-sm font-medium text-white/70">Top Countries</span>
            </div>
            <div className="space-y-3 max-h-[220px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {stats?.geoSummary?.slice(0, 5).map((country, index) => (
                <AnimatedCountryBar
                  key={country.country}
                  country={country.country}
                  clicks={country.totalClicks}
                  total={country.totalClicks}
                  max={maxCountryClicks}
                  index={index}
                />
              ))}
              {(!stats?.geoSummary || stats.geoSummary.length === 0) && (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Globe2 className="h-8 w-8 text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No geographic data yet</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="flex flex-wrap items-center gap-2 mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <motion.div 
            className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10 flex-1 min-w-[200px]"
            whileHover={{ borderColor: 'rgba(255,255,255,0.2)' }}
            transition={{ duration: 0.3 }}
          >
            <Search className="h-4 w-4 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
              placeholder="Search clicks..."
            />
          </motion.div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => { setFilterCountry(''); setFilterUnique('') }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterCountry === '' && filterUnique === ''
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilterUnique(filterUnique === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterUnique === 'true'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Unique
            </motion.button>
            {countries.slice(0, 2).map((country) => (
              <motion.button
                key={country}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filterCountry === country
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {getCountryFlag(country)}
              </motion.button>
            ))}
            {countries.length > 2 && (
              <div className="relative">
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="appearance-none bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 pr-8 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30"
                >
                  <option value="">More</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {getCountryFlag(country)} {getCountryLabel(country)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Data Table */}
        <motion.div 
          className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          whileHover={{ borderColor: 'rgba(255,255,255,0.15)' }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.03] border-b border-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Device</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Browser</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">Referrer</th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-white/30">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats?.clicks?.length ? (
                  stats.clicks.slice((page - 1) * limit, page * limit).map((click, index) => {
                    const DeviceIcon = getDeviceIcon(click.deviceType)
                    return (
                      <AnimatedTableRow key={click.id} index={index}>
                        <td className="px-4 py-3 text-sm text-white/40 whitespace-nowrap">
                          {formatDate(click.createdAt || click.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <motion.span
                              whileHover={{ scale: 1.2, rotate: 10 }}
                              transition={{ duration: 0.2 }}
                            >
                              {getCountryFlag(click.country)}
                            </motion.span>
                            <span className="text-sm text-white/60">{getCountryLabel(click.country)}</span>
                            {click.city && (
                              <span className="text-xs text-white/30 hidden sm:inline">• {click.city}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-white/50">
                            <DeviceIcon className="h-3.5 w-3.5 text-white/30" />
                            <span className="hidden sm:inline">{click.os || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-white/50">
                          {click.browser || 'Unknown'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {click.referrer ? (
                            <motion.a
                              whileHover={{ scale: 1.05, color: '#818CF8' }}
                              href={click.referrer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-300/60 hover:text-indigo-300 transition-colors"
                            >
                              {new URL(click.referrer).hostname}
                            </motion.a>
                          ) : (
                            <span className="text-white/20">Direct</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                                click.isBot
                                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
                                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                              }`}
                            >
                              {click.isBot ? (
                                <Bot className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                              {click.isBot ? 'Bot' : 'Human'}
                            </motion.span>
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                                click.isUnique
                                  ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                  : 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                              }`}
                            >
                              {click.isUnique ? (
                                <CheckCircle className="h-3 w-3" />
                              ) : (
                                <XCircle className="h-3 w-3" />
                              )}
                              {click.isUnique ? 'Unique' : 'Repeat'}
                            </motion.span>
                          </div>
                        </td>
                      </AnimatedTableRow>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <motion.div 
                        className="flex flex-col items-center gap-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Eye className="h-8 w-8 text-white/10" />
                        <p className="text-sm text-white/30">No clicks recorded yet</p>
                        <p className="text-xs text-white/20">Share your link to start collecting analytics</p>
                      </motion.div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalClicks > 0 && (
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 px-4 py-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-xs text-white/30">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalClicks)} of {totalClicks}
              </div>
              <div className="flex items-center gap-1.5">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </motion.button>
                <motion.span 
                  className="text-xs text-white/40 px-2"
                  key={page}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Page {page} of {totalPages}
                </motion.span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="flex items-center gap-2">
            <Logo variant="compact" size="sm" showAnimation={true} />
            <span className="text-xs text-white/20">Powered by NexGen Affiliates</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <motion.span
              whileHover={{ color: 'rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.2 }}
            >
              Privacy protected
            </motion.span>
            <span>•</span>
            <motion.span
              whileHover={{ color: 'rgba(255,255,255,0.4)' }}
              transition={{ duration: 0.2 }}
            >
              Real-time analytics
            </motion.span>
          </div>
        </motion.div>

      </div>
    </div>
  )
}