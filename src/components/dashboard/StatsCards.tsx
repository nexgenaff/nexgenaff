'use client'

import { StatsCard } from '@/components/ui/StatsCard'
import { Chart } from '@/components/ui/Chart'
import { MousePointerClick, Users, Link2 } from 'lucide-react'

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
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
          color="indigo"
          subtitle={`${stats.totalLinks} active links`}
          delay={0}
        />
        <StatsCard
          title="Unique Visitors"
          value={stats.uniqueClicks}
          icon={Users}
          color="green"
          subtitle="Distinct visitors tracked"
          delay={100}
        />
        <StatsCard
          title="Total Links"
          value={stats.totalLinks}
          icon={Link2}
          color="purple"
          subtitle="Active campaigns"
          delay={200}
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 animate-fadeInUp delay-400">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              📊 {period.charAt(0).toUpperCase() + period.slice(1)} Click Activity
            </h3>
            <p className="text-sm text-white/30">
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
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  period === item.key
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
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

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="mb-3">
              <h4 className="text-sm font-semibold text-white">🕒 Daily Hourly Traffic</h4>
              <p className="text-xs text-white/35">Today’s 24-hour distribution</p>
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
              <p className="text-xs text-white/35">Top geo activity visible on the main graph</p>
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