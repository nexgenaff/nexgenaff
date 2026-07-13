'use client'

import { use, useState, useEffect } from 'react'
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
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

interface Stats {
  totalClicks: number
  uniqueClicks: number
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
  const limit = 10

  useEffect(() => {
    const fetchStats = async () => {
      try {
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

  const getDeviceIcon = (deviceType: string | null) => {
    if (!deviceType) return <Monitor className="w-4 h-4" />
    const device = deviceType.toLowerCase()
    if (device.includes('mobile') || device.includes('phone')) {
      return <Smartphone className="w-4 h-4" />
    }
    if (device.includes('tablet')) {
      return <Tablet className="w-4 h-4" />
    }
    return <Monitor className="w-4 h-4" />
  }

  const getBrowserLabel = (click: Stats['clicks'][number]) => {
    const browser = click.browser || 'Unknown Browser'
    const version = click.browserVersion
    return version ? `${browser} ${version}` : browser
  }

  const getDeviceLabel = (click: Stats['clicks'][number]) => {
    const brand = click.deviceBrand || click.deviceType || 'Unknown Device'
    const os = click.os || 'Unknown OS'
    return `${brand} • ${os}`
  }

  const getReferrerHostname = (referrer: string | null) => {
    if (!referrer) return 'Direct'

    try {
      return new URL(referrer).hostname || 'Referrer'
    } catch {
      return referrer.split('/')[0] || 'Referrer'
    }
  }

  const getLocationSummary = (click: Stats['clicks'][number]) => {
    const countryLabel = getCountryLabel(click.country)
    const cityRegion = [click.city, click.region].filter(Boolean).join(', ')
    const ispLabel = click.isp?.trim()

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-base">{getCountryFlag(click.country)}</span>
          <span className="font-medium text-white/85">{countryLabel}</span>
        </div>
        {(cityRegion || ispLabel) && (
          <div className="text-[11px] text-white/40">
            {cityRegion}
            {cityRegion && ispLabel ? ` • ${ispLabel}` : ispLabel}
          </div>
        )}
      </div>
    )
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const countries = stats?.geoSummary
    ? Array.from(new Set(stats.geoSummary.map((entry) => entry.country).filter((country): country is string => Boolean(country))))
    : []

  const topCountry = stats?.geoSummary?.[0]
  const secondaryCountries = stats?.geoSummary?.slice(1, 4) || []
  const chartData = stats?.clickTrend || {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Total Clicks',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#22D3EE',
        backgroundColor: 'rgba(34, 211, 238, 0.14)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
      {
        label: 'Unique Clicks',
        data: [0, 0, 0, 0, 0, 0, 0],
        borderColor: '#34D399',
        backgroundColor: 'rgba(52, 211, 153, 0.14)',
        fill: true,
        tension: 0.35,
        pointRadius: 3,
      },
    ],
  }

  const totalClicks = stats?.pagination?.total || stats?.clicks?.length || 0
  const totalPages = stats?.pagination?.totalPages || Math.ceil(totalClicks / limit) || 1

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-float">🔒</div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Not Found</h1>
          <p className="text-white/40">This dashboard may have been removed or is private.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.18),_transparent_32%),linear-gradient(180deg,#050816,#0b1120_40%,#020617)] py-8 sm:py-12">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo variant="compact" size="lg" showAnimation={true} />
            <div>
              <div className="mb-1 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                <Sparkles className="h-3.5 w-3.5" />
                Shared report
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">Public Analytics Dashboard</h1>
            </div>
          </div>

        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-500/10 p-2.5 text-indigo-300">
                <MousePointerClick className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Total clicks</div>
                <div className="mt-1 text-2xl font-bold text-white">{formatNumber(stats?.totalClicks || 0)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-500/10 p-2.5 text-emerald-300">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Unique clicks</div>
                <div className="mt-1 text-2xl font-bold text-white">{formatNumber(stats?.uniqueClicks || 0)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-violet-500/10 p-2.5 text-violet-300">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Countries</div>
                <div className="mt-1 text-2xl font-bold text-white">{countries.length || 0}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.85))] p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <Sparkles className="h-4 w-4" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Top geography</span>
            </div>

            {topCountry ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{getCountryFlag(topCountry.country)}</div>
                  <div>
                    <div className="text-xl font-semibold text-white">{getCountryLabel(topCountry.country)}</div>
                    <div className="text-sm text-white/55">Best-performing region currently</div>
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Total clicks</div>
                    <div className="mt-1 text-lg font-semibold text-white">{formatNumber(topCountry.totalClicks)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2">
                    <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Unique clicks</div>
                    <div className="mt-1 text-lg font-semibold text-emerald-300">{formatNumber(topCountry.uniqueClicks)}</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 px-4 py-6 text-sm text-white/45">
                No geo data available yet.
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-5 backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-2 text-white/75">
              <Globe2 className="h-4 w-4 text-violet-300" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Geo leaderboard</span>
            </div>

            <div className="space-y-2">
              {secondaryCountries.length > 0 ? (
                secondaryCountries.map((entry, index) => (
                  <div key={`${entry.country}-${index}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/55 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2 text-white/75">
                      <span>{getCountryFlag(entry.country)}</span>
                      <span>{getCountryLabel(entry.country)}</span>
                    </div>
                    <div className="text-white/55">{formatNumber(entry.uniqueClicks)} unique</div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/45 px-4 py-5 text-sm text-white/45">
                  Add traffic to unlock country ranking insights.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mb-6 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl sm:p-5">
          <div className="mb-4 flex items-center gap-2 text-white/80">
            <Sparkles className="h-4 w-4 text-cyan-300" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Click trend</span>
          </div>
          <div className="h-[240px] w-full">
            <Chart data={chartData} height={240} options={{ animation: { duration: 900, easing: 'easeOutQuart' } }} />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="border-b border-white/5 p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-2 text-white">
                <Eye className="h-5 w-5 text-cyan-300 shrink-0" />
                <h2 className="text-lg font-semibold">Click activity</h2>
                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-white/50 whitespace-nowrap">
                  {totalClicks} records
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/20" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/65 py-2 pl-9 pr-3 text-sm text-white placeholder:text-white/20 focus:border-cyan-400/40 focus:outline-none sm:w-52"
                    placeholder="Search logs..."
                  />
                </div>

                {countries.length > 0 && (
                  <div className="relative">
                    <select
                      value={filterCountry}
                      onChange={(e) => setFilterCountry(e.target.value)}
                      className="appearance-none rounded-xl border border-white/10 bg-slate-950/65 py-2 pl-3 pr-9 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                    >
                      <option value="">All countries</option>
                      {countries.map((country) => (
                        <option key={country} value={country}>
                          {getCountryFlag(country)} {getCountryLabel(country)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                  </div>
                )}

                <div className="relative">
                  <select
                    value={filterUnique}
                    onChange={(e) => setFilterUnique(e.target.value)}
                    className="appearance-none rounded-xl border border-white/10 bg-slate-950/65 py-2 pl-3 pr-9 text-sm text-white focus:border-cyan-400/40 focus:outline-none"
                  >
                    <option value="">All traffic</option>
                    <option value="true">Unique only</option>
                    <option value="false">Duplicates</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                </div>
              </div>
            </div>
          </div>

          <div className="block md:hidden">
            {stats?.clicks && stats.clicks.length > 0 ? (
              <div className="space-y-3 p-3">
                {stats.clicks.slice((page - 1) * limit, page * limit).map((click) => (
                  <div key={click.id} className="rounded-2xl border border-white/10 bg-slate-950/40 p-3 text-sm text-white/70">
                    <div className="mb-2 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs text-white/45">
                        <Clock className="h-3.5 w-3.5" />
                        {formatDate(click.createdAt || click.timestamp)}
                      </div>
                      <div className="flex items-center justify-end gap-1.5">
                        {click.isBot ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-200">
                            <Bot className="h-3.5 w-3.5" /> Bot
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                            <User className="h-3.5 w-3.5" /> Human
                          </span>
                        )}
                        {click.isUnique ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                            <CheckCircle className="h-3.5 w-3.5" /> Unique
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                            <XCircle className="h-3.5 w-3.5" /> Duplicate
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-[13px]">
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/35">IP</span>
                        <span className="max-w-[62%] break-all text-right text-cyan-300/90">{click.ipAddress || 'N/A'}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/35">Location</span>
                        <span className="max-w-[62%] text-right">{getLocationSummary(click)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/35">Device</span>
                        <span className="max-w-[62%] text-right">{getDeviceLabel(click)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/35">Browser</span>
                        <span className="max-w-[62%] text-right">{getBrowserLabel(click)}</span>
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <span className="text-white/35">Referrer</span>
                        <span className="max-w-[62%] break-all text-right text-indigo-300">{getReferrerHostname(click.referrer)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-4 py-14 text-center text-white/40">
                <div className="flex flex-col items-center gap-3">
                  <Eye className="h-12 w-12 text-white/10" />
                  <div className="text-lg font-semibold text-white/70">No clicks recorded yet</div>
                  <div className="text-sm text-white/35">This public report will populate once traffic starts flowing.</div>
                </div>
              </div>
            )}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead className="bg-white/[0.03]">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Time</span>
                  </th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">IP</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">Location</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">Device</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">Browser</th>
                  <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">Referrer</th>
                  <th className="px-4 py-3 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/30 whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats?.clicks && stats.clicks.length > 0 ? (
                  stats.clicks.slice((page - 1) * limit, page * limit).map((click) => (
                    <tr key={click.id} className="transition hover:bg-white/[0.04]">
                      <td className="px-4 py-3 text-sm text-white/55 whitespace-nowrap">
                        {formatDate(click.createdAt || click.timestamp)}
                      </td>
                      <td className="px-4 py-3 text-sm font-mono text-cyan-300/90 whitespace-nowrap">
                        {click.ipAddress || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/65">
                        {getLocationSummary(click)}
                      </td>
                      <td className="px-4 py-3 text-sm text-white/65">
                        <div className="flex items-center gap-2">
                          <span className="text-white/45">{getDeviceIcon(click.deviceType)}</span>
                          <span>{getDeviceLabel(click)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/65">
                        <div className="flex items-center gap-2">
                          <span>{getBrowserLabel(click)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-white/55">
                        {click.referrer ? (
                          <a
                            href={click.referrer}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-300 transition hover:text-indigo-200"
                          >
                            {getReferrerHostname(click.referrer)}
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-white/25">Direct</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1.5">
                          {click.isBot ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/20 bg-rose-500/10 px-2.5 py-1 text-[11px] text-rose-200">
                              <Bot className="h-3.5 w-3.5" /> Bot
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                              <User className="h-3.5 w-3.5" /> Human
                            </span>
                          )}
                          {click.isUnique ? (
                            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[11px] text-emerald-200">
                              <CheckCircle className="h-3.5 w-3.5" /> Unique
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[11px] text-amber-200">
                              <XCircle className="h-3.5 w-3.5" /> Duplicate
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-14 text-center">
                      <div className="flex flex-col items-center gap-3 text-white/40">
                        <Eye className="h-12 w-12 text-white/10" />
                        <div className="text-lg font-semibold text-white/70">No clicks recorded yet</div>
                        <div className="text-sm text-white/35">This public report will populate once traffic starts flowing.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {totalClicks > 0 && (
            <div className="flex flex-col gap-3 border-t border-white/5 px-4 py-4 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <div>
                Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, totalClicks)} of {totalClicks} clicks
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="rounded-lg border border-white/10 bg-slate-950/65 px-3 py-1 text-white/60">
                  Page {page} of {totalPages || 1}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                  className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/45 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/5 pt-4 sm:flex-row">
          <Logo variant="compact" size="sm" showAnimation={true} />
          <p className="text-xs text-white/25">Powered by NextGen Affiliates Pro</p>
        </div>
      </div>
    </div>
  )
}