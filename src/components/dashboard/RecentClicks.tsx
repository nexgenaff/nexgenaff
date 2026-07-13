'use client'

import { useState, useEffect } from 'react'
import { formatDate } from '@/lib/utils/helpers'
import { getCountryFlag, getCountryLabel } from '@/lib/utils/country'
import { Globe, Clock, Copy, CheckCircle, XCircle } from 'lucide-react'

interface Click {
  id: string
  country: string | null
  browser: string | null
  createdAt: string
  isUnique: boolean
  isBot: boolean
}

export default function RecentClicks() {
  const [clicks, setClicks] = useState<Click[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchClicks = async () => {
      try {
        const response = await fetch('/api/analytics/recent', { credentials: 'include' })
        if (response.ok) {
          try {
            const data = await response.json()
            setClicks(data)
          } catch (err) {
            console.error('Failed to parse recent clicks JSON:', err)
          }
        } else {
          console.error('Failed to fetch recent clicks, status:', response.status)
        }
      } catch (error) {
        console.error('Failed to fetch clicks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClicks()
  }, [])

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 rounded-xl skeleton flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="h-4 w-32 skeleton rounded" />
                <div className="h-3 w-24 skeleton rounded mt-2" />
              </div>
              <div className="h-3 w-20 skeleton rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-indigo-400" />
          <div>
            <h3 className="text-lg font-semibold text-white">Recent Clicks</h3>
            <p className="text-sm text-white/30">Latest visitor activity</p>
          </div>
        </div>
        <span className="text-sm text-white/30 bg-white/5 px-3 py-1 rounded-full">
          {clicks.length} total
        </span>
      </div>

      {clicks.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3 animate-float">📭</div>
          <p className="text-white/60">No clicks recorded yet</p>
          <p className="text-sm text-white/30 mt-1">Start sharing your links to see activity</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[320px] sm:max-h-[420px] overflow-y-auto pr-1 sm:pr-2">
          {clicks.slice(0, 10).map((click) => (
            <div
              key={click.id}
              className="flex flex-col gap-3 rounded-xl border border-transparent p-2.5 transition-all duration-200 hover:bg-white/5 hover:border-white/5 sm:flex-row sm:items-center sm:gap-4 sm:p-3"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                {getCountryFlag(click.country)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">
                    {getCountryLabel(click.country)}
                  </p>
                  {click.isUnique ? (
                    <span className="badge badge-success flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Unique
                    </span>
                  ) : (
                    <span className="badge badge-warning flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Duplicate
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-white/40 flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {click.browser || 'Unknown'}
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="text-white/30">
                    {formatDate(new Date(click.createdAt))}
                  </span>
                </div>
              </div>
              <button className="flex-shrink-0 p-1.5 text-white/20 hover:text-white/60 opacity-60 transition-all duration-200 hover:scale-110 sm:opacity-0 sm:group-hover:opacity-100">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}