'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
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
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 rounded-[20px] border border-white/10 bg-slate-950/70 backdrop-blur-xl p-3 shadow-[0_14px_40px_rgba(0,0,0,0.22)]"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Welcome back</p>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-100">
              <span className="truncate text-sm font-semibold text-white">Good to see you, Admin</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 ring-1 ring-white/10">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">{currentTime.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <button 
              onClick={handleRefresh} 
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-100 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <Link 
              href="/admin/links/create" 
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-500 px-2.5 py-1.5 text-xs font-semibold text-white shadow-[0_12px_32px_rgba(99,102,241,0.18)]"
            >
              <Plus className="w-4 h-4" />
              Create Link
            </Link>
          </div>
        </div>
      </motion.div>

      <StatsCards
        stats={stats}
        chartData={chartData}
        hourlyChartData={hourlyChartData}
        countryBreakdown={countryBreakdown}
        period={period}
        onPeriodChange={setPeriod}
      />

      <TrafficBreakdown
        referrerBreakdown={referrerBreakdown}
        browserBreakdown={browserBreakdown}
        deviceBreakdown={deviceBreakdown}
      />

      <ClickLogs />
    </div>
  )
}