// app/(public)/stats/[publicId]/page.tsx

import { Metadata } from 'next'
import { use, useState, useEffect, useCallback, useMemo } from 'react'
import { notFound } from 'next/navigation'
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

// Generate metadata with OG tags using favicon
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ publicId: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const publicId = resolvedParams.publicId
  
  // Base URL
  const baseUrl = 'https://nexgenaffiliates.vercel.app'
  const url = `${baseUrl}/stats/${publicId}`
  
  // Use favicon.png as OG image source
  const ogImage = `${baseUrl}/favicon.png`
  
  // You can also create a larger version for better previews
  // Copy favicon.png to public/images/og-image.png and use that instead
  const ogImageLarge = `${baseUrl}/images/og-image.png` // Optional: create this for better quality
  
  // Dynamic title based on public ID
  const title = `Public Analytics Dashboard | NexGen Affiliates`
  const description = `View real-time click statistics, visitor analytics, and performance metrics for your shared links. Track clicks, unique visitors, and geographic data instantly.`
  
  return {
    title,
    description,
    keywords: ['analytics', 'click tracking', 'public stats', 'real-time analytics', 'visitor tracking', 'link analytics'],
    authors: [{ name: 'NexGen Affiliates' }],
    creator: 'NexGen Affiliates',
    publisher: 'NexGen Affiliates',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: 'NexGen Affiliates',
      type: 'website',
      locale: 'en_US',
      images: [
        {
          url: ogImage,
          width: 512, // Favicon typically 512x512
          height: 512,
          alt: 'NexGen Affiliates - Public Analytics Dashboard',
          type: 'image/png',
        },
        // If you have a larger version for social sharing
        ...(ogImageLarge ? [{
          url: ogImageLarge,
          width: 1200,
          height: 630,
          alt: 'NexGen Affiliates - Public Analytics Dashboard',
          type: 'image/png',
        }] : []),
      ],
    },
    twitter: {
      card: 'summary', // Use 'summary' since we're using a square image
      title,
      description,
      images: [ogImage],
      site: '@nexgenaff',
      creator: '@nexgenaff',
    },
    icons: {
      icon: '/favicon.png',
      shortcut: '/favicon.png',
      apple: '/favicon.png', // Use favicon for apple touch as well
    },
    manifest: '/site.webmanifest',
    applicationName: 'NexGen Affiliates',
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'NexGen Affiliates',
    },
    formatDetection: {
      telephone: false,
    },
    other: {
      'og:image:width': '512',
      'og:image:height': '512',
      'og:image:type': 'image/png',
      'og:rich_attachment': 'true',
      'article:author': 'NexGen Affiliates',
      'article:publisher': 'https://nexgenaffiliates.vercel.app',
      // Telegram specific
      'telegram:channel': '@nexgenaff',
      // WhatsApp specific
      'whatsapp:title': title,
      // LinkedIn specific
      'linkedin:title': title,
      'linkedin:description': description,
    },
  }
}

// Optimized Metric Card
const MetricCard = ({ 
  icon: Icon, 
  label, 
  value, 
  change, 
  changeType = 'neutral',
  subtitle,
  color = '#818CF8' 
}: any) => (
  <div className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 p-5 transition-all duration-200 hover:border-white/20 hover:bg-white/10 hover:scale-[1.02]">
    <div className="flex items-start justify-between">
      <div className="space-y-1.5">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/40">{label}</p>
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-white/30">{subtitle}</p>}
      </div>
      <div className="rounded-lg p-2 shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="h-4 w-4" style={{ color }} strokeWidth={1.5} />
      </div>
    </div>
    {change && (
      <div className="mt-2.5 flex items-center gap-1.5">
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
        <span className="text-[11px] text-white/20">vs last period</span>
      </div>
    )}
  </div>
)

// Optimized Country Bar
const CountryBar = ({ country, clicks, total, max }: any) => {
  const percentage = max > 0 ? (clicks / max) * 100 : 0
  
  return (
    <div className="flex items-center gap-3 group">
      <span className="text-base w-7 flex-shrink-0">{getCountryFlag(country)}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-white/70 truncate">{getCountryLabel(country)}</span>
          <span className="text-xs font-medium text-white/50 tabular-nums">{formatNumber(clicks)}</span>
        </div>
        <div className="h-1 w-full rounded-full bg-white/5 overflow-hidden">
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
const StatusBadge = ({ type, label, icon: Icon }: any) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium border ${
    type === 'success' ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' :
    type === 'warning' ? 'bg-amber-500/10 text-amber-300 border-amber-500/20' :
    type === 'danger' ? 'bg-rose-500/10 text-rose-300 border-rose-500/20' :
    'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
  }`}>
    {Icon && <Icon className="h-2.5 w-2.5" strokeWidth={2} />}
    {label}
  </span>
)

// Skeleton Loader
const SkeletonLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/5 animate-pulse" />
          <div>
            <div className="h-5 w-40 bg-white/5 rounded animate-pulse" />
            <div className="h-3 w-28 bg-white/5 rounded mt-1 animate-pulse" />
          </div>
        </div>
        <div className="flex gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-9 w-16 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/5 rounded-xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-white/10 rounded mb-3" />
            <div className="h-7 w-28 bg-white/10 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white/5 rounded-xl p-5 mb-6">
        <div className="h-[180px] w-full bg-white/10 rounded animate-pulse" />
      </div>
      <div className="bg-white/5 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="p-4 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 w-full bg-white/5 rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  </div>
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

  // Optimized fetch with abort controller
  useEffect(() => {
    const abortController = new AbortController()
    
    const fetchStats = async () => {
      try {
        setIsRefreshing(true)
        const response = await fetch(
          `/api/analytics/public/${publicId}?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}&country=${encodeURIComponent(filterCountry)}&unique=${filterUnique}&range=${timeRange}`,
          { signal: abortController.signal }
        )
        if (!response.ok) throw new Error('Dashboard not found')
        const data = await response.json()
        setStats(data)
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
  }, [publicId, page, search, filterCountry, filterUnique, timeRange])

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
    })
  }, [])

  // Memoized computed values
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

  const chartData = useMemo(() => ({
    labels: stats?.clickTrend?.labels || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Clicks',
        data: stats?.clickTrend?.datasets?.[0]?.data || [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#818CF8',
        backgroundColor: 'rgba(129, 140, 248, 0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: '#818CF8',
        borderWidth: 1.5,
      },
    ],
  }), [stats?.clickTrend])

  if (loading) return <SkeletonLoader />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="text-center max-w-md px-4">
          <div className="bg-white/5 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-rose-400" strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Unable to Load Dashboard</h1>
          <p className="text-sm text-white/40 mb-6">{error}</p>
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

  return (
    <>
      {/* JSON-LD Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'DataDashboard',
            name: 'Public Analytics Dashboard',
            description: `Real-time analytics with ${stats?.totalClicks || 0} total clicks and ${stats?.uniqueClicks || 0} unique visitors`,
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

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-500/10 rounded-lg p-2 border border-indigo-500/20 shrink-0">
                <Logo variant="compact" size="sm" showAnimation={true} />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Public Analytics</h1>
                <p className="text-xs text-white/40">Real-time click statistics</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/10">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                      timeRange === range 
                        ? 'bg-indigo-500 text-white' 
                        : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setTimeRange(timeRange)}
                className="p-1.5 bg-white/5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              </button>
              <button className="p-1.5 bg-white/5 rounded-lg border border-white/10 text-white/40 hover:text-white/70 transition-colors">
                <Download className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
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
              subtitle={`${uniqueRate}% unique`}
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-5">
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
                  <span className="text-sm font-medium text-white/70">Click Activity</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/30">
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
                        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                        ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 9 }, maxTicksLimit: 5 },
                      },
                      x: {
                        grid: { display: false },
                        ticks: { color: 'rgba(255,255,255,0.25)', font: { size: 9 } },
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

            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Globe2 className="h-4 w-4 text-indigo-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-white/70">Top Countries</span>
              </div>
              <div className="space-y-2.5 max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {stats?.geoSummary?.slice(0, 5).map((country) => (
                  <CountryBar
                    key={country.country}
                    country={country.country}
                    clicks={country.totalClicks}
                    total={country.totalClicks}
                    max={maxCountryClicks}
                  />
                ))}
                {(!stats?.geoSummary || stats.geoSummary.length === 0) && (
                  <div className="text-center py-6">
                    <Globe2 className="h-7 w-7 text-white/10 mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-xs text-white/30">No geographic data yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/10 flex-1 min-w-[160px]">
              <Search className="h-3.5 w-3.5 text-white/20" strokeWidth={1.5} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20 w-full"
                placeholder="Search clicks..."
              />
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => { setFilterCountry(''); setFilterUnique('') }}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterCountry === '' && filterUnique === ''
                    ? 'bg-indigo-500/20 text-indigo-300'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterUnique(filterUnique === 'true' ? '' : 'true')}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  filterUnique === 'true'
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                Unique
              </button>
              {countries.slice(0, 2).map((country) => (
                <button
                  key={country}
                  onClick={() => setFilterCountry(filterCountry === country ? '' : country)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                    filterCountry === country
                      ? 'bg-indigo-500/20 text-indigo-300'
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
                    className="appearance-none bg-white/5 border border-white/10 rounded px-2.5 py-1 pr-7 text-xs text-white/60 focus:outline-none focus:border-indigo-500/30"
                  >
                    <option value="">More</option>
                    {countries.map((country) => (
                      <option key={country} value={country}>
                        {getCountryFlag(country)} {getCountryLabel(country)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 text-white/20" strokeWidth={1.5} />
                </div>
              )}
            </div>
          </div>

          {/* Data Table */}
          <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] border-b border-white/5">
                  <tr>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" strokeWidth={1.5} />
                        Time
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">
                      <div className="flex items-center gap-1">
                        <Hash className="h-3 w-3" strokeWidth={1.5} />
                        IP
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" strokeWidth={1.5} />
                        Location
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">
                      <div className="flex items-center gap-1">
                        <Smartphone className="h-3 w-3" strokeWidth={1.5} />
                        Device
                      </div>
                    </th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30">Browser</th>
                    <th className="px-3 py-2.5 text-left text-[10px] font-medium uppercase tracking-wider text-white/30 hidden lg:table-cell">Referrer</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium uppercase tracking-wider text-white/30">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stats?.clicks?.length ? (
                    stats.clicks.slice((page - 1) * limit, page * limit).map((click) => {
                      const DeviceIcon = getDeviceIcon(click.deviceType, click.deviceBrand)
                      const deviceLabel = getDeviceLabel(click)
                      return (
                        <tr key={click.id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-3 py-2.5 text-xs text-white/40 whitespace-nowrap">
                            {formatDate(click.createdAt || click.timestamp)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span className="text-xs font-mono text-cyan-300/80 whitespace-nowrap">
                              {click.ipAddress || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-sm">{getCountryFlag(click.country)}</span>
                              <span className="text-xs text-white/60 truncate max-w-[80px]">{getCountryLabel(click.country)}</span>
                              {click.city && (
                                <span className="text-[10px] text-white/30 hidden md:inline">• {click.city}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1.5 text-xs text-white/60">
                              <DeviceIcon className="h-3.5 w-3.5 text-white/40" strokeWidth={1.5} />
                              <span className="truncate max-w-[120px]" title={deviceLabel}>
                                {deviceLabel}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-xs text-white/50 truncate max-w-[80px]">
                            {click.browser || 'Unknown'}
                            {click.browserVersion && (
                              <span className="text-[10px] text-white/30 ml-1">v{click.browserVersion}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-xs hidden lg:table-cell">
                            {click.referrer ? (
                              <a
                                href={click.referrer}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-300/60 hover:text-indigo-300 transition-colors truncate block max-w-[120px]"
                              >
                                {new URL(click.referrer).hostname}
                              </a>
                            ) : (
                              <span className="text-white/20">Direct</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center justify-center gap-1">
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
                      <td colSpan={7} className="px-4 py-10 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <Eye className="h-7 w-7 text-white/10" strokeWidth={1.5} />
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-white/5 px-3 py-2.5">
                <div className="text-xs text-white/30">
                  {((page - 1) * limit) + 1}–{Math.min(page * limit, totalClicks)} of {totalClicks}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-1 rounded bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="text-xs text-white/40 px-2">
                    {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages || 1, p + 1))}
                    disabled={page === totalPages || totalPages === 0}
                    className="p-1 rounded bg-white/5 border border-white/10 text-white/30 hover:text-white/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <Logo variant="compact" size="sm" showAnimation={true} />
              <span className="text-[10px] text-white/20">NexGen Affiliates</span>
            </div>
            <div className="flex items-center gap-3 text-[10px] text-white/20">
              <span>Privacy protected</span>
              <span>•</span>
              <span>Real-time analytics</span>
            </div>
          </div>

        </div>
      </div>
    </>
  )
}