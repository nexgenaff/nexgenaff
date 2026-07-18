'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          router.push('/login')
        }
      } catch {
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.1),_transparent_28%),linear-gradient(135deg,_#02030a_0%,_#040816_55%,_#02030a_100%)]">
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/60 px-8 py-8 text-center shadow-[0_10px_30px_rgba(2,6,23,0.18)] backdrop-blur-sm">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.1),transparent_30%)]" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/10">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-300/40 border-t-cyan-200" />
              <div className="absolute inset-0 animate-ping rounded-full border border-cyan-400/20" />
            </div>
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-100/90">Preparing dashboard</p>
            <p className="mt-2 text-sm text-slate-400">Just a moment while we load your workspace.</p>
          </div>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-3 sm:p-6 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}