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
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ShieldCheck,
  Layers,
  WalletCards,
} from 'lucide-react'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [popupOpen, setPopupOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
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

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (!response.ok) return
        const data = await response.json()
        setUserRole(data?.role ?? null)
      } catch {
        setUserRole(null)
      }
    }

    fetchUser()
  }, [])

  const menuItems = [
    ...(userRole === 'OWNER'
      ? [{ href: '/owner/managers', label: 'Manager Approvals', icon: ShieldCheck }]
      : []),
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/links/create', label: 'Create Link Account', icon: Plus },
    { href: '/admin/links/create-turbo', label: 'Create Link Account Turbo Mood', icon: Plus },
    { href: '/admin/links', label: 'All Link Account', icon: Link2 },
    { href: '/admin/payments', label: 'Payments', icon: WalletCards },
    ...(userRole !== 'MANAGER'
      ? [{ href: '/admin/offers', label: 'Offer Vault', icon: Package }]
      : []),
    { href: '/admin/domains', label: 'Custom Domains', icon: Globe2 },
    { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/admin/landing-builder', label: 'Landing page Builder', icon: Layers },
    ...(userRole === 'OWNER'
      ? [{ href: '/admin/templates', label: 'Templates', icon: Layers }]
      : []),
    { href: '/admin/settings', label: 'Settings', icon: Settings },
  ]

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_38%),linear-gradient(135deg,rgba(34,211,238,0.08),transparent_40%,rgba(129,140,248,0.08))]" />
      <div className="relative flex items-center justify-start p-0 w-full gap-2 flex-shrink-0">
        {!collapsed && (
          <div className="relative h-10 flex-1 overflow-hidden">
            <Image
              src="/afficixo-logo.png"
              alt="Afficixo logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        )}
      </div>

      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="relative z-10 hidden lg:flex items-center justify-center p-1 mx-2 mt-1 rounded-md border border-white/10 bg-white/[0.04] text-slate-400 transition-colors duration-200 hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-200 flex-shrink-0"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      )}

      <nav className={`relative z-10 flex-1 overflow-y-auto ${isMobile ? 'space-y-2 px-2 py-2' : 'space-y-1 px-2 py-2'}`}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => isMobile && setMobileOpen(false)}
              className={`group flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2'} ${isMobile ? 'rounded-lg px-2 py-2' : 'rounded-lg px-2 py-1.5'} border border-transparent transition-colors duration-150 ${
                isActive
                  ? 'bg-cyan-400/10 border-cyan-400/20 text-slate-50 font-medium'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/10'
              }`}
            >
              <Icon className={`${collapsed && !isMobile ? 'w-4 h-4' : 'w-4 h-4'} transition-colors duration-200 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
              {(!collapsed || isMobile) && <span className="text-xs tracking-[0.01em]">{item.label}</span>}
              {isActive && !collapsed && !isMobile && (
                <span className="ml-auto h-5 w-0.5 rounded-full bg-cyan-300" />
              )}
            </Link>
          )
        })}
      </nav>

      <div className={`relative z-10 border-t border-white/10 flex-shrink-0 ${isMobile ? 'space-y-0.5 px-2 py-2' : 'space-y-0.5 px-2 py-2'}`}>
        <button
          onClick={handleLogout}
          className={`w-full group flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2'} ${isMobile ? 'rounded-lg px-2 py-1.5' : 'rounded-lg px-2 py-1.5'} border border-transparent transition-colors duration-150 text-red-400/80 hover:text-red-300 hover:bg-red-500/10 hover:border-red-400/20`}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className={`${collapsed && !isMobile ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-200 group-hover:scale-110`} />
          {(!collapsed || isMobile) && <span className="text-xs tracking-[0.01em]">Logout</span>}
        </button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          type="button"
          className="edge-toggle fixed right-2 top-1 z-[60] flex h-10 w-10 items-center justify-center rounded-none !border-0 bg-transparent p-0 text-slate-700 !shadow-none outline-none backdrop-blur-none dark:bg-transparent dark:text-slate-100 lg:hidden"
          aria-label={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
          title={mobileOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <Menu className="h-5 w-5" />
        </button>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-[45] bg-black/55 backdrop-blur-[2px] lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <aside
            className={`panel-bleed fixed right-0 top-0 z-[50] flex h-auto max-h-screen w-[min(16rem,calc(100vw-1rem))] flex-col overflow-y-auto overflow-x-hidden rounded-none border-0 transition-[transform,opacity,box-shadow] duration-300 ease-out lg:hidden ${
            mobileOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-90'
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
        className="edge-toggle fixed right-0 top-0 z-[60] hidden h-11 w-11 items-center justify-center rounded-none border-0 bg-transparent p-0 text-slate-100/80 shadow-none ring-0 lg:flex"
        aria-label={popupOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        <Menu className="w-4 h-4" />
      </button>

      {popupOpen && (
        <div
          className="fixed inset-0 z-[40] hidden bg-black/55 backdrop-blur-[2px] lg:block"
          onClick={() => setPopupOpen(false)}
        />
      )}

      <aside
        className={`panel-bleed fixed bottom-0 right-0 top-0 z-[50] hidden h-screen flex-col ${collapsed ? 'w-16' : 'w-52'} overflow-hidden rounded-none border-0 ring-0 transition-[transform,opacity,box-shadow] duration-300 ease-out lg:flex ${popupOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}