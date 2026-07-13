'use client'

import { LucideIcon } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: number
  icon: LucideIcon
  trend?: number
  color?: 'indigo' | 'green' | 'purple' | 'red' | 'blue' | 'orange'
  subtitle?: string
  delay?: number
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'indigo',
  subtitle,
  delay = 0,
}: StatsCardProps) {
  const colorClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    green: 'bg-green-500/10 text-green-400',
    purple: 'bg-purple-500/10 text-purple-400',
    red: 'bg-red-500/10 text-red-400',
    blue: 'bg-blue-500/10 text-blue-400',
    orange: 'bg-orange-500/10 text-orange-400',
  }

  const isPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="stat-card rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.075),rgba(255,255,255,0.03))] p-5 sm:p-6 shadow-[0_10px_35px_rgba(15,23,42,0.32)]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/35">{title}</p>
          <p className="mt-2 text-[30px] font-extrabold leading-none tracking-[-0.03em] text-white animate-countUp sm:text-[34px]">
            {formatNumber(value)}
          </p>
          {subtitle && (
            <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-white/30 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-2xl p-3 flex-shrink-0 border border-white/10 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs sm:text-sm text-white/20">vs last month</span>
        </div>
      )}

      <div className="mt-4 h-px w-full bg-gradient-to-r from-indigo-500/30 via-purple-500/25 to-transparent"></div>
    </motion.div>
  )
}