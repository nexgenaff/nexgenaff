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
  Link2,
  Calendar,
  Download,
  RefreshCw,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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

// Qliker-style Components
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  subtitle,
  color = '#818CF8' 
}: any) => (
  <div className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:bg-white/10">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-white/30">{subtitle}</p>}
      </div>
      <div className={`rounded-lg p-2.5 bg-${color}/10`}>
        <Icon className="h-4 w-4" style={{ color }} />
      </div>
    </div>
    {change && (
      <div className="mt-3 flex items-center gap-1.5">
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
      </div>
    )}
  </div>
)

const CountryBar = ({ country, clicks, total, max }: any) => {
  const percentage = max > 0 ? (clicks / max) * 100 : 0
  
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-lg w-8 flex-shrink-0">{getCountryFlag(country)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/70 truncate">{getCountryLabel(country)}</span>
          <span className="text-sm font-medium text-white/50">{formatNumber(clicks)}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #818CF8, #A78BFA)`
            }}
          />
        </div>
      </div>
    </div>
  )
}

const StatusBadge = ({ type, label, icon: Icon }: any) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
    type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
    type === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
    type === 'danger' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
    'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
  }`}>
    {Icon && <Icon className="h-3 w-3" />}
    {label}
  </span>
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
  const limit = 10

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
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
  const maxCountryClicks = stats?.geoSummary?.length ? Math.max(...stats.geoSummary.map(c => c.clicks)) : 0

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
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
              <div>
                <div className="h-6 w-48 bg-white/5 rounded animate-pulse" />
                <div className="h-3 w-32 bg-white/5 rounded mt-1 animate-pulse" />
              </div>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-9 w-20 bg-white/5 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-xl p-5 animate-pulse">
                <div className="h-4 w-24 bg-white/10 rounded mb-3" />
                <div className="h-8 w-32 bg-white/10 rounded" />
              </div>
            ))}
          </div>

          {/* Chart Skeleton */}
          <div className="bg-white/5 rounded-xl p-6 mb-6">
            <div className="h-[200px] w-full bg-white/10 rounded animate-pulse" />
          </div>

          {/* Table Skeleton */}
          <div className="bg-white/5 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-white/5">
              <div className="h-5 w-40 bg-white/10 rounded animate-pulse" />
            </div>
            <div className="p-4 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 w-full bg-white/5 rounded animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center max-w-md">
          <div className="bg-white/5 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Unable to Load Dashboard</h1>
          <p className="text-white/40 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-all"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500/10 rounded-lg p-2.5 border border-indigo-500/20">
              <Logo variant="compact" size="sm" showAnimation={true} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Public Analytics</h1>
              <p className="text-sm text-white/40">Real-time click statistics</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
              {['7d', '30d', '90d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range as any)}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-all ${
                    timeRange === range 
                      ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
            <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <MetricCard
            icon={MousePointerClick}
            label="Total Clicks"
            value={formatNumber(stats?.totalClicks || 0)}
            change="+12.5%"
            changeType="up"
            color="#818CF8"
          />
          <MetricCard
            icon={Users}
            label="Unique Visitors"
            value={formatNumber(stats?.uniqueClicks || 0)}
            change="+8.3%"
            changeType="up"
            color="#34D399"
          />
          <MetricCard
            icon={Globe2}
            label="Countries"
            value={countries.length || 0}
            change="+2"
            changeType="up"
            color="#F472B6"
            subtitle={`${uniqueRate}% unique rate`}
          />
          <MetricCard
            icon={Bot}
            label="Bot Traffic"
            value={formatNumber(stats?.botClicks || 0)}
            change="-3.1%"
            changeType="down"
            color="#F87171"
            subtitle={`${botRate}% of total`}
          />
        </div>

        {/* Chart & Geography */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-medium text-white/70">Click Activity</span>
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
          </div>

          {/* Top Countries */}
          <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <Globe2 className="h-4 w-4 text-indigo-400" />
              <span className="text-sm font-medium text-white/70">Top Countries</span>
            </div>
            <div className="space-y-3">
              {stats?.geoSummary?.slice(0, 5).map((country, index) => (
                <CountryBar
                  key={country.country}
                  country={country.country}
                  clicks={country.clicks}
                  total={country.clicks}
                  max={maxCountryClicks}
                />
              ))}
              {(!stats?.geoSummary || stats.geoSummary.length === 0) && (
                <div className="text-center py-8">
                  <Globe2 className="h-8 w-8 text-white/10 mx-auto mb-2" />
                  <p className="text-sm text-white/30">No geographic data yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10 flex-1 min-w-[200px]">
            <Search className="h-4 w-4 text-white/20" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
              placeholder="Search clicks..."
            />
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => { setFilterCountry(''); setFilterUnique('') }}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterCountry === '' && filterUnique === ''
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterUnique(filterUnique === 'true' ? '' : 'true')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterUnique === 'true'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              Unique
            </button>
            {countries.slice(0, 2).map((country) => (
              <button
                key={country}
                onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filterCountry === country
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {getCountryFlag(country)}
              </button>
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
        </div>

        {/* Data Table */}
        <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
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
                  stats.clicks.slice((page - 1) * limit, page * limit).map((click) => {
                    const DeviceIcon = getDeviceIcon(click.deviceType)
                    return (
                      <tr key={click.id} className="hover:bg-white/[0.03] transition-colors">
                        <td className="px-4 py-3 text-sm text-white/40 whitespace-nowrap">
                          {formatDate(click.createdAt || click.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span>{getCountryFlag(click.country)}</span>
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
                            <a
                              href={click.referrer}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-indigo-300/60 hover:text-indigo-300 transition-colors"
                            >
                              {new URL(click.referrer).hostname}
                            </a>
                          ) : (
                            <span className="text-white/20">Direct</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5">
                            <StatusBadge
                              type={click.isBot ? 'danger' : 'success'}
                              label={click.isBot ? 'Bot' : 'Human'}
                              icon={click.isBot ? Bot : User}
                            />
                            <StatusBadge
                              type={click.isUnique ? 'success' : 'warning'}
                              label={click.isUnique ? 'Unique' : 'Repeat'}
                              icon={click.isUnique ? CheckCircle : XCircle}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Eye className="h-8 w-8 text-white/10" />
                        <p className="text-sm text-white/30">No clicks recorded yet</p>
                        <p className="text-xs text-white/20">Share your link to start collecting analytics</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalClicks > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-white/5 px-4 py-3">
              <div className="text-xs text-white/30">
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalClicks)} of {totalClicks}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-white/40 px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-white/5">
          <div className="flex items-center gap-2">
            <Logo variant="compact" size="sm" showAnimation={true} />
            <span className="text-xs text-white/20">Powered by NexGen Affiliates</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-white/20">
            <span>Privacy protected</span>
            <span>•</span>
            <span>Real-time analytics</span>
          </div>
        </div>

      </div>
    </div>
  )
}