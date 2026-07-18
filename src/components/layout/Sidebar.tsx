'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Plus,
  Package,
  Globe2,
  Link2,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react'
import { Logo } from '@/components/ui/Logo'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
        setPopupOpen(false)
      } else {
        setCollapsed(false)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
    setPopupOpen(false)
  }, [pathname])

  const menuItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/links/create', label: 'Create Link', icon: Plus },
    { href: '/admin/links', label: 'All Links', icon: Link2 },
    { href: '/admin/offers', label: 'Offer Vault', icon: Package },
    { href: '/admin/domains', label: 'Custom Domains', icon: Globe2 },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  const sidebarContent = (
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(129,140,248,0.16),transparent_38%)]" />
      <div className={`relative flex items-center justify-between px-3 py-3 border-b border-white/10 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <Logo
          variant={collapsed && !isMobile ? 'icon' : 'compact'}
          size="sm"
          showAnimation={true}
        />
        {!isMobile && !collapsed && (
          <button
            onClick={() => setPopupOpen(false)}
            className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:bg-white/[0.08] hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="relative z-10 hidden lg:flex items-center justify-center p-1.5 mx-3 mt-2 text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] rounded-lg transition"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <nav className="relative z-10 flex-1 px-2.5 py-2.5 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2.5'} px-2.5 py-2.5 rounded-2xl border border-transparent transition-all duration-200 group ${
                isActive
                  ? 'bg-cyan-500/12 border-cyan-400/25 text-slate-50 font-medium shadow-[0_10px_24px_rgba(34,211,238,0.08)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/10 hover:translate-x-0.5'
              }`}
            >
              <Icon className={`${collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
              {(!collapsed || isMobile) && <span className="text-[13px] tracking-[0.01em]">{item.label}</span>}
              {isActive && !collapsed && !isMobile && (
                <span className="ml-auto h-6 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-violet-500" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`relative z-10 px-3 py-3 border-t border-white/10 ${collapsed && !isMobile ? 'text-center' : ''}`}>
        <div className={`flex ${collapsed && !isMobile ? 'flex-col items-center' : 'items-center gap-2.5'}`}>
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-r from-indigo-600 to-purple-600 shadow-[0_6px_16px_rgba(99,102,241,0.22)] flex-shrink-0">
              <Image
                src="/favicon.png"
                alt="Admin profile image"
                width={40}
                height={40}
                className="h-full w-full object-cover"
                priority
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-950" />
          </div>
          {(!collapsed || isMobile) && (
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-slate-100 truncate">Admin</p>
              <p className="text-[11px] text-slate-400 truncate">Pro workspace</p>
            </div>
          )}
        </div>
        {(!collapsed || isMobile) && (
          <button
            onClick={handleLogout}
            className="mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 text-[12px] text-red-400/90 hover:bg-red-500/10 rounded-xl border border-transparent hover:border-red-400/15 transition-all duration-200 group"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
            Logout
          </button>
        )}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="fixed top-4 left-4 z-[60] p-2.5 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_34px_rgba(2,6,23,0.45)] ring-1 ring-white/5 md:hidden"
        >
          {mobileOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-[45] bg-black/55 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
          className={`fixed top-3 left-3 bottom-3 z-[50] flex flex-col w-68 max-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[26px] border border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.7)] transition-[transform,opacity,box-shadow] duration-300 ease-out lg:hidden ${
            mobileOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-90'
          }`}
        >
          {sidebarContent}
        </aside>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setPopupOpen(!popupOpen)}
        className="fixed right-3 top-3 z-[60] hidden md:flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-slate-900/80 text-slate-100 backdrop-blur-xl shadow-[0_12px_34px_rgba(2,6,23,0.45)] ring-1 ring-white/5 transition hover:bg-slate-800/80"
        aria-label={popupOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {popupOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
      </button>

      {popupOpen && (
        <div
          className="fixed inset-0 z-[40] hidden bg-black/55 backdrop-blur-[2px] md:block"
          onClick={() => setPopupOpen(false)}
        />
      )}

      <aside
        className={`fixed left-4 top-4 bottom-4 z-[50] hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-72'} max-h-[calc(100vh-2rem)] overflow-hidden rounded-[30px] border border-white/10 bg-slate-950/85 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.72)] ring-1 ring-white/5 transition-[transform,opacity,box-shadow] duration-300 ease-out ${popupOpen ? 'translate-x-0 opacity-100' : '-translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}