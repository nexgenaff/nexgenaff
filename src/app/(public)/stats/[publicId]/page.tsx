// app/(public)/stats/[publicId]/page.tsx
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
  ChevronDown,
  Activity,
  Shield,
  Download,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  MapPin,
  Hash,
  Apple,
  Laptop,
  Computer,
  Link2,
  FileText,
  Filter,
  Globe,
  MousePointer,
  ArrowRight,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

// Types
interface Stats {
  accountName?: string
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
}

// Metric Card – adapts to theme
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  subtitle,
  color = '#818CF8',
  percentage,
  percentageColor = '#818CF8',
  isDark = true
}: any) => (
  <div className={`group relative overflow-hidden rounded-xl border p-5 transition-all duration-200 hover:scale-[1.02] ${
    isDark 
      ? 'bg-white/5 backdrop-blur-sm border-white/10 hover:border-white/20 hover:bg-white/10' 
      : 'bg-white/80 backdrop-blur-sm border-gray-200 hover:border-indigo-300 hover:bg-white'
  }`}>
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <p className={`text-[11px] font-medium uppercase tracking-wider ${
          isDark ? 'text-white/40' : 'text-gray-500'
        }`}>{label}</p>
        <p className={`text-2xl font-bold tracking-tight ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>{value}</p>
        {subtitle && <p className={`text-[11px] ${isDark ? 'text-white/30' : 'text-gray-500'}`}>{subtitle}</p>}
        {percentage !== undefined && (
          <div className="mt-1 flex items-center gap-1.5">
            <div className={`h-1 w-16 rounded-full overflow-hidden ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${Math.min(percentage, 100)}%`,
                  backgroundColor: percentageColor
                }}
              />
            </div>
            <span className="text-[10px] font-medium" style={{ color: percentageColor }}>
              {percentage.toFixed(1)}%
            </span>
          </div>
        )}
      </div>
      <div className="rounded-lg p-2 shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.5} />
      </div>
    </div>
  </div>
)

// Country Bar with theme support
const CountryBar = ({ country, clicks, totalClicks, max, isDark = true }: any) => {
  const percentage = max > 0 ? (clicks / max) * 100 : 0
  const share = totalClicks > 0 ? ((clicks / totalClicks) * 100).toFixed(1) : '0.0'
  const flag = getCountryFlag(country) || '🌍'
  
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-lg w-8 flex-shrink-0 text-center">{flag}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-sm truncate ${isDark ? 'text-white/70' : 'text-gray-700'}`}>
            {getCountryLabel(country)}
          </span>
          <span className={`text-xs font-medium tabular-nums flex items-center gap-2 ${
            isDark ? 'text-white/50' : 'text-gray-600'
          }`}>
            <span>{formatNumber(clicks)}</span>
            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
              isDark 
                ? 'bg-indigo-500/20 text-indigo-300' 
                : 'bg-indigo-100 text-indigo-700'
            }`}>
              {share}%
            </span>
          </span>
        </div>
        <div className={`h-1.5 w-full rounded-full overflow-hidden ${
          isDark ? 'bg-white/5' : 'bg-gray-200'
        }`}>
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out will-change-transform"
            style={{ 
              width: `${percentage}%`,
              background: `linear-gradient(90deg, #818CF8, #A78BFA)`,
              transform: 'translateZ(0)'
            }}
          />
        </div>
      </div>
    </div>
  )
}

// Optimized Status Badge
const StatusBadge = ({ type, label, icon: Icon, isDark = true }: any) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
    type === 'success' ? (isDark ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' : 'bg-emerald-50 text-emerald-700 border-emerald-200') :
    type === 'warning' ? (isDark ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' : 'bg-amber-50 text-amber-700 border-amber-200') :
    type === 'danger' ? (isDark ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' : 'bg-rose-50 text-rose-700 border-rose-200') :
    (isDark ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20' : 'bg-indigo-50 text-indigo-700 border-indigo-200')
  }`}>
    {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={2} />}
    {label}
  </span>
)

// Skeleton Loader
const SkeletonLoader = ({ isDark = true }: { isDark?: boolean }) => (
  <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`h-10 w-10 rounded-lg ${isDark ? 'bg-white/5' : 'bg-gray-200'} animate-pulse`} />
          <div>
            <div className={`h-5 w-40 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded animate-pulse`} />
            <div className={`h-3 w-28 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded mt-1 animate-pulse`} />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className={`h-9 w-16 ${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-lg animate-pulse`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-xl p-5 animate-pulse`}>
            <div className={`h-3 w-20 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded mb-3`} />
            <div className={`h-7 w-28 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded`} />
          </div>
        ))}
      </div>
      <div className={`${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-xl p-5 mb-6`}>
        <div className={`h-[180px] w-full ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded animate-pulse`} />
      </div>
      <div className={`${isDark ? 'bg-white/5' : 'bg-gray-200'} rounded-xl overflow-hidden`}>
        <div className="p-4 border-b border-white/5">
          <div className={`h-4 w-32 ${isDark ? 'bg-white/10' : 'bg-gray-300'} rounded animate-pulse`} />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`h-10 w-full ${isDark ? 'bg-white/5' : 'bg-gray-100'} rounded animate-pulse`} />
          ))}
        </div>
      </div>
    </div>
  </div>
)

// Main Component
export default function PublicStatsPage({ params }: { params: Promise<{ publicId: string }> }) {
  const resolvedParams = use(params)
  const publicId = resolvedParams.publicId

  // Theme state
  const [isDark, setIsDark] = useState(true)
  const [themeLoaded, setThemeLoaded] = useState(false)

  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('theme')
    if (stored === 'light') {
      setIsDark(false)
    } else if (stored === 'dark') {
      setIsDark(true)
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      setIsDark(false)
    }
    setThemeLoaded(true)
  }, [])

  // Persist theme
  useEffect(() => {
    if (themeLoaded) {
      localStorage.setItem('theme', isDark ? 'dark' : 'light')
    }
  }, [isDark, themeLoaded])

  const toggleTheme = () => setIsDark(!isDark)

  const [stats, setStats] = useState<Stats | null>(null)
  const [accountName, setAccountName] = useState('NexGen Affiliates')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filterCountry, setFilterCountry] = useState('')
  const [filterUnique, setFilterUnique] = useState<'all' | 'unique' | 'repeat'>('all')
  const [filterReferrer, setFilterReferrer] = useState<'all' | 'direct' | 'referrer'>('all')
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Optimized fetch with abort controller
  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchStats = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(
          `/api/analytics/public/${publicId}?search=${encodeURIComponent(search)}&country=${encodeURIComponent(filterCountry)}&range=${timeRange}&limit=10000`,
          { signal: abortController.signal }
        )
        if (!response.ok) throw new Error('Dashboard not found')
        const data = await response.json()
        setStats(data)
        setAccountName(data.accountName || 'NexGen Affiliates')
        setError('')
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setError(err.message)
        }
      } finally {
        setLoading(false)
        setIsRefreshing(false)
      }
    }

    fetchStats()
    return () => abortController.abort()
  }, [publicId, search, filterCountry, timeRange])

  const getDeviceIcon = useCallback((deviceType: string | null, deviceBrand: string | null) => {
    if (!deviceType) return Monitor
    
    const type = deviceType.toLowerCase()
    const brand = deviceBrand?.toLowerCase() || ''
    
    // Apple devices
    if (brand.includes('apple') || brand.includes('iphone') || brand.includes('ipad') || brand.includes('mac')) {
      if (type.includes('phone') || type.includes('mobile')) return Smartphone
      if (type.includes('tablet')) return Tablet
      return Apple
    }
    
    // Desktop
    if (type.includes('desktop') || type.includes('computer')) return Computer
    
    // Mobile
    if (type.includes('mobile') || type.includes('phone')) return Smartphone
    
    // Tablet
    if (type.includes('tablet')) return Tablet
    
    // Default
    return Monitor
  }, [])

  const getDeviceLabel = useCallback((click: Stats['clicks'][number]) => {
    const brand = click.deviceBrand || ''
    const os = click.os || ''
    const type = click.deviceType || ''
    
    // Build detailed device name
    let parts = []
    
    if (brand) parts.push(brand)
    if (type && !brand.toLowerCase().includes(type.toLowerCase())) {
      parts.push(type)
    }
    if (os && !parts.some(p => p.toLowerCase().includes(os.toLowerCase()))) {
      parts.push(os)
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'Unknown Device'
  }, [])

  const formatDate = useCallback((date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }, [])

  // Smart filtering logic
  const filteredClicks = useMemo(() => {
    if (!stats?.clicks) return []
    
    let result = stats.clicks
    
    // Search filter
    if (search) {
      const searchLower = search.toLowerCase()
      result = result.filter(click => 
        click.ipAddress?.toLowerCase().includes(searchLower) ||
        click.country?.toLowerCase().includes(searchLower) ||
        click.city?.toLowerCase().includes(searchLower) ||
        click.browser?.toLowerCase().includes(searchLower) ||
        click.os?.toLowerCase().includes(searchLower) ||
        click.deviceType?.toLowerCase().includes(searchLower) ||
        click.referrer?.toLowerCase().includes(searchLower)
      )
    }
    
    // Country filter
    if (filterCountry) {
      result = result.filter(click => click.country === filterCountry)
    }
    
    // Unique filter with smart direct click removal
    if (filterUnique === 'unique') {
      result = result.filter(click => click.isUnique === true)
      // Smart: When filtering unique, also automatically remove direct clicks
      result = result.filter(click => click.referrer !== null && click.referrer !== '')
    } else if (filterUnique === 'repeat') {
      result = result.filter(click => click.isUnique === false)
    }
    
    // Referrer filter
    if (filterReferrer === 'direct') {
      result = result.filter(click => !click.referrer || click.referrer === '')
    } else if (filterReferrer === 'referrer') {
      result = result.filter(click => click.referrer && click.referrer !== '')
    }
    
    return result
  }, [stats?.clicks, search, filterCountry, filterUnique, filterReferrer])

  // Memoized computed values – all real data
  const countries = useMemo(() => 
    stats?.geoSummary?.map(e => e.country).filter(Boolean) || []
  , [stats?.geoSummary])

  const totalClicks = stats?.totalClicks || 0
  const uniqueClicks = stats?.uniqueClicks || 0
  const botClicks = stats?.botClicks || 0
  const displayTitle = accountName && accountName !== 'NexGen Affiliates' ? accountName : 'Public Analytics'
  const displaySubtitle = accountName && accountName !== 'NexGen Affiliates'
    ? `Live traffic insights for ${accountName}`
    : 'Public analytics dashboard'
  const uniqueRate = totalClicks ? ((uniqueClicks / totalClicks) * 100) : 0
  const botRate = totalClicks ? ((botClicks / totalClicks) * 100) : 0
  const maxCountryClicks = stats?.geoSummary?.length 
    ? Math.max(...stats.geoSummary.map(c => c.totalClicks)) 
    : 0

  // Real unique visitors (excluding direct clicks)
  const uniqueVisitors = useMemo(() => {
    if (!stats?.clicks) return 0
    return stats.clicks.filter(c => c.isUnique && c.referrer && c.referrer !== '').length
  }, [stats?.clicks])

  const chartData = useMemo(() => ({
    labels: stats?.clickTrend?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Clicks',
        data: stats?.clickTrend?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#818CF8',
        backgroundColor: isDark ? 'rgba(129, 140, 248, 0.08)' : 'rgba(129, 140, 248, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#818CF8',
        borderWidth: 1.5,
      },
    ],
  }), [stats?.clickTrend, isDark])

  if (!themeLoaded) return <div className="min-h-screen bg-slate-950" />

  if (loading) return <SkeletonLoader isDark={isDark} />

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'}`}>
        <div className="text-center max-w-md px-4">
          <div className={`rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
            <Shield className={`h-8 w-8 ${isDark ? 'text-rose-400' : 'text-rose-600'}`} strokeWidth={1.5} />
          </div>
          <h1 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>Unable to Load Dashboard</h1>
          <p className={`text-sm mb-6 ${isDark ? 'text-white/40' : 'text-gray-600'}`}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors text-sm"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Get selected country label/flag
  const selectedCountryLabel = filterCountry ? getCountryLabel(filterCountry) : ''
  const selectedCountryFlag = filterCountry ? (getCountryFlag(filterCountry) || '🌍') : ''

  return (
    <>
      {/* JSON-LD Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataDashboard',
            name: displayTitle,
            description: `Real-time analytics with ${totalClicks} total clicks and ${uniqueVisitors} unique visitors`,
            url: `https://nexgenaffiliates.vercel.app/stats/${publicId}`,
            provider: {
              '@type': 'Organization',
              name: 'NexGen Affiliates',
              url: 'https://nexgenaffiliates.vercel.app',
              logo: 'https://nexgenaffiliates.vercel.app/favicon.png',
            },
            dateModified: new Date().toISOString(),
            identifier: publicId,
            mainEntity: {
              '@type': 'WebPage',
              name: 'Public Analytics Dashboard',
              description: 'Track clicks, visitors, and geographic data in real-time',
            },
          }),
        }}
      />

      <div className={`min-h-screen transition-colors duration-300 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950' 
          : 'bg-gradient-to-br from-gray-50 via-white to-gray-50'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg p-2 border shrink-0 ${
                isDark 
                  ? 'bg-indigo-500/10 border-indigo-500/20' 
                  : 'bg-indigo-50 border-indigo-200'
              }`}>
                <Logo variant="compact" size="sm" showAnimation={true} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {displayTitle}
                  </h1>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-[0.2em] ${
                    isDark 
                      ? 'border-indigo-400/20 bg-indigo-500/10 text-indigo-300' 
                      : 'border-indigo-300 bg-indigo-50 text-indigo-700'
                  }`}>
                    Public
                  </span>
                </div>
                <p className={`text-xs ${isDark ? 'text-white/40' : 'text-gray-600'}`}>{displaySubtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className={`flex rounded-lg p-0.5 border ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-gray-200'
              }`}>
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      timeRange === range 
                        ? 'bg-indigo-500 text-white'
                        : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => {
                  setTimeRange(timeRange)
                  setIsRefreshing(true)
                  setTimeout(() => setIsRefreshing(false), 500)
                }}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white/40 hover:text-white/70' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-800'
                }`}
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              </button>
              <button className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white/40 hover:text-white/70' 
                  : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-800'
              }`}>
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark 
                    ? 'bg-white/5 border-white/10 text-white/40 hover:text-white/70' 
                    : 'bg-gray-100 border-gray-200 text-gray-500 hover:text-gray-800'
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="h-3.5 w-3.5" strokeWidth={1.5} /> : <Moon className="h-3.5 w-3.5" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          {/* Quick Stats – with percentage progress bars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
            <MetricCard
              icon={MousePointerClick}
              label="Total Clicks"
              value={formatNumber(totalClicks)}
              color="#818CF8"
              percentage={100}
              percentageColor="#818CF8"
              subtitle="100% of all traffic"
              isDark={isDark}
            />
            <MetricCard
              icon={Users}
              label="Unique Visitors"
              value={formatNumber(uniqueVisitors)}
              color="#34D399"
              percentage={uniqueRate}
              percentageColor="#34D399"
              subtitle={`${uniqueRate.toFixed(1)}% of total clicks`}
              isDark={isDark}
            />
            <MetricCard
              icon={Globe2}
              label="Countries"
              value={countries.length || 0}
              color="#F472B6"
              percentage={countries.length > 0 ? 100 : 0}
              percentageColor="#F472B6"
              subtitle={`${uniqueClicks} unique total`}
              isDark={isDark}
            />
            <MetricCard
              icon={Bot}
              label="Bot Traffic"
              value={formatNumber(botClicks)}
              color="#F87171"
              percentage={botRate}
              percentageColor="#F87171"
              subtitle={`${botRate.toFixed(1)}% of total`}
              isDark={isDark}
            />
          </div>

          {/* Chart & Geography */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
            <div className={`lg:col-span-2 rounded-xl border p-4 ${
              isDark 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : 'bg-white/80 backdrop-blur-sm border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1.5} />
                  <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Click Activity</span>
                </div>
                <div className={`flex items-center gap-2 text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                    Clicks
                  </span>
                </div>
              </div>
              <div className="h-[160px] w-full">
                <Chart 
                  data={chartData}
                  height={160}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: { color: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)', drawBorder: false },
                        ticks: { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', font: { size: 9 }, maxTicksLimit: 5 },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.3)', font: { size: 9 } },
                      },
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                  }}
                />
              </div>
            </div>

            <div className={`rounded-xl border p-4 ${
              isDark 
                ? 'bg-white/5 backdrop-blur-sm border-white/10' 
                : 'bg-white/80 backdrop-blur-sm border-gray-200'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Globe2 className={`h-4 w-4 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={1.5} />
                  <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-gray-700'}`}>Top Countries</span>
                </div>
                <span className={`text-[10px] ${isDark ? 'text-white/30' : 'text-gray-400'}`}>% of total</span>
              </div>
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {stats?.geoSummary?.slice(0, 5).map((country) => (
                  <CountryBar
                    key={country.country}
                    country={country.country}
                    clicks={country.totalClicks}
                    totalClicks={totalClicks}
                    max={maxCountryClicks}
                    isDark={isDark}
                  />
                ))}
                {(!stats?.geoSummary || stats.geoSummary.length === 0) && (
                  <div className="text-center py-6">
                    <Globe2 className={`h-7 w-7 mx-auto mb-2 ${isDark ? 'text-white/10' : 'text-gray-300'}`} strokeWidth={1.5} />
                    <p className={`text-xs ${isDark ? 'text-white/30' : 'text-gray-400'}`}>No geographic data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Smart Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border flex-1 min-w-[160px] ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/80 border-gray-200'
            }`}>
              <Search className={`h-3.5 w-3.5 ${isDark ? 'text-white/20' : 'text-gray-400'}`} strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={`bg-transparent border-none outline-none text-sm w-full ${
                  isDark ? 'text-white placeholder:text-white/20' : 'text-gray-800 placeholder:text-gray-400'
                }`}
                placeholder="Search by IP, country, browser..."
              />
            </div>
            
            <div className="flex items-center gap-1 flex-wrap">
              <button
                onClick={() => { 
                  setFilterCountry(''); 
                  setFilterUnique('all');
                  setFilterReferrer('all');
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterCountry === '' && filterUnique === 'all' && filterReferrer === 'all'
                    ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                    : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                All
              </button>

              <button
                onClick={() => {
                  setFilterUnique(filterUnique === 'unique' ? 'all' : 'unique')
                  if (filterUnique !== 'unique') {
                    setFilterReferrer('referrer')
                  } else {
                    setFilterReferrer('all')
                  }
                }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterUnique === 'unique'
                    ? (isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700')
                    : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                <Users className="h-3 w-3" />
                Unique
                {filterUnique === 'unique' && (
                  <span className={`text-[8px] px-1 rounded ${
                    isDark ? 'bg-emerald-500/30' : 'bg-emerald-200'
                  }`}>no direct</span>
                )}
              </button>

              <button
                onClick={() => setFilterUnique(filterUnique === 'repeat' ? 'all' : 'repeat')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterUnique === 'repeat'
                    ? (isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-700')
                    : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                Repeat
              </button>

              <button
                onClick={() => setFilterReferrer(filterReferrer === 'direct' ? 'all' : 'direct')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterReferrer === 'direct'
                    ? (isDark ? 'bg-rose-500/20 text-rose-300' : 'bg-rose-100 text-rose-700')
                    : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                <MousePointer className="h-3 w-3" />
                Direct
              </button>

              <button
                onClick={() => setFilterReferrer(filterReferrer === 'referrer' ? 'all' : 'referrer')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  filterReferrer === 'referrer'
                    ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                    : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                }`}
              >
                <Link2 className="h-3 w-3" />
                Referrer
              </button>

              {/* First two country buttons */}
              {countries.slice(0, 2).map((country) => {
                const flag = getCountryFlag(country) || '🌍'
                return (
                  <button
                    key={country}
                    onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                      filterCountry === country
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                        : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                    }`}
                  >
                    <span className="text-base">{flag}</span>
                  </button>
                )
              })}

              {/* Custom "More" dropdown for remaining countries */}
              {countries.length > 2 && (
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                      filterCountry && !countries.slice(0, 2).includes(filterCountry)
                        ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-100 text-indigo-700')
                        : (isDark ? 'text-white/40 hover:text-white/70' : 'text-gray-600 hover:text-gray-900')
                    }`}
                  >
                    {filterCountry && !countries.slice(0, 2).includes(filterCountry) ? (
                      <>
                        <span className="text-base">{selectedCountryFlag}</span>
                        <span className="truncate max-w-[60px]">{selectedCountryLabel}</span>
                      </>
                    ) : (
                      <>
                        <Globe className="h-3 w-3" />
                        More
                      </>
                    )}
                    <ChevronDown className={`h-3 w-3 transition-transform ${isCountryDropdownOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                  </button>

                  {/* Dropdown menu */}
                  {isCountryDropdownOpen && (
                    <div className={`absolute top-full left-0 mt-1 w-48 max-h-60 overflow-y-auto rounded-lg border shadow-xl z-20 py-1 ${
                      isDark 
                        ? 'bg-slate-800 border-white/10' 
                        : 'bg-white border-gray-200'
                    }`}>
                      <div className={`px-2 py-1.5 text-[10px] font-medium uppercase tracking-wider border-b ${
                        isDark ? 'text-white/30 border-white/5' : 'text-gray-400 border-gray-100'
                      }`}>
                        Select Country
                      </div>
                      {countries.slice(2).map((country) => {
                        const flag = getCountryFlag(country) || '🌍'
                        const label = getCountryLabel(country)
                        const isSelected = filterCountry === country
                        return (
                          <button
                            key={country}
                            onClick={() => {
                              setFilterCountry(country)
                              setIsCountryDropdownOpen(false)
                            }}
                            className={`w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors ${
                              isSelected
                                ? (isDark ? 'bg-indigo-500/20 text-indigo-300' : 'bg-indigo-50 text-indigo-700')
                                : (isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900')
                            }`}
                          >
                            <span className="text-base">{flag}</span>
                            <span className="truncate">{label}</span>
                            {isSelected && (
                              <CheckCircle className={`h-3 w-3 ml-auto ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`} strokeWidth={2} />
                            )}
                          </button>
                        )
                      })}
                      {filterCountry && !countries.slice(0, 2).includes(filterCountry) && (
                        <div className={`border-t px-2 py-1 ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                          <button
                            onClick={() => {
                              setFilterCountry('')
                              setIsCountryDropdownOpen(false)
                            }}
                            className={`w-full px-2 py-1 text-[10px] rounded flex items-center gap-1 ${
                              isDark ? 'text-rose-400 hover:bg-rose-500/10' : 'text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            <X className="h-3 w-3" />
                            Clear filter
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 ml-auto">
              <span className={`text-[10px] px-2 py-1 rounded border ${
                isDark 
                  ? 'text-white/30 bg-white/5 border-white/5' 
                  : 'text-gray-600 bg-gray-50 border-gray-200'
              }`}>
                {filteredClicks.length} / {stats?.clicks?.length || 0} logs
              </span>
              {filterUnique === 'unique' && (
                <span className={`text-[10px] px-2 py-1 rounded border flex items-center gap-1 ${
                  isDark 
                    ? 'text-emerald-400/60 bg-emerald-500/10 border-emerald-500/20' 
                    : 'text-emerald-700 bg-emerald-50 border-emerald-200'
                }`}>
                  <ArrowRight className="h-2.5 w-2.5" />
                  Direct clicks excluded
                </span>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className={`rounded-xl border overflow-hidden ${
            isDark 
              ? 'bg-white/5 backdrop-blur-sm border-white/10' 
              : 'bg-white/80 backdrop-blur-sm border-gray-200'
          }`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={`border-b ${
                  isDark ? 'bg-white/[0.03] border-white/5' : 'bg-gray-50 border-gray-200'
                } sticky top-0 z-10`}>
                  <tr>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        Time
                      </div>
                    </th>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" strokeWidth={1.5} />
                        IP
                      </div>
                    </th>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        Location
                      </div>
                    </th>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" strokeWidth={1.5} />
                        Device
                      </div>
                    </th>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>Browser</th>
                    <th className={`px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider min-w-[200px] whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Link2 className="h-3 w-3" strokeWidth={1.5} />
                        Referrer
                      </div>
                    </th>
                    <th className={`px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider whitespace-nowrap ${
                      isDark ? 'text-white/30' : 'text-gray-500'
                    }`}>Status</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                  {filteredClicks.length > 0 ? (
                    filteredClicks.map((click) => {
                      const DeviceIcon = getDeviceIcon(click.deviceType, click.deviceBrand)
                      const deviceLabel = getDeviceLabel(click)
                      const flag = getCountryFlag(click.country) || '🌍'
                      
                      return (
                        <tr key={click.id} className={`transition-colors ${isDark ? 'hover:bg-white/[0.02]' : 'hover:bg-gray-50'}`}>
                          <td className={`px-3 py-2.5 text-xs whitespace-nowrap ${isDark ? 'text-white/40' : 'text-gray-500'}`}>
                            {formatDate(click.createdAt || click.timestamp)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className={`text-xs font-mono whitespace-nowrap ${isDark ? 'text-cyan-300/80' : 'text-cyan-700'}`}>
                              {click.ipAddress || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-lg flex-shrink-0 w-6 text-center">{flag}</span>
                              <span className={`text-xs truncate max-w-[80px] ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                                {getCountryLabel(click.country)}
                              </span>
                              {click.city && (
                                <span className={`text-[10px] hidden md:inline ${isDark ? 'text-white/30' : 'text-gray-400'}`}>• {click.city}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-white/60' : 'text-gray-600'}`}>
                              <DeviceIcon className={`h-3.5 w-3.5 ${isDark ? 'text-white/40' : 'text-gray-400'}`} strokeWidth={1.5} />
                              <span className="truncate max-w-[120px]" title={deviceLabel}>
                                {deviceLabel}
                              </span>
                            </div>
                          </td>
                          <td className={`px-3 py-2.5 text-xs truncate max-w-[80px] ${isDark ? 'text-white/50' : 'text-gray-500'}`}>
                            {click.browser || 'Unknown'}
                            {click.browserVersion && (
                              <span className={`text-[10px] ml-1 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>v{click.browserVersion}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs">
                            {click.referrer ? (
                              <div className="flex items-center gap-1.5 group/referrer">
                                <ExternalLink className={`h-3 w-3 flex-shrink-0 transition-colors ${isDark ? 'text-white/20 group-hover/referrer:text-indigo-400' : 'text-gray-400 group-hover/referrer:text-indigo-600'}`} strokeWidth={1.5} />
                                <a
                                  href={click.referrer}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`transition-colors break-all text-[11px] ${isDark ? 'text-indigo-300/70 hover:text-indigo-300' : 'text-indigo-600/70 hover:text-indigo-800'}`}
                                  title={click.referrer}
                                >
                                  {click.referrer}
                                </a>
                              </div>
                            ) : (
                              <span className={`flex items-center gap-1.5 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-300'}`}></span>
                                Direct
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
                              <StatusBadge
                                type={click.isBot ? 'danger' : 'success'}
                                label={click.isBot ? 'Bot' : 'Human'}
                                icon={click.isBot ? Bot : User}
                                isDark={isDark}
                              />
                              <StatusBadge
                                type={click.isUnique ? 'success' : 'warning'}
                                label={click.isUnique ? 'Unique' : 'Repeat'}
                                icon={click.isUnique ? CheckCircle : XCircle}
                                isDark={isDark}
                              />
                            </div>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <Eye className={`h-7 w-7 ${isDark ? 'text-white/10' : 'text-gray-300'}`} strokeWidth={1.5} />
                          <p className={`text-sm ${isDark ? 'text-white/30' : 'text-gray-500'}`}>No clicks match your filters</p>
                          <p className={`text-xs ${isDark ? 'text-white/20' : 'text-gray-400'}`}>Try adjusting your search or filter criteria</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Stats Footer */}
            {filteredClicks.length > 0 && (
              <div className={`flex flex-col sm:flex-row items-center justify-between gap-2 border-t px-3 py-2.5 ${
                isDark ? 'border-white/5' : 'border-gray-200'
              }`}>
                <div className={`text-xs flex items-center gap-4 flex-wrap ${isDark ? 'text-white/30' : 'text-gray-600'}`}>
                  <span>Total: {filteredClicks.length} clicks</span>
                  <span>•</span>
                  <span>Unique: {filteredClicks.filter(c => c.isUnique).length}</span>
                  <span>•</span>
                  <span>Bots: {filteredClicks.filter(c => c.isBot).length}</span>
                  {filterUnique === 'unique' && (
                    <span className={isDark ? 'text-emerald-400/60' : 'text-emerald-700'}>✨ Direct clicks excluded</span>
                  )}
                </div>
                <div className={`text-xs flex items-center gap-2 ${isDark ? 'text-white/20' : 'text-gray-400'}`}>
                  <FileText className="h-3 w-3" strokeWidth={1.5} />
                  <span>All logs displayed</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer - Branding text contrast fixed */}
          <div className={`mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t ${
            isDark ? 'border-white/5' : 'border-gray-200'
          }`}>
            <div className="flex items-center gap-2">
              <Logo variant="compact" size="sm" showAnimation={true} />
              <span className={`text-[10px] font-medium ${
                isDark ? 'text-white/40' : 'text-gray-700'
              }`}>
                NexGen Affiliates
              </span>
            </div>
            <div className={`flex items-center gap-3 text-[10px] flex-wrap ${
              isDark ? 'text-white/30' : 'text-gray-500'
            }`}>
              <span>Privacy protected</span>
              <span>•</span>
              <span>Real-time analytics</span>
              <span>•</span>
              <span>{filteredClicks.length} total logs</span>
              {filterUnique === 'unique' && (
                <>
                  <span>•</span>
                  <span className={isDark ? 'text-emerald-400/60' : 'text-emerald-700'}>Smart filter: no direct clicks</span>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}