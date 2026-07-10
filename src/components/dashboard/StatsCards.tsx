'use client'

import { StatsCard } from '@/components/ui/StatsCard'
import { Chart } from '@/components/ui/Chart'
import { MousePointerClick, Users, Link2, Bot } from 'lucide-react'

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
}

export default function StatsCards({ stats, chartData }: StatsCardsProps) {
  const defaultChartData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Clicks',
        data: [420, 580, 720, 650, 890, 540, 380],
        borderColor: '#8B5CF6',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
      },
    ],
  }

  const data = chartData || defaultChartData

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatsCard
          title="Total Clicks"
          value={stats.totalClicks}
          icon={MousePointerClick}
          trend={12}
          color="indigo"
          subtitle={`${stats.totalLinks} active links`}
          delay={0}
        />
        <StatsCard
          title="Unique Visitors"
          value={stats.uniqueClicks}
          icon={Users}
          trend={8}
          color="green"
          subtitle="New visitors this month"
          delay={100}
        />
        <StatsCard
          title="Total Links"
          value={stats.totalLinks}
          icon={Link2}
          trend={5}
          color="purple"
          subtitle="Active campaigns"
          delay={200}
        />
        <StatsCard
          title="Bot Detected"
          value={stats.botClicks}
          icon={Bot}
          trend={-3}
          color="red"
          subtitle="Blocked bots"
          delay={300}
        />
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 animate-fadeInUp delay-400">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-white">
              📊 Weekly Click Activity
            </h3>
            <p className="text-sm text-white/30">
              Click volume over the last 7 days
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {['Week', 'Month', 'Year'].map((period) => (
              <button
                key={period}
                className={`px-3 py-1.5 text-sm rounded-lg transition ${
                  period === 'Week'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'text-white/30 hover:text-white/60 hover:bg-white/5'
                }`}
              >
                {period}
              </button>
            ))}
          </div>
        </div>
        <Chart
          data={data}
          height={220}
        />
      </div>
    </div>
  )
}