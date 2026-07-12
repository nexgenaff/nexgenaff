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

const palette = ['from-cyan-500 to-blue-500', 'from-violet-500 to-fuchsia-500', 'from-emerald-500 to-teal-500']

function BreakdownSection({
  title,
  icon: Icon,
  items,
  accent,
}: {
  title: string
  icon: typeof Globe2
  items: BreakdownItem[]
  accent: string
}) {
  const maxValue = Math.max(...items.map(item => item.clicks), 1)

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-3 sm:p-4">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-cyan-300" />
        <h4 className="text-sm font-semibold text-white">{title}</h4>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-white/35">No breakdown data yet.</p>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 4).map((item, index) => (
            <div key={`${title}-${item.name}-${index}`}>
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="truncate text-white/70">{item.name || 'Unknown'}</span>
                <span className="text-cyan-300">{formatNumber(item.clicks)}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/5">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${accent}`}
                  style={{ width: `${Math.max(8, (item.clicks / maxValue) * 100)}%` }}
                />
              </div>
              <div className="mt-1 text-[11px] text-white/35">{formatNumber(item.uniqueClicks)} unique</div>
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
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <MousePointerClick className="w-5 h-5 text-indigo-400" />
        <div>
          <h3 className="text-lg font-semibold text-white">Traffic Intelligence</h3>
          <p className="text-sm text-white/30">Referrers, browsers, and device mix</p>
        </div>
      </div>

      <div className="grid gap-3">
        <BreakdownSection
          title="Top Referrers"
          icon={Globe2}
          items={referrerBreakdown}
          accent={palette[0]}
        />
        <BreakdownSection
          title="Browsers"
          icon={Globe2}
          items={browserBreakdown}
          accent={palette[1]}
        />
        <BreakdownSection
          title="Devices"
          icon={MonitorSmartphone}
          items={deviceBreakdown}
          accent={palette[2]}
        />
      </div>
    </div>
  )
}
