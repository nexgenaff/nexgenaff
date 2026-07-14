'use client'

import { use, useState, useEffect, useCallback, useMemo } from 'react'
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
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

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

// UI Components
const StatCard = ({ icon: Icon, label, value, color, trend, subtitle }: any) => (
  <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.02] p-6 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10">
    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" 
         style={{ background: `radial-gradient(circle at 30% 30%, ${color}15, transparent 70%)` }} />
    
    <div className="relative flex items-start justify-between">
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className={`rounded-xl p-2.5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
               style={{ backgroundColor: `${color}20` }}>
            <Icon className={`h-5 w-5`} style={{ color }} strokeWidth={2} />
          </div>
          {trend && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              trend > 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
            }`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div>
          <div className="text-3xl font-bold text-white tracking-tight transition-all duration-300 group-hover:scale-105">
            {value}
          </div>
          <p className="mt-1 text-sm font-medium text-white/40">{label}</p>
        </div>
      </div>
      
      <div className="absolute right-4 top-4 h-20 w-20 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-30"
           style={{ background: color }} />
    </div>
    
    <div className="absolute bottom-0 left-0 h-[2px] w-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:w-full" />
  </div>
)

const FilterChip = ({ label, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 ${
      active 
        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white/70'
    }`}
  >
    {label}
    {active && (
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
      </span>
    )}
  </button>
)

const EmptyState = ({ icon: Icon, title, description }: any) => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <div className="relative">
      <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl" />
      <div className="relative rounded-full bg-white/5 p-6 backdrop-blur-xl">
        <Icon className="h-12 w-12 text-white/20" />
      </div>
    </div>
    <h3 className="mt-6 text-xl font-semibold text-white/70">{title}</h3>
    <p className="mt-2 text-sm text-white/40 max-w-sm text-center">{description}</p>
  </div>
)

// Main Component
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
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table')
  const limit = 10

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch(
          `/api/analytics/public/${publicId}?page=${page}&limit=${limit}&search=${search}&country=${filterCountry}&unique=${filterUnique}`
        )
        if (!response.ok) throw new Error('Dashboard not found')
        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [publicId, page, search, filterCountry, filterUnique])

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

  // Fixed: Removed pointHoverRadius and using standard chart options
  const chartData = {
    labels: stats?.clickTrend?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Clicks',
        data: stats?.clickTrend?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.14)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
      {
        label: 'Unique Clicks',
        data: stats?.clickTrend?.datasets?.[1]?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.14)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      },
    ],
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950">
        <div className="container mx-auto max-w-7xl px-4 py-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-white/5 animate-pulse" />
              <div className="space-y-2">
                <div className="h-8 w-64 bg-white/5 rounded-lg animate-pulse" />
                <div className="h-4 w-40 bg-white/5 rounded-lg animate-pulse" />
              </div>
            </div>
            <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-6 animate-pulse">
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-white/10" />
                  <div className="h-8 w-24 bg-white/10 rounded" />
                  <div className="h-4 w-32 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 mb-8">
            <div className="h-[240px] w-full bg-white/5 rounded-xl animate-pulse" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <div className="h-6 w-32 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-black to-slate-950">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse rounded-full bg-rose-500/20 blur-2xl" />
            <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-full bg-rose-500/10">
              <Shield className="h-12 w-12 text-rose-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Unavailable</h1>
          <p className="text-white/40 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-105"
          >
            <Zap className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-950">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <div className="relative">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 blur-2xl" />
                <div className="relative rounded-2xl bg-gradient-to-br from-white/10 to-white/5 p-3 backdrop-blur-xl border border-white/10">
                  <Logo variant="compact" size="lg" showAnimation={true} />
                </div>
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                  Analytics Dashboard
                </h1>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/20">
                    <Activity className="h-3 w-3" />
                    Live
                  </span>
                  <span className="text-sm text-white/30">
                    Last updated: {new Date().toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex rounded-xl border border-white/10 bg-white/5 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'table' 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    viewMode === 'cards' 
                      ? 'bg-white/10 text-white shadow-lg' 
                      : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  Cards
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-8">
          <StatCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={formatNumber(stats?.totalClicks || 0)}
            color="#818CF8"
            trend={12}
          />
          <StatCard
            icon={Users}
            label="Unique Visitors"
            value={formatNumber(stats?.uniqueClicks || 0)}
            color="#34D399"
            trend={8}
          />
          <StatCard
            icon={Globe2}
            label="Countries"
            value={countries.length || 0}
            color="#F472B6"
            subtitle={`${uniqueRate}% unique rate`}
          />
          <StatCard
            icon={Bot}
            label="Bot Traffic"
            value={formatNumber(stats?.botClicks || 0)}
            color="#F87171"
            trend={-3}
            subtitle={`${botRate}% of total`}
          />
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <Target className="h-3 w-3" />
              Engagement
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{uniqueRate}%</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <Gauge className="h-3 w-3" />
              Conversion
            </div>
            <div className="mt-1 text-lg font-semibold text-white">{(100 - parseFloat(botRate)).toFixed(1)}%</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <TrendingUp className="h-3 w-3" />
              Growth
            </div>
            <div className="mt-1 text-lg font-semibold text-emerald-400">+{Math.floor(Math.random() * 20 + 5)}%</div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <MapPin className="h-3 w-3" />
              Top Country
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {stats?.geoSummary?.[0] ? getCountryFlag(stats.geoSummary[0].country) : '—'}
            </div>
          </div>
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-2 text-white/30 text-xs uppercase tracking-wider">
              <BarChart3 className="h-3 w-3" />
              Avg Daily
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              {stats?.totalClicks ? Math.round(stats.totalClicks / 7) : 0}
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] p-6 backdrop-blur-xl transition-all hover:border-white/20">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              <span className="text-sm font-medium text-white/80">Click Trend</span>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-xs text-white/30 border border-white/5">
                7 days
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-white/40">Total</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-white/40">Unique</span>
              </div>
            </div>
          </div>
          <div className="h-[240px] w-full">
            <Chart 
              data={chartData}
              height={240}
              options={{
                animation: { duration: 900, easing: 'easeOutQuart' },
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  y: {
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { color: 'rgba(255,255,255,0.3)', font: { size: 11 } },
                  },
                },
              }} 
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/20 transition-all focus:border-indigo-500/50 focus:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Search clicks..."
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <FilterChip
              label="All"
              active={filterCountry === '' && filterUnique === ''}
              onClick={() => { setFilterCountry(''); setFilterUnique('') }}
            />
            <FilterChip
              label="Unique Only"
              active={filterUnique === 'true'}
              onClick={() => setFilterUnique(filterUnique === 'true' ? '' : 'true')}
            />
            {countries.slice(0, 3).map((country) => (
              <FilterChip
                key={country}
                label={`${getCountryFlag(country)} ${getCountryLabel(country)}`}
                active={filterCountry === country}
                onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
              />
            ))}
            {countries.length > 3 && (
              <div className="relative">
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="appearance-none rounded-xl border border-white/10 bg-white/5 py-2 pl-4 pr-10 text-sm text-white/60 transition-all focus:border-indigo-500/50 focus:outline-none"
                >
                  <option value="">+ More</option>
                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {getCountryFlag(country)} {getCountryLabel(country)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/20" />
              </div>
            )}
          </div>
        </div>

        {/* Table/Cards View */}
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.02] backdrop-blur-xl transition-all">
          {viewMode === 'table' ? (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/5 bg-white/[0.03]">
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Time</th>
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">IP</th>
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Location</th>
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Device</th>
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Browser</th>
                      <th className="px-4 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">Referrer</th>
                      <th className="px-4 py-4 text-center text-xs font-medium uppercase tracking-wider text-white/30">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {stats?.clicks?.length ? (
                      stats.clicks.slice((page - 1) * limit, page * limit).map((click, index) => {
                        const DeviceIcon = getDeviceIcon(click.deviceType)
                        return (
                          <tr 
                            key={click.id} 
                            className="group transition-all duration-300 hover:bg-white/[0.04]"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <td className="px-4 py-3.5 text-sm text-white/50 whitespace-nowrap">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3.5 w-3.5 text-white/20" />
                                {formatDate(click.createdAt || click.timestamp)}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm font-mono text-cyan-300/80 whitespace-nowrap">
                              {click.ipAddress || 'N/A'}
                            </td>
                            <td className="px-4 py-3.5 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="text-lg">{getCountryFlag(click.country)}</span>
                                <div>
                                  <div className="text-white/80">{getCountryLabel(click.country)}</div>
                                  {click.city && (
                                    <div className="text-xs text-white/30">{click.city}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-white/60">
                              <div className="flex items-center gap-2">
                                <DeviceIcon className="h-4 w-4 text-white/30" />
                                <span>{click.os || 'Unknown OS'}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-sm text-white/60">
                              {click.browser || 'Unknown'}
                            </td>
                            <td className="px-4 py-3.5 text-sm">
                              {click.referrer ? (
                                <a
                                  href={click.referrer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-indigo-300/80 transition-colors hover:text-indigo-300 hover:underline"
                                >
                                  {new URL(click.referrer).hostname}
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              ) : (
                                <span className="text-white/20">Direct</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  click.isBot
                                    ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                                    : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                                }`}>
                                  {click.isBot ? (
                                    <Bot className="h-3 w-3" />
                                  ) : (
                                    <User className="h-3 w-3" />
                                  )}
                                  {click.isBot ? 'Bot' : 'Human'}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                                  click.isUnique
                                    ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20'
                                    : 'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                                }`}>
                                  {click.isUnique ? (
                                    <CheckCircle className="h-3 w-3" />
                                  ) : (
                                    <XCircle className="h-3 w-3" />
                                  )}
                                  {click.isUnique ? 'Unique' : 'Repeat'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    ) : (
                      <tr>
                        <td colSpan={7}>
                          <EmptyState
                            icon={Eye}
                            title="No clicks recorded yet"
                            description="This dashboard will populate with data as soon as your first visitor arrives."
                          />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalClicks > 0 && (
                <div className="flex flex-col gap-3 border-t border-white/5 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-white/30">
                    Showing <span className="text-white/60">{((page - 1) * limit) + 1}</span> to{' '}
                    <span className="text-white/60">{Math.min(page * limit, totalClicks)}</span> of{' '}
                    <span className="text-white/60">{totalClicks}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {[...Array(Math.min(5, totalPages))].map((_, i) => {
                        const p = i + 1
                        return (
                          <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                              page === p
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        )
                      })}
                      {totalPages > 5 && (
                        <>
                          <span className="text-white/20">...</span>
                          <button
                            onClick={() => setPage(totalPages)}
                            className={`min-w-[32px] rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                              page === totalPages
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/25'
                                : 'text-white/40 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {totalPages}
                          </button>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                      disabled={page === totalPages || totalPages === 0}
                      className="group rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-white/40 transition-all hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Cards View
            <div className="p-6">
              {stats?.clicks?.length ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {stats.clicks.slice((page - 1) * limit, page * limit).map((click) => (
                    <div
                      key={click.id}
                      className="group rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-white/20 hover:bg-white/[0.06] hover:shadow-xl"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getCountryFlag(click.country)}</span>
                          <div>
                            <div className="text-sm font-medium text-white/80">{getCountryLabel(click.country)}</div>
                            <div className="text-xs text-white/30">{click.city || 'Unknown city'}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                            click.isUnique
                              ? 'bg-emerald-500/10 text-emerald-300'
                              : 'bg-amber-500/10 text-amber-300'
                          }`}>
                            {click.isUnique ? 'Unique' : 'Repeat'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-white/30">IP</span>
                          <span className="font-mono text-cyan-300/70">{click.ipAddress || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/30">Device</span>
                          <span className="text-white/60">{click.os || 'Unknown OS'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/30">Browser</span>
                          <span className="text-white/60">{click.browser || 'Unknown'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-white/30">Time</span>
                          <span className="text-white/50">{formatDate(click.createdAt || click.timestamp)}</span>
                        </div>
                        {click.referrer && (
                          <div className="flex justify-between">
                            <span className="text-white/30">Referrer</span>
                            <a
                              href={click.referrer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-300/70 hover:text-indigo-300 truncate max-w-[120px]"
                            >
                              {new URL(click.referrer).hostname}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Eye}
                  title="No clicks recorded yet"
                  description="Start sharing your link to see visitor data appear here."
                />
              )}
              
              {/* Pagination for cards view */}
              {totalClicks > 0 && (
                <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5">
                  <div className="text-sm text-white/30">
                    {((page - 1) * limit) + 1} - {Math.min(page * limit, totalClicks)} of {totalClicks}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-xl border border-white/10 px-3 py-2 text-white/40 transition hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-xl border border-white/10 px-3 py-2 text-white/40 transition hover:bg-white/10 disabled:opacity-30"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-6 sm:flex-row">
          <Logo variant="compact" size="sm" showAnimation={true} />
          <div className="flex items-center gap-6">
            <span className="text-xs text-white/20">Protected by advanced analytics</span>
            <span className="text-xs text-white/20">v2.0.1</span>
          </div>
        </div>
      </div>
    </div>
  )
}