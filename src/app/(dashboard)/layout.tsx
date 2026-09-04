'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    let isActive = true

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })

        if (!isActive) return

        if (!response.ok) {
          router.push('/login')
        }
      } catch (error) {
        if (!isActive) return

        console.error('Dashboard auth check failed:', error)
        router.push('/login')
      }
    }

    checkAuth()

    return () => {
      isActive = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[var(--page-bg)] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 overflow-x-hidden overflow-y-auto px-2 py-3 sm:px-3 sm:py-5 lg:px-3 lg:py-6">
          <div className="w-full">{children}</div>
        </main>
      </div>
    </div>
  )
}