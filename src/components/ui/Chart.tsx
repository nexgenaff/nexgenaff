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

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(7, 12, 22, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 10,
        callbacks: {
          label: function (context: any) {
            return context.dataset.label + ': ' + context.parsed.y + ' clicks'
          },
        },
      },
    },
    scales: {
      x: {
        border: { display: false },
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: 'rgba(255,255,255,0.44)',
          font: { size: 10, weight: '600', family: 'Inter' },
          padding: 8,
        },
      },
      y: {
        border: { display: false },
        grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
        ticks: {
          color: 'rgba(255,255,255,0.44)',
          font: { size: 10, weight: '600', family: 'Inter' },
          padding: 8,
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
        borderWidth: 2,
        tension: 0.3,
      },
      point: {
        radius: 0,
        hoverRadius: 4,
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