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
    indigo: 'border-indigo-400/40 bg-indigo-500/20 text-indigo-200',
    green: 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200',
    purple: 'border-violet-400/40 bg-violet-500/20 text-violet-200',
    red: 'border-rose-400/40 bg-rose-500/20 text-rose-200',
    blue: 'border-sky-400/40 bg-sky-500/20 text-sky-200',
    orange: 'border-amber-400/40 bg-amber-500/20 text-amber-200',
  }

  const isPositive = trend !== undefined && trend >= 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, delay: delay / 1000 }}
      className="stat-card min-w-0 rounded-[20px] border border-slate-700/80 bg-slate-900/90 p-3.5 shadow-[0_10px_30px_rgba(2,8,23,0.25)] backdrop-blur-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-[24px] font-semibold leading-none tracking-[-0.03em] text-slate-50 sm:text-[28px]">
            {formatNumber(value)}
          </p>
          {subtitle && (
            <p className="mt-1.5 whitespace-normal break-words text-[9px] uppercase tracking-[0.18em] text-slate-500">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border ${colorClasses[color]}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={`text-[10px] font-semibold sm:text-[11px] ${isPositive ? 'text-emerald-300' : 'text-rose-300'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-[10px] text-slate-400 sm:text-[11px]">vs last month</span>
        </div>
      )}

      <div className="mt-3 h-px w-full bg-gradient-to-r from-slate-700/0 via-slate-600/80 to-slate-700/0" />
    </motion.div>
  )
}