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
  ShieldCheck,
  Layers,
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
    { href: '/admin/links/create', label: 'Create Link', icon: Plus },
    { href: '/admin/links/create-turbo', label: 'Create Link - Turbo', icon: Plus },
    { href: '/admin/links', label: 'All Links', icon: Link2 },
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
    <>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.2),transparent_36%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.16),transparent_38%),linear-gradient(135deg,rgba(34,211,238,0.08),transparent_40%,rgba(129,140,248,0.08))]" />
      <div className="relative flex items-center justify-start p-0 w-full gap-2">
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex h-6 w-6 items-center justify-center rounded-lg border border-transparent bg-white/5 text-red-400/90 transition hover:border-red-400/20 hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut className="w-3 h-3" />
        </button>
        {!collapsed && (
          <div className="relative h-12 flex-1 overflow-hidden">
            <Image
              src="/afficixo.png"
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
          className="relative z-10 hidden lg:flex items-center justify-center p-1.5 mx-3 mt-2 rounded-lg border border-white/10 bg-white/[0.04] text-slate-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan-400/20 hover:bg-cyan-400/10 hover:text-cyan-200"
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
              className={`group flex items-center ${collapsed && !isMobile ? 'justify-center' : 'gap-2.5'} px-2.5 py-2.5 rounded-2xl border border-transparent transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/15 via-cyan-500/10 to-violet-500/10 border-cyan-400/25 text-slate-50 font-medium shadow-[0_12px_30px_rgba(34,211,238,0.12)]'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] hover:border-white/10 hover:-translate-y-0.5 hover:shadow-[0_10px_24px_rgba(2,6,23,0.16)]'
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

      <div className="relative z-10 px-3 py-3 border-t border-white/10" />
    </>
  )

  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="edge-toggle fixed top-0 right-0 z-[60] h-11 w-11 flex items-center justify-center rounded-none border-0 bg-transparent p-0 text-slate-100/80 shadow-none ring-0 md:hidden"
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
          className={`panel-bleed fixed top-0 right-0 bottom-0 z-[50] flex flex-col w-60 h-screen overflow-hidden rounded-none border-0 transition-[transform,opacity,box-shadow] duration-300 ease-out lg:hidden ${
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
        className="edge-toggle fixed right-0 top-0 z-[60] hidden md:flex h-11 w-11 items-center justify-center rounded-none border-0 bg-transparent p-0 text-slate-100/80 shadow-none ring-0"
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
        className={`panel-bleed fixed right-0 top-0 bottom-0 z-[50] hidden md:flex flex-col ${collapsed ? 'w-20' : 'w-60'} h-screen overflow-hidden rounded-none border-0 ring-0 transition-[transform,opacity,box-shadow] duration-300 ease-out ${popupOpen ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0 pointer-events-none'}`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}