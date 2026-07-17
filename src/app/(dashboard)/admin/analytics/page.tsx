'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileDown, RefreshCw, Sparkles } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import StatsCards from '@/components/dashboard/StatsCards'

interface DashboardStats {
  totalClicks: number
  uniqueClicks: number
  totalLinks: number
  botClicks: number
  accountGeoReport?: {
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
    accountBreakdown: Array<{
      accountName: string
      totalUniqueClicks: number
      countries: Array<{ country: string; uniqueClicks: number }>
    }>
  }
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

      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.12),rgba(255,255,255,0.05)_55%,rgba(15,23,42,0.35))] p-5 sm:p-6 backdrop-blur-xl shadow-[0_35px_80px_rgba(15,23,42,0.45)] before:absolute before:inset-0 before:bg-[linear-gradient(110deg,transparent_0%,rgba(255,255,255,0.08)_45%,transparent_100%)] before:opacity-50 before:mix-blend-screen">
        {stats.accountGeoReport?.datasets?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(10,15,30,0.5)_60%,rgba(8,12,25,0.8))] shadow-[0_20px_50px_rgba(2,8,23,0.45)] ring-1 ring-cyan-400/10"
          >
            <div className="border-b border-white/10 bg-[linear-gradient(90deg,rgba(34,211,238,0.13),rgba(192,132,252,0.12))] px-4 py-3 sm:px-5" />
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm text-left text-white/80">
                <thead className="bg-black/25 text-[11px] uppercase tracking-[0.24em] text-white/45">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-cyan-200">Account Name</th>
                    {stats.accountGeoReport.labels.slice(0, 6).map((country) => (
                      <th key={country} className="px-4 py-3 font-semibold text-fuchsia-200/90">{country}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.accountGeoReport.accountBreakdown.slice(0, 8).map((account, index) => (
                    <motion.tr
                      key={account.accountName}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.2 }}
                      className={`border-t border-white/10 ${index % 2 === 0 ? 'bg-white/[0.025]' : 'bg-black/10'}`}
                    >
                      <td className="px-4 py-3 font-semibold text-emerald-300">{account.accountName}</td>
                      {stats.accountGeoReport.labels.slice(0, 6).map((country) => {
                        const countryValue = account.countries.find((item) => item.country === country)
                        return (
                          <td key={`${account.accountName}-${country}`} className="px-4 py-3">
                            {countryValue ? (
                              <motion.div
                                initial={{ scale: 0.95, opacity: 0.8 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.2 }}
                                className="inline-flex min-w-[56px] items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-500/20 px-2.5 py-1 text-sm font-semibold text-cyan-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
                              >
                                {countryValue.uniqueClicks}
                              </motion.div>
                            ) : (
                              <span className="inline-flex min-w-[56px] items-center justify-center rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-sm text-white/30">
                                —
                              </span>
                            )}
                          </td>
                        )
                      })}
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-8 text-center text-sm text-white/40">
            No account-to-geo report data is available yet.
          </div>
        )}
      </div>

    </div>
  )
}
