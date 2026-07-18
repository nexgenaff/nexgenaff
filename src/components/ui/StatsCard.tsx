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
      className="stat-card min-w-0 rounded-[24px] border border-white/10 bg-slate-950/70 p-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm sm:p-3"
    >
      <div className="mb-2 h-1 w-12 rounded-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-cyan-400" />
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[8px] font-semibold uppercase tracking-[0.28em] text-slate-400 sm:text-[9px]">
            {title}
          </p>
          <p className="mt-1.5 text-[22px] font-black leading-none tracking-[-0.03em] text-white sm:text-[26px]">
            {formatNumber(value)}
          </p>
          {subtitle && (
            <p className="mt-1.5 whitespace-normal break-words text-[9px] uppercase tracking-[0.18em] text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex-shrink-0 rounded-2xl border border-white/10 p-1.5 shadow-[0_8px_20px_rgba(15,23,42,0.16)] ${colorClasses[color]}`}>
          <Icon className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-medium sm:text-[11px] ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-slate-500 sm:text-[11px]">vs last month</span>
        </div>
      )}

      <div className="mt-3 h-px w-full bg-gradient-to-r from-indigo-500/30 via-purple-500/25 to-transparent" />
    </motion.div>
  )
}