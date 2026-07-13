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

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 10, weight: '600', family: 'Inter' },
          boxWidth: 10,
          boxHeight: 10,
          borderRadius: 3,
          useBorderRadius: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(18,18,31,0.95)',
        titleColor: '#FFFFFF',
        bodyColor: '#A78BFA',
        borderColor: 'rgba(124,58,237,0.2)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context: any) {
            return context.dataset.label + ': ' + context.parsed.y + ' clicks'
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: {
          color: 'rgba(255,255,255,0.15)',
          font: { size: 10, weight: '500', family: 'Inter' },
        },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
        ticks: {
          color: 'rgba(255,255,255,0.15)',
          font: { size: 10, weight: '500', family: 'Inter' },
        },
        beginAtZero: true,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    animation: {
      duration: 600,
      easing: 'easeOutQuart' as const,
    },
    elements: {
      line: {
        borderWidth: 3,
        tension: 0.38,
      },
      point: {
        radius: 3,
        hoverRadius: 5,
      },
    },
    ...options,
  }

  if (!isClient) {
    return <div className="w-full bg-white/5 rounded-xl animate-pulse" style={{ height }} />
  }

  if (!data || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    return <div className="w-full bg-white/5 rounded-xl p-6 text-center" style={{ height }}>
      <p className="text-white/40">No chart data available</p>
    </div>
  }

  const safeLabels = Array.isArray(data.labels) ? data.labels : []
  const safeDatasets = data.datasets
    .filter(Boolean)
    .filter((dataset): dataset is NonNullable<typeof dataset> => !!dataset && Array.isArray(dataset.data))
    .map((dataset) => ({
      ...dataset,
      data: dataset.data.map((value) => (Number.isFinite(Number(value)) ? Number(value) : 0)),
      borderWidth: dataset.borderWidth ?? 3,
      tension: dataset.tension ?? 0.35,
      pointRadius: dataset.pointRadius ?? 3,
      fill: dataset.fill ?? true,
    }))

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

  return (
    <div className="w-full" style={{ height }}>
      {type === 'bar' ? (
        <Bar data={normalizedData} options={defaultOptions} />
      ) : (
        <Line data={normalizedData} options={defaultOptions} />
      )}
    </div>
  )
}