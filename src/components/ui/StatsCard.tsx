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
      className="stat-card bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/30">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-white mt-1 animate-countUp">
            {formatNumber(value)}
          </p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-white/20 mt-1 truncate">
              {subtitle}
            </p>
          )}
        </div>
        <div className={`rounded-xl p-2.5 sm:p-3 flex-shrink-0 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      {trend !== undefined && (
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2">
          <span className={`text-xs sm:text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {isPositive ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-xs sm:text-sm text-white/20">vs last month</span>
        </div>
      )}

      <div className="mt-3 h-0.5 w-full bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-transparent rounded-full"></div>
    </motion.div>
  )
}