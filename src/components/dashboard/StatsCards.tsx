'use client'

import { StatsCard } from '@/components/ui/StatsCard'
import { Chart } from '@/components/ui/Chart'
import { MousePointerClick, Users, Link2, Bug } from 'lucide-react'
import { getCountryFlag } from '@/lib/utils/country'

interface StatsCardsProps {
  stats: {
    totalClicks: number
    uniqueClicks: number
    totalLinks: number
    botClicks: number
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
}

export default function StatsCards({
  stats,
  chartData,
  hourlyChartData,
  countryBreakdown = [],
  period = 'week',
  onPeriodChange,
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
        <StatsCard
          title="Bot Clicks"
          value={stats.botClicks}
          icon={Bug}
          color="red"
          delay={300}
        />
      </div>

      <div className="performance-panel w-full bg-slate-950/70 p-0">
        <div className="mb-4 flex flex-col gap-4 sm:mb-5 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-sky-300">Performance</p>
            <h3 className="mt-1 text-base font-semibold text-slate-50 sm:text-lg">
              {period.charAt(0).toUpperCase() + period.slice(1)} click activity
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'week', label: 'Week' },
              { key: 'month', label: 'Month' },
              { key: 'year', label: 'Year' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => onPeriodChange?.(item.key as 'week' | 'month' | 'year')}
                className={`rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  period === item.key
                    ? 'bg-sky-500/20 text-sky-200 ring-1 ring-sky-500/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="chart-surface mx-4 rounded-xl border border-slate-800/60 bg-white/5 p-2 sm:mx-6">
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
          <div className="hourly-panel w-full bg-slate-950/70 p-4">
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