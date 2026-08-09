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

interface ChartProps {
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
  height?: number
  type?: 'line' | 'bar'
  options?: any
}

export function Chart({ data, height = 220, type = 'line', options = {} }: ChartProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const yScaleFactor = options?.yScaleFactor ?? 1

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
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
              // tooltip should show raw click count
              return context.dataset.label + ': ' + context.parsed.y + ' clicks'
            },
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: {
          color: 'rgba(255,255,255,0.5)',
          font: { size: 10, weight: '600', family: 'Inter' },
          padding: 8,
        },
      },
        y: {
          border: { display: false },
          grid: { color: 'rgba(255,255,255,0.02)', drawBorder: false },
          ticks: {
            color: 'rgba(255,255,255,0.6)',
            font: { size: 10, weight: '600', family: 'Inter' },
            padding: 8,
            callback: function(value: any) {
              const n = Number(value)
              if (!Number.isFinite(n)) return value
              if (yScaleFactor && yScaleFactor > 1) {
                // display scaled value (e.g., each 10 raw units => 1)
                return (n / yScaleFactor).toLocaleString(undefined, { maximumFractionDigits: 0 })
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
        borderWidth: 1,
        tension: 0,
        borderJoinStyle: 'miter',
        borderCapStyle: 'butt',
      },
      point: {
        radius: 0,
        hoverRadius: 3,
      },
    },
    ...options,
  }

  if (!isClient) {
    return <div className="w-full h-full animate-pulse" style={{ height }} />
  }

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    return <div className="w-full h-full text-center" style={{ height }}>
      <p className="text-white/40">No chart data available</p>
    </div>
  }

  const safeLabels = Array.isArray(data.labels) ? data.labels : []
  const safeDatasets = data.datasets
    .filter(Boolean)
    .filter((dataset): dataset is NonNullable<typeof dataset> => !!dataset && Array.isArray(dataset.data))
    .map((dataset, idx) => {
      const label = (dataset.label || '').toString().toLowerCase()
      const isClicks = label.includes('click') || label.includes('clicks') || label.includes('clicks:')

      const palette = [
        { border: 'rgba(16,185,129,1)', bg: 'rgba(16,185,129,0.10)' }, // emerald
        { border: 'rgba(34,211,238,1)', bg: 'rgba(34,211,238,0.08)' }, // cyan
        { border: 'rgba(99,102,241,1)', bg: 'rgba(99,102,241,0.08)' }, // indigo
        { border: 'rgba(168,85,247,1)', bg: 'rgba(168,85,247,0.08)' }, // violet
      ]

      const pick = isClicks ? palette[0] : palette[idx % palette.length]

      return {
        ...dataset,
        data: dataset.data.map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0)),
        borderWidth: dataset.borderWidth ?? 1,
        tension: dataset.tension ?? 0,
        pointRadius: dataset.pointRadius ?? 0,
        fill: dataset.fill ?? false,
        borderColor: dataset.borderColor ?? pick.border,
        backgroundColor: dataset.backgroundColor ?? (dataset.fill ? pick.bg : undefined),
        pointBackgroundColor: dataset.pointBackgroundColor ?? pick.border,
        pointBorderColor: dataset.pointBorderColor ?? 'rgba(0,0,0,0.2)',
      }
    })

  if (!safeLabels.length || safeDatasets.length === 0) {
    return <div className="w-full bg-white/5 rounded-xl p-6 text-center" style={{ height }}>
      <p className="text-white/40">No chart data available</p>
    </div>
  }

  const normalizedData = {
    ...data,
    labels: safeLabels,
    datasets: safeDatasets,
  }

  // Compute dynamic y-axis step and suggested max based on data range
  const overallMax = normalizedData.datasets.reduce((m, ds) => {
    const localMax = Array.isArray(ds.data) && ds.data.length ? Math.max(...ds.data) : 0
    return Math.max(m, Number.isFinite(Number(localMax)) ? Number(localMax) : 0)
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

  // Apply y-scale only when data range is large enough — avoids producing only [0, max] ticks
  const appliedYScale = yScaleFactor && yScaleFactor > 1 && overallMax >= yScaleFactor ? yScaleFactor : 1

  let stepSize = computeStep(overallMax)
  // If a y-scale is applied, make stepSize a multiple of that factor for clean integer labels
  if (appliedYScale > 1) {
    if (stepSize % appliedYScale !== 0) {
      stepSize = appliedYScale * Math.max(1, Math.ceil(stepSize / appliedYScale))
    }
  }
  const suggestedMax = Math.ceil((overallMax || 0) / stepSize) * stepSize || stepSize

  const finalOptions = {
    ...defaultOptions,
    scales: {
      ...defaultOptions.scales,
      y: {
        ...defaultOptions.scales.y,
        ticks: {
          ...defaultOptions.scales.y.ticks,
          stepSize,
          callback: function(value: any) {
            const n = Number(value)
            if (!Number.isFinite(n)) return value
            // If appliedYScale>1 show scaled integer labels (e.g., 10 -> 1)
            if (appliedYScale > 1) return (n / appliedYScale).toLocaleString(undefined, { maximumFractionDigits: 0 })
            return n.toLocaleString(undefined, { maximumFractionDigits: 0 })
          },
        },
        suggestedMax,
      },
    },
  }

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