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
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2 sm:p-3">
      <div className="mb-2 flex items-center gap-2">
        <Icon className={`h-3 w-3 ${iconColor ?? 'text-slate-400'}`} />
        <h4 className={`text-xs font-semibold ${titleColor ?? 'text-white'}`}>{title}</h4>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-400">No breakdown data yet.</p>
      ) : (
        <div className="space-y-2">
          {/* thin accent line for visual color */}
          <div className={`h-1 rounded-full ${accent} opacity-95 mb-2`} />
          {items.slice(0, 4).map((item, index) => (
            <div key={`${title}-${item.name}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-slate-100">{item.name || 'Unknown'}</span>
                <span className={`${valueColor ?? 'text-slate-400'}`}>{formatNumber(item.clicks)}</span>
              </div>
              <div className="mt-0 text-[11px] text-slate-500">{formatNumber(item.uniqueClicks)} unique</div>
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
    <div className="rounded-lg bg-slate-900/80 p-3 shadow-sm sm:p-4">
      

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
