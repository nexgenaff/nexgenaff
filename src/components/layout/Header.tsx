'use client'

import { useState, useEffect } from 'react'
import { Sun, Moon, Bell, User, Search } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function Header() {
  const [username, setUsername] = useState('')
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setUsername(data.username || 'Admin')
        }
      } catch { /* User not logged in */ }
    }
    fetchUser()

    const dark = localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setIsDark(dark)
    document.documentElement.classList.toggle('dark', dark)
  }, [])

  const toggleTheme = () => {
    const newDark = !isDark
    setIsDark(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  return (
    <header className="bg-white/5 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3 sm:py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Logo variant="compact" size="sm" showAnimation={true} />
          <span className="text-white/10 hidden sm:inline">|</span>
          <div className="hidden sm:block">
            <h2 className="text-base sm:text-lg font-semibold text-white truncate">
              Welcome back, <span className="gradient-text">{username || 'Admin'}</span>!
            </h2>
            <p className="mt-0.5 text-xs text-emerald-300/80">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live session verified
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-1.5 text-sm bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-white placeholder:text-white/20 w-40 lg:w-56"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-white/5 transition text-white/30 hover:text-white/60"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-xl hover:bg-white/5 transition text-white/30 hover:text-white/60 relative" aria-label="Notifications">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          </button>
          <div className="relative">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white font-semibold shadow-lg flex-shrink-0">
              <User className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
        </div>
      </div>
    </header>
  )
}