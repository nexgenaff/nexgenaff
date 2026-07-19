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

const palette = ['from-slate-600 to-slate-500', 'from-slate-500 to-slate-400', 'from-indigo-500/80 to-slate-600']

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
    <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${iconColor ?? 'text-slate-400'}`} />
        <h4 className={`text-sm font-semibold ${titleColor ?? 'text-white'}`}>{title}</h4>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400">No breakdown data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 4).map((item, index) => (
            <div key={`${title}-${item.name}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-slate-100">{item.name || 'Unknown'}</span>
                <span className={`${valueColor ?? 'text-slate-400'}`}>{formatNumber(item.clicks)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/90">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${accent}`}
                  style={{ width: `${Math.max(8, (item.clicks / maxValue) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-slate-500">{formatNumber(item.uniqueClicks)} unique</div>
            </div>
          ))}
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
    <div className="rounded-[24px] border border-slate-800 bg-slate-900/80 p-4 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MousePointerClick className="w-5 h-5 text-violet-400" />
        <div>
          <h3 className="text-lg font-semibold text-slate-100">Traffic Intelligence</h3>
          <p className="text-sm text-slate-400">Referrers, browsers, and device mix</p>
        </div>
      </div>

      <div className="grid gap-3">
        <BreakdownSection
          title="Top Referrers"
          icon={Globe2}
          items={referrerBreakdown}
          accent={palette[0]}
          titleColor="text-sky-300"
          iconColor="text-sky-400"
          valueColor="text-slate-300"
        />
        <BreakdownSection
          title="Browsers"
          icon={Globe2}
          items={browserBreakdown}
          accent={palette[1]}
          titleColor="text-violet-300"
          iconColor="text-violet-400"
          valueColor="text-slate-300"
        />
        <BreakdownSection
          title="Devices"
          icon={MonitorSmartphone}
          items={deviceBreakdown}
          accent={palette[2]}
          titleColor="text-emerald-300"
          iconColor="text-emerald-400"
          valueColor="text-slate-300"
        />
      </div>
    </div>
  )
}
