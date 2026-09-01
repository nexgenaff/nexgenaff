'use client'

import { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// ─── Helpers ──────────────────────────────────────────────────────────────

/** Convert a 2‑letter country code to its flag emoji (e.g. "US" → "🇺🇸") */
function getFlagEmoji(countryCode: string): string {
  const code = countryCode.toUpperCase()
  if (code.length !== 2) return countryCode // fallback
  const offset = 0x1F1E6 - 65 // 'A' = 65, regional indicator starts at 0x1F1E6
  const first = code.charCodeAt(0)
  const second = code.charCodeAt(1)
  if (first < 65 || first > 90 || second < 65 || second > 90) return countryCode
  return String.fromCodePoint(offset + first, offset + second)
}

/** Check if a string is already a flag emoji (contains regional indicator symbols) */
function isFlagEmoji(str: string): boolean {
  return /[\u{1F1E6}-\u{1F1FF}]/u.test(str)
}

/** Normalise a flag input: if it's a country code → convert to emoji; if emoji → keep; else empty */
function normalizeFlag(input: string | null | undefined): string {
  if (!input) return ''
  const trimmed = input.trim()
  if (!trimmed) return ''
  if (isFlagEmoji(trimmed)) return trimmed
  return getFlagEmoji(trimmed)
}

// ─── Component Props ──────────────────────────────────────────────────────

interface ChartProps {
  /** Chart data: labels and datasets (each with label, data, optional styling) */
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      borderColor?: string
      backgroundColor?: string | string[]
      borderWidth?: number
      tension?: number
      pointRadius?: number
      pointBackgroundColor?: string
      pointBorderColor?: string
      fill?: boolean
    }[]
  }
  /** Height of the chart container (default: 220px) */
  height?: number
  /** Chart type: 'line' (default) or 'bar' */
  type?: 'line' | 'bar'
  /** Enable stacked area/bar (default: false) */
  stacked?: boolean
  /** Country codes (e.g. ['US','DE']) or flag emojis in dataset order */
  flags?: (string | null)[]
  /** Additional Chart.js options (merged with defaults) */
  options?: any
}

// ─── Main Component ──────────────────────────────────────────────────────

export function Chart({
  data,
  height = 220,
  type = 'line',
  stacked = false,
  flags = [],
  options = {},
}: ChartProps) {
  const [isClient, setIsClient] = useState(false)
  const [isDark, setIsDark] = useState(true)

  useEffect(() => {
    setIsClient(true)
    const readTheme = () => {
      const storedTheme = window.localStorage.getItem('theme')
      setIsDark(storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches)
    }

    readTheme()
    window.addEventListener('themechange', readTheme)
    window.addEventListener('storage', readTheme)

    return () => {
      window.removeEventListener('themechange', readTheme)
      window.removeEventListener('storage', readTheme)
    }
  }, [])

  // Normalise all flags once
  const flagEmojis = flags.map((f) => normalizeFlag(f))
  const chartColors = isDark
    ? {
        text: 'rgba(255,255,255,0.7)',
        tick: 'rgba(255,255,255,0.5)',
        grid: 'rgba(255,255,255,0.06)',
        subtleGrid: 'rgba(255,255,255,0.04)',
      }
    : {
        text: '#334155',
        tick: '#64748b',
        grid: 'rgba(100,116,139,0.2)',
        subtleGrid: 'rgba(100,116,139,0.12)',
      }

  // ── Default Chart.js options ────────────────────────────────────────────

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: chartColors.text,
          font: { size: 12, weight: '600', family: 'Inter' },
          padding: 18,
          usePointStyle: true,
          pointStyle: 'circle',
          // Prepend flag to each label
          generateLabels: function (chart: any) {
            const original = ChartJS.defaults.plugins.legend.labels.generateLabels(chart)
            return original.map((label: any, i: number) => {
              const flag = flagEmojis[i] || ''
              return {
                ...label,
                text: flag ? `${flag} ${label.text}` : label.text,
              }
            })
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(6, 8, 15, 0.95)',
        titleColor: '#EFF6FF',
        bodyColor: '#CBD5E1',
        borderColor: 'rgba(148, 163, 184, 0.12)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        boxPadding: 6,
        callbacks: {
          label: function (context: any) {
            const datasetIndex = context.datasetIndex
            const flag = flagEmojis[datasetIndex] || ''
            const label = context.dataset.label || ''
            const value = context.parsed.y
            return `${flag} ${label}: ${value} clicks`
          },
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: chartColors.grid, drawBorder: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 10, weight: '600', family: 'Inter' },
          padding: 8,
        },
      },
      y: {
        border: { display: false },
        grid: { color: chartColors.subtleGrid, drawBorder: false },
        ticks: {
          color: chartColors.tick,
          font: { size: 10, weight: '600', family: 'Inter' },
          padding: 8,
          callback: function (value: any) {
            const n = Number(value)
            if (!Number.isFinite(n)) return value
            // Apply optional scale factor (e.g. to show thousands as 'k')
            const factor = options?.yScaleFactor ?? 1
            if (factor > 1) {
              return (n / factor).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
            return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
          },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 250,
      easing: 'linear' as const,
    },
    cubicInterpolationMode: 'linear' as const,
    spanGaps: true,
    elements: {
      line: {
        borderWidth: 2.5,
        tension: 0.35,
        borderJoinStyle: 'round',
        borderCapStyle: 'round',
      },
      point: {
        radius: 3,
        hoverRadius: 5.5,
      },
    },
    ...options, // user overrides
  }

  // ── Early returns ────────────────────────────────────────────────────────

  if (!isClient) {
    return <div className="w-full h-full animate-pulse" style={{ height }} />
  }

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    return (
      <div className="w-full h-full text-center" style={{ height }}>
        <p className="text-white/40">No chart data available</p>
      </div>
    )
  }

  // ── Sanitise datasets ────────────────────────────────────────────────────

  const safeLabels = data.labels ?? []
  const safeDatasets = data.datasets
    .filter(Boolean)
    .filter((ds) => ds && Array.isArray(ds.data))
    .map((dataset, idx) => {
      const label = (dataset.label || '').toLowerCase()
      const isClicks = label.includes('click')

      // Modern vibrant colour palette with excellent contrast
      const palette = [
        { border: '#0ea5e9', bg: 'rgba(14,165,233,0.18)' },      // Vibrant Sky Blue for Clicks
        { border: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },      // Golden Amber for Unique
        { border: '#10b981', bg: 'rgba(16,185,129,0.15)' },      // Emerald Green
        { border: '#8b5cf6', bg: 'rgba(139,92,246,0.14)' },      // Violet Purple
        { border: '#ec4899', bg: 'rgba(236,72,153,0.14)' },      // Hot Pink
        { border: '#06b6d4', bg: 'rgba(6,182,212,0.15)' },       // Cyan Teal
      ]
      const pick = isClicks ? palette[0] : palette[idx % palette.length]

      return {
        ...dataset,
        data: dataset.data.map((v) => (Number.isFinite(Number(v)) ? Number(v) : 0)),
        borderWidth: dataset.borderWidth ?? 2.5,
        tension: dataset.tension ?? 0.35,
        pointRadius: dataset.pointRadius ?? 3,
        // If stacked, default fill to true (area) unless user explicitly set it
        fill: dataset.fill ?? (stacked ? true : false),
        borderColor: dataset.borderColor ?? pick.border,
        backgroundColor: dataset.backgroundColor ?? (dataset.fill || stacked ? pick.bg : undefined),
        pointBackgroundColor: dataset.pointBackgroundColor ?? pick.border,
        pointBorderColor: dataset.pointBorderColor ?? 'rgba(255,255,255,0.3)',
      }
    })

  if (!safeLabels.length || safeDatasets.length === 0) {
    return (
      <div className="chart-empty-state w-full bg-white/5 rounded-xl p-6 text-center" style={{ height }}>
        <p className="text-white/40">No chart data available</p>
      </div>
    )
  }

  const normalizedData = {
    ...data,
    labels: safeLabels,
    datasets: safeDatasets,
  }

  // ── Dynamic Y‑axis scaling ──────────────────────────────────────────────

  const overallMax = normalizedData.datasets.reduce((max, ds) => {
    const dsMax = ds.data.length ? Math.max(...ds.data) : 0
    return Math.max(max, Number.isFinite(dsMax) ? dsMax : 0)
  }, 0)

  const computeStep = (maxVal: number) => {
    if (!Number.isFinite(maxVal) || maxVal <= 0) return 10
    const targetTicks = 5
    const raw = maxVal / targetTicks
    const pow = Math.pow(10, Math.floor(Math.log10(raw)))
    const candidates = [1, 2, 5, 10]
    for (const c of candidates) {
      const step = c * pow
      if (step >= raw) return step
    }
    return pow * 10
  }

  const yScaleFactor = options?.yScaleFactor ?? 1
  const appliedYScale = (yScaleFactor > 1 && overallMax >= yScaleFactor) ? yScaleFactor : 1
  let stepSize = computeStep(overallMax)
  if (appliedYScale > 1 && stepSize % appliedYScale !== 0) {
    stepSize = appliedYScale * Math.max(1, Math.ceil(stepSize / appliedYScale))
  }
  const suggestedMax = Math.ceil((overallMax || 0) / stepSize) * stepSize || stepSize

  const finalOptions = {
    ...defaultOptions,
    scales: {
      ...defaultOptions.scales,
      y: {
        ...defaultOptions.scales.y,
        stacked: stacked ? true : false,
        ticks: {
          ...defaultOptions.scales.y.ticks,
          stepSize,
          callback: function (value: any) {
            const n = Number(value)
            if (!Number.isFinite(n)) return value
            if (appliedYScale > 1) {
              return (n / appliedYScale).toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
            return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
          },
        },
        suggestedMax,
      },
    },
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full" style={{ height }}>
      {type === 'bar' ? (
        <Bar data={normalizedData} options={finalOptions} />
      ) : (
        <Line data={normalizedData} options={finalOptions} />
      )}
    </div>
  )
}