'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatsCards from '@/components/dashboard/StatsCards'
import ClickLogs from '@/components/dashboard/ClickLogs'
import { TrafficBreakdown } from '@/components/dashboard/TrafficBreakdown'
import { RefreshCw, Plus } from 'lucide-react'

interface DashboardStats {
  totalClicks: number
  uniqueClicks: number
  totalLinks: number
  botClicks: number
  chartData?: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      fill?: boolean
      tension?: number
      pointRadius?: number
    }[]
  }
  hourlyChartData?: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
      fill?: boolean
      tension?: number
      pointRadius?: number
    }[]
  }
  geoData?: {
    country: string
    clicks: number
    uniqueClicks: number
  }[]
  countryBreakdown?: {
    country: string
    clicks: number
    uniqueClicks: number
  }[]
  referrerBreakdown?: {
    name: string
    clicks: number
    uniqueClicks: number
  }[]
  browserBreakdown?: {
    name: string
    clicks: number
    uniqueClicks: number
  }[]
  deviceBreakdown?: {
    name: string
    clicks: number
    uniqueClicks: number
  }[]
}

const defaultChartData = {
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Clicks',
      data: [0, 0, 0, 0, 0, 0, 0],
      borderColor: '#8B5CF6',
      backgroundColor: 'rgba(139, 92, 246, 0.14)',
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    uniqueClicks: 0,
    totalLinks: 0,
    botClicks: 0,
  })
  const [chartData, setChartData] = useState(defaultChartData)
  const [hourlyChartData, setHourlyChartData] = useState(defaultChartData)
  const [countryBreakdown, setCountryBreakdown] = useState<{ country: string; clicks: number; uniqueClicks: number }[]>([])
  const [referrerBreakdown, setReferrerBreakdown] = useState<{ name: string; clicks: number; uniqueClicks: number }[]>([])
  const [browserBreakdown, setBrowserBreakdown] = useState<{ name: string; clicks: number; uniqueClicks: number }[]>([])
  const [deviceBreakdown, setDeviceBreakdown] = useState<{ name: string; clicks: number; uniqueClicks: number }[]>([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = useCallback(async () => {
    try {
      const response = await fetch(`/api/analytics/dashboard?period=${period}`, { credentials: 'include' })
      if (response.status === 401) {
        router.push('/login')
        return
      }
      if (!response.ok) {
        console.error('Failed to fetch stats, status:', response.status)
        setStats({ totalClicks: 0, uniqueClicks: 0, totalLinks: 0, botClicks: 0 })
        setChartData(defaultChartData)
        setHourlyChartData(defaultChartData)
        setCountryBreakdown([])
        setReferrerBreakdown([])
        setBrowserBreakdown([])
        setDeviceBreakdown([])
        return
      }

      const data = await response.json()
      setStats(data)
      setChartData(data.chartData || defaultChartData)
      setHourlyChartData(data.hourlyChartData || defaultChartData)
      setCountryBreakdown(data.countryBreakdown || [])
      setReferrerBreakdown(data.referrerBreakdown || [])
      setBrowserBreakdown(data.browserBreakdown || [])
      setDeviceBreakdown(data.deviceBreakdown || [])
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }, [period, router])

  useEffect(() => {
    void loadDashboardData()
  }, [loadDashboardData])

  const handleRefresh = async () => {
    setLoading(true)
    await loadDashboardData()
  }

  if (loading) {
    return null
  }

  return (
    <div className="space-y-6 text-slate-100">
      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-800/80 bg-slate-900/75 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-400/80">Welcome back</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-100">
              <span className="truncate text-sm font-semibold text-slate-100">
                Good to see you, Admin
              </span>
              <span className="rounded-full bg-slate-950/80 px-2.5 py-1 text-[11px] font-medium text-slate-300 ring-1 ring-slate-700/70">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button 
              onClick={handleRefresh} 
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-2.5 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-700 hover:bg-slate-900"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link 
              href="/admin/links/create" 
              className="inline-flex items-center gap-2 rounded-2xl bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-white"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </Link>
          </div>
        </div>
      </div>

      <section className="rounded-[24px] border border-slate-800/70 bg-slate-950/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-4">
        <StatsCards
          stats={stats}
          chartData={chartData}
          hourlyChartData={hourlyChartData}
          countryBreakdown={countryBreakdown}
          period={period}
          onPeriodChange={setPeriod}
        />
      </section>

      <section className="rounded-[24px] border border-slate-800/70 bg-slate-950/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-4">
        <TrafficBreakdown
          referrerBreakdown={referrerBreakdown}
          browserBreakdown={browserBreakdown}
          deviceBreakdown={deviceBreakdown}
        />
      </section>

      <section className="rounded-[24px] border border-slate-800/70 bg-slate-950/30 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] sm:p-4">
        <ClickLogs />
      </section>
    </div>
  )
}