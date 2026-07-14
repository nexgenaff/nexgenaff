'use client'

import { StatsCard } from '@/components/ui/StatsCard'
import { Chart } from '@/components/ui/Chart'
import { MousePointerClick, Users, Link2, Bug } from 'lucide-react'

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

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
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

      <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.07),rgba(255,255,255,0.03))] p-4 sm:p-6 shadow-[0_10px_35px_rgba(15,23,42,0.32)] animate-fadeInUp delay-400">
        <div className="mb-4 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              <span className="text-[10px]">●</span>
              Weekly overview
            </div>
            <h3 className="text-lg font-semibold text-white sm:text-xl">
              {period.charAt(0).toUpperCase() + period.slice(1)} Click Activity
            </h3>
            <p className="text-sm text-white/35">
              Click volume over the selected analytics window with geo overlays
            </p>
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
                className={`rounded-xl px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${
                  period === item.key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-white/35 hover:text-white/70 hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <Chart
          data={data}
          height={260}
          options={{
            animation: {
              duration: 900,
              easing: 'easeOutQuart',
            },
          }}
        />

        <div className="mt-4 grid grid-cols-1 gap-4 lg:mt-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-white">🕒 Daily Hourly Traffic</h4>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Today’s 24-hour distribution</p>
            </div>
            <Chart
              data={hourlyData}
              height={190}
              type="bar"
              options={{
                animation: {
                  duration: 900,
                  easing: 'easeOutQuart',
                },
              }}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-white">🌍 Country Click Report</h4>
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/35">Top geo activity visible on the main graph</p>
            </div>

            <div className="space-y-3">
              {countryHighlights.length === 0 ? (
                <p className="text-sm text-white/40">No geo-click series available yet.</p>
              ) : (
                countryHighlights.map((country) => (
                  <div key={country.country} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-white">{country.country}</span>
                      <span className="text-sm text-cyan-300">{country.clicks} clicks</span>
                    </div>
                    <div className="mt-1 text-xs text-white/45">{country.uniqueClicks} unique geo clicks</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}