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
  Webhook,
  Zap,
  X,
} from 'lucide-react'
import { getDashboardBasePath, getDashboardPath } from '@/lib/auth/dashboard-path'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024
      setIsMobile(mobile)
      if (mobile) {
        setCollapsed(true)
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
  }, [pathname])

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

  const dashboardBasePath = getDashboardBasePath(userRole)
  const menuGroups = [
    {
      label: 'Overview',
      items: [
        ...(userRole === 'OWNER'
          ? [{ href: '/owner/managers', label: 'Manager Approvals', icon: ShieldCheck }]
          : []),
        { href: getDashboardPath(userRole), label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      label: 'Link accounts',
      items: [
        { href: `${dashboardBasePath}/links/create`, label: 'New Link Account', icon: Plus },
        { href: `${dashboardBasePath}/links/create-turbo`, label: 'Turbo Link Account', icon: Zap },
        { href: `${dashboardBasePath}/links`, label: 'Link Accounts', icon: Link2 },
      ],
    },
    {
      label: 'Operations',
      items: [
        ...(userRole !== 'MANAGER'
          ? [{ href: `${dashboardBasePath}/offers`, label: 'Offer Vault', icon: Package }]
          : []),
        ...(userRole !== 'MANAGER'
          ? [{ href: `${dashboardBasePath}/domains`, label: 'Custom Domains', icon: Globe2 }]
          : []),
        { href: `${dashboardBasePath}/analytics`, label: 'Analytics', icon: BarChart3 },
        ...(userRole !== 'MANAGER'
          ? [{ href: `${dashboardBasePath}/postbacks`, label: 'S2S Postbacks', icon: Webhook }]
          : []),
      ],
    },
    {
      label: 'Workspace',
      items: [
        { href: `${dashboardBasePath}/landing-builder`, label: 'Landing Builder', icon: Layers },
        ...(userRole === 'OWNER'
          ? [{ href: `${dashboardBasePath}/templates`, label: 'Templates', icon: Layers }]
          : []),
      ],
    },
    {
      label: 'Finance',
      items: [{ href: `${dashboardBasePath}/payments`, label: 'Payments', icon: WalletCards }],
    },
    {
      label: 'System',
      items: [{ href: `${dashboardBasePath}/settings`, label: 'Settings', icon: Settings }],
    },
  ]

  if (isMobile === null) {
    return <div className="hidden shrink-0 lg:block lg:w-52" aria-hidden="true" />
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_38%),linear-gradient(135deg,rgba(34,211,238,0.08),transparent_40%,rgba(129,140,248,0.08))]" />
      <div className={`relative flex w-full flex-shrink-0 items-center gap-3 ${isMobile ? 'h-[5.5rem] border-b border-slate-200/50 px-5 dark:border-white/10 bg-gradient-to-b from-slate-50/50 to-transparent dark:from-white/5 dark:to-transparent' : 'h-10 justify-start p-0'}`}>
          {(!collapsed || isMobile) && (
            <div className="relative h-9 w-28 overflow-hidden">
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

      <nav className={`relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain ${isMobile ? 'space-y-4 px-3 py-4' : 'space-y-2 px-2 py-2'}`}>
        {menuGroups.map((group) => group.items.length > 0 && (
          <div key={group.label} className={`space-y-1.5 ${isMobile ? 'pb-2' : ''}`}>
            {(!collapsed || isMobile) && (
              <div className={`${isMobile ? 'px-3 py-1 !bg-transparent text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400' : 'px-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 first:pt-0 dark:text-slate-400'}`}>
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => isMobile && setMobileOpen(false)}
                  className={`group flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-3'} ${isMobile ? 'min-h-12 rounded-lg px-4 py-3 border-0' : 'rounded-lg px-2 py-1.5 border'} transition-all duration-200 ${
                    isActive
                      ? isMobile 
                        ? 'border-0 bg-cyan-500/15 font-medium text-slate-900 shadow-sm dark:text-slate-50'
                        : 'border-cyan-500/25 bg-cyan-500/[0.12] font-medium text-slate-800 dark:text-slate-50'
                      : isMobile
                        ? 'border-0 !bg-transparent text-slate-700 dark:text-slate-300'
                        : 'border-transparent text-slate-600 hover:border-slate-300/70 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:border-white/10 dark:hover:bg-white/[0.06] dark:hover:text-slate-100'
                  }`}
                >
                  <Icon className={`${isMobile ? 'h-5 w-5' : 'h-4 w-4'} shrink-0 transition-all duration-200 ${isActive ? 'text-cyan-400' : isMobile ? 'text-slate-500 dark:text-slate-400' : 'text-slate-500'}`} />
                  {(!collapsed || isMobile) && <span className={`tracking-[0.01em] ${isMobile ? 'text-sm font-medium' : 'text-xs'}`}>{item.label}</span>}
                  {isActive && !collapsed && !isMobile && (
                    <span className="ml-auto h-5 w-0.5 rounded-full bg-cyan-300" />
                  )}
                  {isActive && isMobile && (
                    <span className="ml-auto h-2 w-2 rounded-full bg-cyan-400" />
                  )}
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      <div className={`relative z-10 flex-shrink-0 border-t ${isMobile ? 'border-slate-300/30 dark:border-white/10 space-y-2 px-3 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4' : 'border-white/10 space-y-0.5 px-2 py-2'}`}>
        <button
          onClick={handleLogout}
          className={`w-full group flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2'} ${isMobile ? 'rounded-lg px-4 py-3 min-h-12 border-0' : 'rounded-lg px-2 py-1.5 border border-transparent'} transition-all duration-200 ${isMobile ? 'text-red-600 dark:text-red-300 hover:text-red-700 dark:hover:text-red-200 hover:bg-red-50 dark:hover:bg-red-500/10 font-medium' : 'text-red-400/80 hover:text-red-300 hover:bg-red-500/10 hover:border-red-400/20'}`}
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className={`${collapsed && !isMobile ? 'w-5 h-5' : isMobile ? 'w-5 h-5' : 'w-4 h-4'} transition-transform duration-200 group-hover:scale-110`} />
          {(!collapsed || isMobile) && <span className={`tracking-[0.01em] ${isMobile ? 'text-sm' : 'text-xs'}`}>Logout</span>}
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
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <aside
          className={`panel-bleed fixed inset-x-0 top-0 z-[50] flex h-[100dvh] max-h-[100dvh] w-full flex-col overflow-hidden rounded-b-2xl border-0 border-b border-white/10 bg-[var(--surface-bg)] shadow-2xl transition-[transform,opacity,box-shadow] duration-300 ease-out lg:hidden ${
            mobileOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-90'
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
        onClick={() => setCollapsed(!collapsed)}
        className="edge-toggle fixed right-0 top-0 z-[60] hidden h-11 w-11 items-center justify-center rounded-none border-0 bg-transparent p-0 text-slate-100/80 shadow-none ring-0 lg:flex"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Menu className="w-4 h-4" />
      </button>

      <aside
        className={`panel-bleed sticky top-0 order-last z-[50] hidden h-screen shrink-0 flex-col ${collapsed ? 'w-16' : 'w-52'} overflow-hidden rounded-none border-0 bg-[var(--surface-bg)] ring-0 transition-[width,box-shadow] duration-300 ease-out lg:flex`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}