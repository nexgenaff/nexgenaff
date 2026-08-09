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