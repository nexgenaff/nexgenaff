'use client'

import { Globe2, MonitorSmartphone, MousePointerClick } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'

interface BreakdownItem {
  name: string
  clicks: number
  uniqueClicks: number
}

interface TrafficBreakdownProps {
  referrerBreakdown?: BreakdownItem[]
  browserBreakdown?: BreakdownItem[]
  deviceBreakdown?: BreakdownItem[]
}

const palette = ['bg-sky-400', 'bg-violet-400', 'bg-emerald-400']

function BreakdownSection({
  title,
  icon: Icon,
  items,
  accent,
  titleColor,
  iconColor,
  valueColor,
}: {
  title: string
  icon: typeof Globe2
  items: BreakdownItem[]
  accent: string
  titleColor?: string
  iconColor?: string
  valueColor?: string
}) {
  const maxValue = Math.max(...items.map(item => item.clicks), 1)

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-2 sm:p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-3 w-3 ${iconColor ?? 'text-gray-600'}`} />
        <h4 className={`text-xs font-semibold ${titleColor ?? 'text-slate-900'}`}>{title}</h4>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-gray-500">No breakdown data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 4).map((item, index) => {
            const pct = Math.round((item.clicks / Math.max(...items.map(i => i.clicks), 1)) * 100)
            return (
              <div key={`${title}-${item.name}-${index}`}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-slate-700">{item.name || 'Unknown'}</span>
                  <span className={`${valueColor ?? 'text-gray-700'}`}>{formatNumber(item.clicks)}</span>
                </div>

                <div className="mt-1 h-1 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`${accent} h-1 rounded-full opacity-95`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="mt-1 text-[11px] text-gray-600">{formatNumber(item.uniqueClicks)} unique</div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TrafficBreakdown({
  referrerBreakdown = [],
  browserBreakdown = [],
  deviceBreakdown = [],
}: TrafficBreakdownProps) {
  return (
    <div className="rounded-lg bg-white p-3 shadow-sm sm:p-4 border border-gray-200">
      <div className="grid gap-3">
        <BreakdownSection
          title="Top Referrers"
          icon={Globe2}
          items={referrerBreakdown}
          accent={palette[0]}
          titleColor="text-sky-700"
          iconColor="text-sky-600"
          valueColor="text-slate-700"
        />
        <BreakdownSection
          title="Browsers"
          icon={Globe2}
          items={browserBreakdown}
          accent={palette[1]}
          titleColor="text-violet-700"
          iconColor="text-violet-600"
          valueColor="text-slate-700"
        />
        <BreakdownSection
          title="Devices"
          icon={MonitorSmartphone}
          items={deviceBreakdown}
          accent={palette[2]}
          titleColor="text-emerald-700"
          iconColor="text-emerald-600"
          valueColor="text-slate-700"
        />
      </div>
    </div>
  )
}
