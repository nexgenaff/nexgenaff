'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentClicks from '@/components/dashboard/RecentClicks'
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
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview')
  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week')

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
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/[0.04] p-5 sm:p-6 shadow-2xl shadow-indigo-950/20"
      >
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Live dashboard
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-3">Dashboard <span className="gradient-text">Pro</span></h1>
          <p className="text-sm sm:text-base text-white/30 mt-1">Welcome back! Your geo-aware campaign performance is ready to review.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link 
            href="/admin/links/create" 
            className="px-4 py-2 btn-gradient rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </Link>
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

      <div className="flex gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-white/30 hover:text-white/60'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-white/30 hover:text-white/60'
          }`}
        >
          📋 Click Logs
        </button>
      </div>

      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <RecentClicks />
          </div>
          <div className="space-y-6">
            <TrafficBreakdown
              referrerBreakdown={referrerBreakdown}
              browserBreakdown={browserBreakdown}
              deviceBreakdown={deviceBreakdown}
            />
          </div>
        </div>
      ) : (
        <ClickLogs />
      )}
    </div>
  )
}