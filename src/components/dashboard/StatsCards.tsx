'use client'

import { StatsCard } from '@/components/ui/StatsCard'
import { Chart } from '@/components/ui/Chart'
import { MousePointerClick, Users, Link2, CircleDollarSign } from 'lucide-react'
import { getCountryFlag } from '@/lib/utils/country'
import { motion } from 'framer-motion'

interface StatsCardsProps {
  stats: {
    totalClicks: number
    uniqueClicks: number
    totalLinks: number
    revenue?: number
    totalPayout?: number
  }
  chartData?: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
  hourlyChartData?: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor: string
      backgroundColor: string
    }[]
  }
  countryBreakdown?: {
    country: string
    clicks: number
    uniqueClicks: number
  }[]
  period?: 'week' | 'month' | 'year'
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void
  totalPayout?: number
  showConversions?: boolean
}

function formatCurrency(value: number | undefined, decimalPlaces = 2) {
  const amount = Number(value)
  return Number.isFinite(amount) ? `$${amount.toFixed(decimalPlaces)}` : '$0.00'
}

export default function StatsCards({
  stats,
  chartData,
  hourlyChartData,
  countryBreakdown = [],
  period = 'week',
  onPeriodChange,
  totalPayout = 0,
  showConversions = false,
}: StatsCardsProps) {
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

  const defaultHourlyChartData = {
    labels: Array.from({ length: 24 }, (_, hour) => `${String(hour).padStart(2, '0')}:00`),
    datasets: [
      {
        label: 'TCL',
        data: Array(24).fill(0),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14, 165, 233, 0.7)',
      },
      {
        label: 'UCL',
        data: Array(24).fill(0),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
    ],
  }

  const data = chartData || defaultChartData
  const hourlyData = hourlyChartData || defaultHourlyChartData
  const countryHighlights = [...(countryBreakdown || [])]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 3)

  const flagColors = ['ring-sky-400/30 bg-sky-400/6', 'ring-violet-400/30 bg-violet-400/6', 'ring-emerald-400/30 bg-emerald-400/6']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-4">
        <StatsCard
          title="Total Links"
          value={stats.totalLinks}
          icon={Link2}
          color="purple"
          delay={0}
        />
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
          color="indigo"
          delay={100}
        />
        <StatsCard
          title="Unique Visitors"
          value={stats.uniqueClicks}
          icon={Users}
          color="green"
          delay={200}
        />
        {showConversions ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-colors duration-200 hover:bg-slate-50 sm:p-4 dark:border-slate-700/30 dark:bg-slate-800/30 dark:hover:bg-slate-800/40"
          >
            <div className="grid grid-cols-2 divide-x divide-slate-200 dark:divide-slate-700/50">
              <div className="min-w-0 pr-2 sm:pr-3">
                <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">{showConversions ? 'Total Cost' : 'Revenue'}</p><CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div>
                <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{formatCurrency(stats.revenue)}</p>
              </div>
              <div className="min-w-0 pl-2 sm:pl-3">
                <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Total credit</p><CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div>
                <p className="mt-0.5 text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">{formatCurrency(totalPayout)}</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <StatsCard
            title="Revenue"
            value={stats.revenue ?? 0}
            icon={CircleDollarSign}
            color="green"
            prefix="$"
            decimalPlaces={2}
            delay={300}
          />
        )}
      </div>

      {/* Graph removed as per user request */}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-5">
        <div className="hourly-panel w-full p-4">
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-medium text-sky-200">Hourly distribution</h4>
            <span className="text-[11px] uppercase tracking-[0.24em] text-slate-400">24h</span>
          </div>
          <Chart
            data={hourlyData}
            height={190}
            type="bar"
            options={{
              animation: {
                duration: 800,
                easing: 'easeOutQuart',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}