'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileDown, RefreshCw } from 'lucide-react'
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

  const report = stats.accountGeoReport
  const reportLabels = report?.labels ?? []
  const reportRows = report?.accountBreakdown ?? []

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[16px] border border-slate-800/70 bg-slate-900/50 px-4 py-3"
      >
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">Overview</div>
            <h1 className="text-base font-semibold text-slate-100">Analytics</h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-slate-800/80 bg-slate-950/70 px-2.5 py-1.5 text-xs font-medium text-slate-400">
              {stats.totalLinks > 0 ? `${stats.totalLinks} active` : 'No data yet'}
            </div>
            <button
              onClick={() => fetchStats(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-800/80 bg-slate-950/70 px-2.5 py-1.5 text-sm font-medium text-slate-200 transition hover:border-slate-700 hover:bg-slate-800/80"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing' : 'Refresh'}
            </button>
            <Link
              href="/admin/links/create"
              className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              New campaign
            </Link>
          </div>
        </div>
      </motion.div>

      <StatsCards
        stats={stats}
        chartData={stats.chartData}
        hourlyChartData={stats.hourlyChartData}
      />

      <div className="overflow-hidden rounded-[24px] border border-slate-800/80 bg-slate-950/70 shadow-[0_16px_48px_rgba(2,8,23,0.28)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/60 px-4 py-3 sm:px-5">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">Geo breakdown</p>
            <h2 className="mt-1 text-sm font-semibold text-slate-100">Account to country Performance</h2>
          </div>
          <div className="rounded-full border border-slate-800/80 bg-slate-950/70 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-400">
            {report?.datasets?.length ? `${reportRows.length} accounts` : 'Waiting'}
          </div>
        </div>

        {report?.datasets?.length ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="overflow-x-auto"
          >
            <table className="min-w-full border-collapse text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-[0.24em] text-slate-500">
                <tr>
                  <th className="border-b border-slate-800/80 px-4 py-3 font-semibold text-slate-300">Account</th>
                  {reportLabels.map((country) => (
                    <th key={country} className="border-b border-slate-800/80 px-3 py-3 font-semibold text-slate-400">{country}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {reportRows.map((account, index) => (
                  <motion.tr
                    key={account.accountName}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04, duration: 0.2 }}
                    className={`border-b border-slate-800/70 ${index % 2 === 0 ? 'bg-slate-950/40' : 'bg-slate-900/50'}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-100">{account.accountName}</td>
                    {reportLabels.map((country) => {
                      const countryValue = account.countries.find((item) => item.country === country)
                      return (
                        <td key={`${account.accountName}-${country}`} className="px-3 py-3">
                          {countryValue ? (
                            <span className="inline-flex min-w-[54px] items-center justify-center rounded-md border border-slate-700 bg-slate-800/85 px-2.5 py-1 text-sm font-semibold text-slate-50">
                              {countryValue.uniqueClicks}
                            </span>
                          ) : (
                            <span className="inline-flex min-w-[54px] items-center justify-center rounded-md border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-sm text-slate-500">
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
          </motion.div>
        ) : (
          <div className="p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/70 text-slate-400">
              <FileDown className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-200">No account to country report available yet</h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Publish links and collect traffic so this board can render account-level country performance.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
