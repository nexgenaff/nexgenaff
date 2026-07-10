'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import StatsCards from '@/components/dashboard/StatsCards'
import RecentClicks from '@/components/dashboard/RecentClicks'
import ClickLogs from '@/components/dashboard/ClickLogs'
import { RefreshCw, Plus } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalClicks: 0,
    uniqueClicks: 0,
    totalLinks: 0,
    botClicks: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'logs'>('overview')

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard', { credentials: 'include' })
        if (response.status === 401) {
          router.push('/login')
          return
        }
        if (!response.ok) {
          console.error('Failed to fetch stats, status:', response.status)
          setStats({ totalClicks: 0, uniqueClicks: 0, totalLinks: 0, botClicks: 0 })
          return
        }

        let data = null
        try {
          data = await response.json()
        } catch (err) {
          console.error('Failed to parse stats JSON:', err)
          setStats({ totalClicks: 0, uniqueClicks: 0, totalLinks: 0, botClicks: 0 })
          return
        }

        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [router])

  const handleRefresh = async () => {
    setLoading(true)
    try {
        const response = await fetch('/api/analytics/dashboard', { credentials: 'include' })
        if (!response.ok) {
          console.error('Failed to refresh stats, status:', response.status)
          return
        }
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error('Failed to refresh stats:', error)
      } finally {
        setLoading(false)
      }
    }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Dashboard <span className="gradient-text">Pro</span></h1>
          <p className="text-sm sm:text-base text-white/30 mt-1">Welcome back! Here's your performance overview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleRefresh} 
            className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-white/60 rounded-xl hover:bg-white/10 hover:text-white transition text-sm font-medium flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <Link 
            href="/admin/links/create" 
            className="px-4 py-2 btn-gradient rounded-xl text-sm font-medium flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Link
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === 'overview'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-white/30 hover:text-white/60'
          }`}
        >
          📊 Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-sm font-medium transition border-b-2 ${
            activeTab === 'logs'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-white/30 hover:text-white/60'
          }`}
        >
          📋 Click Logs
        </button>
      </div>

      {/* Content */}
      {activeTab === 'overview' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RecentClicks />
          </div>
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 card-hover">
              <h3 className="text-lg font-semibold text-white mb-4">⚡ Quick Actions</h3>
              <div className="space-y-3">
                <Link href="/admin/links/create" className="flex items-center justify-between w-full px-4 py-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl hover:bg-indigo-500/20 transition group">
                  <span className="flex items-center gap-2">➕ Create New Link</span>
                  <span className="group-hover:translate-x-1 transition">→</span>
                </Link>
                <Link href="/admin/offers" className="flex items-center justify-between w-full px-4 py-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition group">
                  <span className="flex items-center gap-2">📦 Manage Offers</span>
                  <span className="group-hover:translate-x-1 transition">→</span>
                </Link>
                <Link href="/admin/domains" className="flex items-center justify-between w-full px-4 py-3 bg-white/5 text-white/60 rounded-xl hover:bg-white/10 transition group">
                  <span className="flex items-center gap-2">🌐 Custom Domains</span>
                  <span className="group-hover:translate-x-1 transition">→</span>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 card-hover">
              <h3 className="text-lg font-semibold text-white mb-4">📊 System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">API Status</span>
                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Operational
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Database</span>
                  <span className="flex items-center gap-2 text-sm text-green-400">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white/40">Uptime</span>
                  <span className="text-sm font-medium text-white">99.9%</span>
                </div>
                <div className="mt-3 h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-[99.9%] bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <ClickLogs />
      )}
    </div>
  )
}