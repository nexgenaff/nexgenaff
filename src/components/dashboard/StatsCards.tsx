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

  const data = chartData || defaultChartData
  const hourlyData = hourlyChartData || defaultChartData
  const countryHighlights = [...(countryBreakdown || [])]
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 3)

  const flagColors = ['ring-sky-400/30 bg-sky-400/6', 'ring-violet-400/30 bg-violet-400/6', 'ring-emerald-400/30 bg-emerald-400/6']

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
          color="indigo"
          delay={0}
        />
        <StatsCard
          title="Unique Visitors"
          value={stats.uniqueClicks}
          icon={Users}
          color="green"
          delay={100}
        />
        <StatsCard
          title="Total Links"
          value={stats.totalLinks}
          icon={Link2}
          color="purple"
          delay={200}
        />
        {showConversions ? (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45, delay: 0.3 }}
            className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-colors duration-200 hover:bg-slate-50 dark:border-slate-700/30 dark:bg-slate-800/30 dark:hover:bg-slate-800/40"
          >
            <div className="grid grid-cols-1 divide-y divide-slate-200 dark:divide-slate-700/50 min-[420px]:grid-cols-2 min-[420px]:divide-y-0 min-[420px]:divide-x">
              <div className="min-w-0 pb-3 min-[420px]:pr-3 min-[420px]:pb-0">
                <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Revenue</p><CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(stats.revenue, 3)}</p>
              </div>
              <div className="min-w-0 pt-3 min-[420px]:pl-3 min-[420px]:pt-0">
                <div className="flex items-center justify-between gap-2"><p className="text-[10px] uppercase tracking-wide text-slate-500">Total payout</p><CircleDollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-300" /></div>
                <p className="mt-0.5 text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(totalPayout)}</p>
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
            decimalPlaces={3}
            delay={300}
          />
        )}
      </div>

      <div className="performance-panel w-full p-0">
        <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-300">Performance</p>
            <h3 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
              {onPeriodChange
                ? `${period.charAt(0).toUpperCase()}${period.slice(1)} click activity`
                : 'Monthly click activity'}
            </h3>
          </div>
          {onPeriodChange && (
            <div className="flex flex-wrap gap-2">
              {(['week', 'month', 'year'] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => onPeriodChange(item)}
                  className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                    period === item
                      ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/30'
                      : 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-100'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="chart-surface w-full px-2 sm:px-3">
          <Chart
            data={data}
            height={260}
            options={{
              animation: {
                duration: 800,
                easing: 'easeOutQuart',
              },
              // display y-axis scaled: each 10 raw units == 1 on axis labels
              yScaleFactor: 10,
            }}
          />
        </div>

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
    </div>
  )
}