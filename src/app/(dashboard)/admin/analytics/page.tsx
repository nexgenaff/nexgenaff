'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Activity, ArrowUpRight, BarChart3, RefreshCw, ShieldCheck, Sparkles } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentClicks from '@/components/dashboard/RecentClicks'

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
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalClicks: 0,
    uniqueClicks: 0,
    botClicks: 0,
    totalLinks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchStats = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    try {
      const response = await fetch('/api/analytics/dashboard', { credentials: 'include' })
      if (response.status === 401) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        throw new Error(`Dashboard stats failed with ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch analytics overview:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [router])

  useEffect(() => {
    void fetchStats(false)
  }, [fetchStats])

  const healthCards = [
    {
      label: 'Traffic quality',
      value: stats.totalLinks > 0 ? 'Healthy' : 'Waiting for links',
      detail: `${stats.totalLinks} active campaigns`,
      tone: 'text-emerald-400',
    },
    {
      label: 'Reach today',
      value: `${formatNumber(stats.uniqueClicks)} unique`,
      detail: 'Distinct visitors',
      tone: 'text-cyan-400',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 mt-4 animate-pulse">Loading analytics...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/8 via-white/5 to-white/[0.04] p-5 sm:p-6 backdrop-blur-xl shadow-2xl shadow-indigo-950/20"
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Live analytics
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics <span className="gradient-text">Command Center</span></h1>
              <p className="mt-1 text-sm text-white/40">Track throughput, clean bot noise, and monitor your affiliate campaign quality in one premium workspace.</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => fetchStats(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
            <Link
              href="/admin/links/create"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:scale-[1.01]"
            >
              <Sparkles className="h-4 w-4" />
              Launch campaign
            </Link>
          </div>
        </div>
      </motion.div>

      <StatsCards
        stats={stats}
        chartData={stats.chartData}
        hourlyChartData={stats.hourlyChartData}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Performance pulse</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {healthCards.map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-white/35">{item.label}</p>
                <p className={`mt-3 text-xl font-bold ${item.tone}`}>{item.value}</p>
                <p className="mt-1 text-sm text-white/40">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Live system health</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-3">
              <span className="text-sm text-white/55">Proxy status</span>
              <span className="inline-flex items-center gap-2 text-sm text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Online
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-3">
              <span className="text-sm text-white/55">Auth session</span>
              <span className="inline-flex items-center gap-2 text-sm text-cyan-400">
                <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                Verified
              </span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-3">
              <span className="text-sm text-white/55">Campaign health</span>
              <span className="inline-flex items-center gap-2 text-sm text-fuchsia-400">
                <ArrowUpRight className="h-4 w-4" />
                {stats.totalLinks > 0 ? 'Strong' : 'Needs campaigns'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="xl:col-span-2">
          <RecentClicks />
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Best next actions</h2>
          </div>
          <div className="space-y-3">
            <Link href="/admin/links/create" className="block rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-3 text-sm text-indigo-200 transition hover:bg-indigo-500/15">
              Create a new tracking link and push it live.
            </Link>
            <Link href="/admin/offers" className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5">
              Review offer inventory and promote the strongest campaign.
            </Link>
            <Link href="/admin/domains" className="block rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5">
              Connect or verify a custom domain for trust and branding.
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
