'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { getCountryFlag, getCountryLabel } from '@/lib/utils/country'
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Download,
  X,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  XCircle,
  ExternalLink,
  Eye,
  Trash2,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react'

interface Click {
  id: string
  ipAddress: string
  country: string | null
  region: string | null
  city: string | null
  isp: string | null
  referrer: string | null
  browser: string | null
  browserVersion: string | null
  os: string | null
  deviceType: string | null
  deviceBrand: string | null
  userAgent: string | null
  isUnique: boolean
  isBot: boolean
  botScore: number | null
  createdAt: string
  linkAccount: {
    accountName: string
    slug: string
  }
}

interface Filters {
  country: string
  browser: string
  deviceType: string
  isUnique: string
  startDate: string
  endDate: string
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

interface FilterOptions {
  countries: string[]
  browsers: string[]
  deviceTypes: string[]
}

interface ConfirmDialogState {
  title: string
  message: string
  confirmLabel: string
  tone: 'danger' | 'warning'
  onConfirm: () => Promise<void> | void
}

export default function ClickLogs() {
  const router = useRouter()
  const [clicks, setClicks] = useState<Click[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    countries: [],
    browsers: [],
    deviceTypes: [],
  })
  const [showFilters, setShowFilters] = useState(false)
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)

  const [filters, setFilters] = useState<Filters>({
    country: '',
    browser: '',
    deviceType: '',
    isUnique: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  })

  const limit = 20

  const fetchClicks = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters.country && { country: filters.country }),
        ...(filters.browser && { browser: filters.browser }),
        ...(filters.deviceType && { deviceType: filters.deviceType }),
        ...(filters.isUnique && { isUnique: filters.isUnique }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.sortOrder && { sortOrder: filters.sortOrder }),
      })

      const response = await fetch(`/api/analytics/clicks?${params}`)
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setClicks(data.clicks || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)
      setFilterOptions(data.filters || { countries: [], browsers: [], deviceTypes: [] })
    } catch (error) {
      console.error('Failed to fetch clicks:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [page, filters, router])

  useEffect(() => {
    fetchClicks(true)
  }, [fetchClicks])

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const clearFilters = () => {
    setFilters({
      country: '',
      browser: '',
      deviceType: '',
      isUnique: '',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    })
    setPage(1)
  }

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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const getReferrerInfo = (referrer: string | null) => {
    if (!referrer) return { hostname: 'Direct', href: null }

    const trimmed = referrer.trim()
    if (!trimmed) return { hostname: 'Direct', href: null }

    const normalizedHref = /^[a-z][a-z\d+\-.]*:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`

    try {
      const parsed = new URL(normalizedHref)
      return {
        hostname: parsed.hostname || 'Referrer',
        href: parsed.toString(),
      }
    } catch {
      return {
        hostname: trimmed.split('/')[0] || 'Referrer',
        href: null,
      }
    }
  }

  const getBrowserLabel = (click: Click) => {
    const browser = click.browser || 'Unknown Browser'
    const version = click.browserVersion
    return version ? `${browser} ${version}` : browser
  }

  const getDeviceLabel = (click: Click) => {
    const os = click.os || click.deviceType || 'Unknown OS'
    const brand = click.deviceBrand || click.deviceType || 'Unknown Device'
    return `${os} • ${brand}`
  }

  const getLocationSummary = (click: Click) => {
    const countryLabel = getCountryLabel(click.country)
    const locationParts = [click.city, click.region].filter(Boolean)
    const locationText = locationParts.join(', ')
    const ispText = click.isp?.trim()

    return (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span>{getCountryFlag(click.country)}</span>
          <span className="font-medium text-white/80">{countryLabel}</span>
        </div>
        {(locationText || ispText) && (
          <div className="text-[11px] text-white/25">
            {locationText}
            {locationText && ispText ? ` • ${ispText}` : ispText}
          </div>
        )}
      </div>
    )
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(filters.country && { country: filters.country }),
        ...(filters.browser && { browser: filters.browser }),
        ...(filters.deviceType && { deviceType: filters.deviceType }),
        ...(filters.isUnique && { isUnique: filters.isUnique }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search }),
        export: 'true',
      })

      const response = await fetch(`/api/analytics/clicks/export?${params}`)
      if (!response.ok) throw new Error('Export failed')
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `clicks-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const handleDeleteClick = async (id: string) => {
    setConfirmDialog({
      title: 'Delete this click record?',
      message: 'This will permanently remove the selected click event from your analytics history.',
      confirmLabel: 'Delete click',
      tone: 'danger',
      onConfirm: async () => {
        try {
          const response = await fetch(`/api/analytics/clicks?id=${id}`, {
            method: 'DELETE',
          })

          if (!response.ok) throw new Error('Failed to delete click')

          await fetchClicks(false)
        } catch (error) {
          console.error('Failed to delete click:', error)
        }
      },
    })
  }

  const activeFilterCount = useMemo(() => {
    return Object.entries(filters).filter(([key, value]) => {
      if (key === 'sortBy' || key === 'sortOrder') return false
      return value !== '' && value !== 'desc' && value !== 'createdAt'
    }).length
  }, [filters])

  const summary = useMemo(() => {
    return clicks.reduce(
      (acc, click) => {
        if (click.isUnique) acc.unique += 1
        else acc.duplicate += 1
        return acc
      },
      { unique: 0, duplicate: 0 }
    )
  }, [clicks])

  if (loading) {
    return (
      <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-8 h-8 skeleton rounded" />
              <div className="flex-1">
                <div className="h-4 w-48 skeleton rounded" />
                <div className="h-3 w-32 skeleton rounded mt-2" />
              </div>
              <div className="h-3 w-20 skeleton rounded" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-800 bg-slate-900/80 shadow-sm backdrop-blur-sm">
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/90 px-4 py-6 backdrop-blur-sm"
          onClick={() => setConfirmDialog(null)}
        >
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.985 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-[24px] border border-slate-800 bg-slate-900/95 shadow-lg"
          >
            <div className="pointer-events-none absolute inset-0 bg-slate-900/50" />
            <div className="relative border-b border-slate-800 bg-slate-950/70 px-5 py-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${confirmDialog.tone === 'danger' ? 'border-rose-400/20 bg-rose-500/10 text-rose-300' : 'border-amber-400/20 bg-amber-500/10 text-amber-300'}`}>
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] ${confirmDialog.tone === 'danger' ? 'border-rose-400/20 bg-rose-500/10 text-rose-200' : 'border-amber-400/20 bg-amber-500/10 text-amber-200'}`}>
                      Secure action
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-white">{confirmDialog.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-400">Please confirm before this change is applied.</p>
                </div>
              </div>
            </div>
            <div className="relative p-5">
              <div className={`rounded-[22px] border p-4 text-sm leading-7 ${confirmDialog.tone === 'danger' ? 'border-rose-400/20 bg-rose-500/10 text-rose-100/90' : 'border-amber-400/20 bg-amber-500/10 text-amber-100/90'}`}>
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/70">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Confirmation
                </div>
                <p>{confirmDialog.message}</p>
              </div>
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setConfirmDialog(null)} className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-700 hover:text-white">
                  Cancel
                </button>
                <button type="button" onClick={() => {
                  setConfirmDialog(null)
                  void confirmDialog.onConfirm()
                }} className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${confirmDialog.tone === 'danger' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-amber-600 hover:bg-amber-500'}`}>
                  {confirmDialog.confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <div className="border-b border-slate-800 bg-slate-950/60 p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-2">
              <Eye className="h-5 w-5 text-slate-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Click Logs</h3>
              <p className="text-sm text-slate-400">
                {total.toLocaleString()} total clicks
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => fetchClicks(false)}
              disabled={refreshing}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
            >
              {refreshing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              Refresh
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="relative flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800"
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 text-[10px] font-semibold text-slate-900">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="border-b border-slate-800 bg-slate-950/50 p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
            <div className="xl:col-span-2">
              <label className="form-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="form-input pl-10"
                  placeholder="Search IP, referrer, country..."
                />
              </div>
            </div>

            <div>
              <label className="form-label">Country</label>
              <select
                value={filters.country}
                onChange={(e) => handleFilterChange('country', e.target.value)}
                className="form-select"
              >
                <option value="">All Countries</option>
                {filterOptions.countries.map((country) => (
                  <option key={country} value={country}>
                    {getCountryFlag(country)} {country}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Browser</label>
              <select
                value={filters.browser}
                onChange={(e) => handleFilterChange('browser', e.target.value)}
                className="form-select"
              >
                <option value="">All Browsers</option>
                {filterOptions.browsers.map((browser) => (
                  <option key={browser} value={browser}>{browser}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Device</label>
              <select
                value={filters.deviceType}
                onChange={(e) => handleFilterChange('deviceType', e.target.value)}
                className="form-select"
              >
                <option value="">All Devices</option>
                {filterOptions.deviceTypes.map((device) => (
                  <option key={device} value={device}>{device}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                value={filters.isUnique}
                onChange={(e) => handleFilterChange('isUnique', e.target.value)}
                className="form-select"
              >
                <option value="">All traffic</option>
                <option value="true">Unique only</option>
                <option value="false">Duplicates</option>
              </select>
            </div>

            <div>
              <label className="form-label">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={clearFilters}
              className="px-3 py-1.5 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition text-white/30"
            >
              <X className="w-4 h-4 inline mr-1" />
              Clear
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="px-3 py-1.5 text-sm btn-gradient rounded-lg"
            >
              Apply
            </button>
          </div>
        </div>
      )}

      <div className="border-b border-slate-800 bg-slate-950/40 px-4 py-4 sm:px-6">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Unique</div>
            <div className="mt-1 text-sm font-semibold text-white">{summary.unique}</div>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
            <div className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Duplicates</div>
            <div className="mt-1 text-sm font-semibold text-white">{summary.duplicate}</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[1120px] w-full">
          <thead className="bg-slate-950/70">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">
                <button
                  onClick={() => handleFilterChange('sortBy', 'createdAt')}
                  className="flex items-center gap-1 hover:text-white/60 transition"
                >
                  Time
                  {filters.sortBy === 'createdAt' && (
                    filters.sortOrder === 'desc' ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">IP Address</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Campaign</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Location</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Device</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Browser</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Referrer</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Status</th>
              <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider whitespace-nowrap text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {clicks.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <div className="mx-auto flex max-w-xl flex-col items-center rounded-[24px] border border-slate-800 bg-slate-950/70 px-8 py-10 text-center shadow-inner">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80">
                      <Eye className="h-6 w-6 text-slate-300" />
                    </div>
                    <p className="text-lg font-semibold text-slate-100">No traffic yet</p>
                    <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
                      Share a link and the first clicks will appear here with campaign, device, and location insights.
                    </p>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1">Live activity</span>
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1">Device mix</span>
                      <span className="rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1">Geo view</span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              clicks.map((click, index) => (
                <tr
                  key={click.id}
                  className={`transition-all duration-200 ${click.isUnique ? 'hover:bg-slate-800/60' : 'bg-amber-500/5 hover:bg-amber-500/10'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <td className="px-4 py-3 text-sm whitespace-nowrap text-slate-300">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-slate-500" />
                      {formatDate(click.createdAt)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-400">
                    {click.ipAddress}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-cyan-300">{click.linkAccount.accountName}</span>
                      <span className="text-[11px] text-slate-500">/{click.linkAccount.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {getLocationSummary(click)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div className="flex items-center gap-1">
                      {getDeviceIcon(click.deviceType)}
                      <span className="truncate max-w-[140px]">{getDeviceLabel(click)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    <div className="flex items-center gap-1">
                      <span className="truncate max-w-[140px] text-violet-300">{getBrowserLabel(click)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm max-w-[150px] truncate text-cyan-200">
                    {click.referrer ? (() => {
                      const referrerInfo = getReferrerInfo(click.referrer)
                      return (
                        <a
                          href={referrerInfo.href || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 hover:underline transition"
                          onClick={(event) => {
                            if (!referrerInfo.href) {
                              event.preventDefault()
                            }
                          }}
                        >
                          {referrerInfo.hostname}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      )
                    })() : (
                      <span className="text-slate-500">Direct</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-wrap items-center justify-center gap-1">
                      {click.isUnique ? (
                        <span className="badge badge-success flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Unique
                        </span>
                      ) : (
                        <span className="badge badge-warning flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> Duplicate
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDeleteClick(click.id)}
                      className="p-1 text-slate-500 transition-all duration-200 hover:scale-110 hover:text-rose-400"
                      title="Delete click"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="flex flex-col gap-4 border-t border-slate-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-400">
            Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total.toLocaleString()} clicks
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed text-white/30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="rounded-lg bg-slate-900/80 px-3 py-1 text-sm text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-white/10 rounded-lg hover:bg-white/5 transition disabled:opacity-50 disabled:cursor-not-allowed text-white/30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}