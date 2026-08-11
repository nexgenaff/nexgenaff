'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AlertTriangle, CheckCircle2, ShieldCheck, Search, UserX, Trash2 } from 'lucide-react'

type ManagerUser = {
  id: string
  username: string
  fullName: string | null
  email: string
  source: string | null
  contractNumber: string | null
  telegramUsername: string | null
  bkashNumber: string | null
  role: string
  status: 'PENDING' | 'ACTIVE' | 'DISABLED' | 'REJECTED'
  createdAt: string
  updatedAt: string
  lastLogin: string | null
}

type ConfirmDialogState = {
  id: string
  title: string
  message: string
  confirmLabel: string
}

const statusStyles: Record<ManagerUser['status'], string> = {
  PENDING: 'bg-amber-500/10 text-amber-300 border border-amber-400/20',
  ACTIVE: 'bg-emerald-500/10 text-emerald-300 border border-emerald-400/20',
  DISABLED: 'bg-slate-500/10 text-slate-300 border border-slate-400/20',
  REJECTED: 'bg-red-500/10 text-red-300 border border-red-400/20',
}

const statusLabels: Record<ManagerUser['status'], string> = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  DISABLED: 'Disabled',
  REJECTED: 'Rejected',
}

const statusFilters: Array<{ label: string; value: 'ALL' | ManagerUser['status'] }> = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Disabled', value: 'DISABLED' },
  { label: 'Rejected', value: 'REJECTED' },
]


function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-white/[0.06] bg-slate-950/30 px-3 py-2.5">
      <div className="text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-600">{label}</div>
      <div className="mt-1 truncate text-xs font-medium text-slate-300">{value}</div>
    </div>
  )
}

function ActionButtons({
  manager,
  isActionLoading,
  updateStatus,
  openDeleteConfirm,
  mobile = false,
}: {
  manager: ManagerUser
  isActionLoading: boolean
  updateStatus: (id: string, status: ManagerUser['status']) => void
  openDeleteConfirm: (manager: ManagerUser) => void
  mobile?: boolean
}) {
  const buttonBase = mobile
    ? 'min-h-10 rounded-xl px-3 text-xs'
    : 'rounded-xl px-2.5 py-1.5 text-xs'

  return (
    <div className={`flex flex-wrap gap-2 ${mobile ? 'sm:grid sm:grid-cols-2' : 'justify-end'}`}>
      {manager.status !== 'ACTIVE' && (
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => updateStatus(manager.id, 'ACTIVE')}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border border-emerald-400/20 bg-emerald-500/10 font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:cursor-wait disabled:opacity-60 ${buttonBase}`}
        >
          <CheckCircle2 className="h-3.5 w-3.5" />
          Approve
        </button>
      )}

      {manager.status !== 'DISABLED' && manager.status !== 'REJECTED' && (
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => updateStatus(manager.id, 'DISABLED')}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border border-slate-400/20 bg-slate-500/10 font-semibold text-slate-200 transition hover:bg-slate-500/20 disabled:cursor-wait disabled:opacity-60 ${buttonBase}`}
        >
          <UserX className="h-3.5 w-3.5" />
          Disable
        </button>
      )}

      {manager.status !== 'PENDING' && manager.status !== 'REJECTED' && (
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => updateStatus(manager.id, 'PENDING')}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border border-amber-400/20 bg-amber-500/10 font-semibold text-amber-200 transition hover:bg-amber-500/20 disabled:cursor-wait disabled:opacity-60 ${buttonBase}`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Pending
        </button>
      )}

      {manager.status !== 'REJECTED' && (
        <button
          type="button"
          disabled={isActionLoading}
          onClick={() => updateStatus(manager.id, 'REJECTED')}
          className={`inline-flex flex-1 items-center justify-center gap-1.5 border border-red-400/20 bg-red-500/10 font-semibold text-red-200 transition hover:bg-red-500/20 disabled:cursor-wait disabled:opacity-60 ${buttonBase}`}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Reject
        </button>
      )}

      <button
        type="button"
        disabled={isActionLoading}
        onClick={() => openDeleteConfirm(manager)}
        className={`inline-flex flex-1 items-center justify-center gap-1.5 border border-red-400/15 bg-red-500/[0.06] font-semibold text-red-300 transition hover:bg-red-500/15 disabled:cursor-wait disabled:opacity-60 ${buttonBase}`}
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
    </div>
  )
}

export default function OwnerManagersPage() {
  const router = useRouter()
  const [managers, setManagers] = useState<ManagerUser[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | ManagerUser['status']>('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialogState | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)

  const summary = useMemo(() => ({
    total: managers.length,
    pending: managers.filter((manager) => manager.status === 'PENDING').length,
    active: managers.filter((manager) => manager.status === 'ACTIVE').length,
    disabled: managers.filter((manager) => manager.status === 'DISABLED').length,
    rejected: managers.filter((manager) => manager.status === 'REJECTED').length,
  }), [managers])

  const filteredManagers = useMemo(() => {
    const term = search.trim().toLowerCase()
    const filteredByStatus = statusFilter === 'ALL'
      ? managers
      : managers.filter((manager) => manager.status === statusFilter)

    if (!term) return filteredByStatus

    return filteredByStatus.filter((manager) =>
      manager.username.toLowerCase().includes(term) ||
      manager.email.toLowerCase().includes(term) ||
      (manager.fullName?.toLowerCase().includes(term) ?? false) ||
      (manager.source?.toLowerCase().includes(term) ?? false) ||
      (manager.contractNumber?.toLowerCase().includes(term) ?? false) ||
      (manager.telegramUsername?.toLowerCase().includes(term) ?? false) ||
      (manager.bkashNumber?.toLowerCase().includes(term) ?? false)
    )
  }, [managers, search, statusFilter])

  const loadManagers = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      setSuccess('')

      const response = await fetch('/api/owner/managers', { credentials: 'include' })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        setError(data?.error || 'Unable to load manager accounts. Please refresh.')
        return
      }

      const data = await response.json()
      setManagers(data.managers || [])
    } catch {
      setError('Unable to load manager accounts. Please refresh or check your access.')
    } finally {
      setLoading(false)
    }
  }, [router])

  useEffect(() => {
    void loadManagers()
  }, [loadManagers])

  const updateStatus = async (id: string, status: ManagerUser['status']) => {
    try {
      setActionLoadingId(id)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/owner/managers/${id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to update manager.' }))
        throw new Error(data.error || 'Failed to update manager.')
      }

      setManagers((current) =>
        current.map((manager) =>
          manager.id === id ? { ...manager, status, updatedAt: new Date().toISOString() } : manager
        )
      )
      setSuccess(`Manager status updated to ${statusLabels[status]}.`)
    } catch (err: any) {
      setError(err.message || 'Failed to update manager status.')
    } finally {
      setActionLoadingId(null)
    }
  }

  const performDelete = async (id: string) => {
    try {
      setActionLoadingId(id)
      setError('')
      setSuccess('')

      const response = await fetch(`/api/owner/managers/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.status === 401 || response.status === 403) {
        router.push('/login')
        return
      }

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Unable to delete manager.' }))
        throw new Error(data.error || 'Unable to delete manager.')
      }

      setManagers((current) => current.filter((manager) => manager.id !== id))
      setSuccess('Manager account deleted successfully.')
    } catch (err: any) {
      setError(err.message || 'Failed to delete manager account.')
    } finally {
      setActionLoadingId(null)
      setConfirmDialog(null)
    }
  }

  const openDeleteConfirm = (manager: ManagerUser) => {
    setConfirmDialog({
      id: manager.id,
      title: `Delete ${manager.username}?`,
      message: `This will permanently remove the manager account for ${manager.email}. This action cannot be undone.`,
      confirmLabel: 'Delete manager',
    })
  }

  const handleRefresh = () => {
    void loadManagers()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05080d] px-3 py-4 text-white sm:px-5 sm:py-6">
        <div className="mx-auto max-w-7xl">
          <div className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl">
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400" />
            <div className="space-y-5 p-5 sm:p-8">
              <div className="h-6 w-40 animate-pulse rounded-lg bg-white/[0.08]" />
              <div className="h-10 w-72 max-w-full animate-pulse rounded-xl bg-white/[0.08]" />
              <div className="h-4 w-full max-w-xl animate-pulse rounded bg-white/[0.06]" />
              <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="h-24 animate-pulse rounded-2xl bg-white/[0.05]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const statCards = [
    { label: 'Total managers', value: summary.total, icon: ShieldCheck, accent: 'text-indigo-300', iconBg: 'bg-indigo-500/10 border-indigo-400/15' },
    { label: 'Pending review', value: summary.pending, icon: AlertTriangle, accent: 'text-amber-300', iconBg: 'bg-amber-500/10 border-amber-400/15' },
    { label: 'Active', value: summary.active, icon: CheckCircle2, accent: 'text-emerald-300', iconBg: 'bg-emerald-500/10 border-emerald-400/15' },
    { label: 'Disabled', value: summary.disabled + summary.rejected, icon: UserX, accent: 'text-slate-300', iconBg: 'bg-slate-500/10 border-slate-400/15' },
  ]

  return (
    <div className="min-h-screen bg-[#05080d] px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4 sm:space-y-5">
        {/* Header */}
        <section className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-2xl shadow-black/20 backdrop-blur-xl">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/70 to-transparent" />
          <div className="absolute -right-24 -top-28 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-violet-500/[0.06] blur-3xl" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-indigo-200 sm:text-xs">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Owner control center
                </div>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                  Manager approvals
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Review registrations, approve access, and manage the status of your manager accounts.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center">
                <div className="rounded-2xl border border-amber-400/15 bg-amber-500/[0.07] px-3 py-2.5 sm:min-w-[150px] sm:px-4">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-300/80">Needs review</div>
                  <div className="mt-1 text-lg font-bold text-white">{summary.pending}</div>
                </div>

                <button
                  type="button"
                  onClick={handleRefresh}
                  className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/60 px-4 text-sm font-semibold text-slate-200 transition hover:border-indigo-400/30 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 active:scale-[0.98]"
                >
                  Refresh list
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((item) => {
            const Icon = item.icon
            return (
              <div
                key={item.label}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4 shadow-lg shadow-black/10 backdrop-blur-xl sm:rounded-3xl sm:p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
                      {item.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">{item.value}</p>
                  </div>
                  <div className={`rounded-xl border p-2 ${item.iconBg}`}>
                    <Icon className={`h-4 w-4 ${item.accent}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </section>

        {/* Search + filters */}
        <section className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-3 shadow-xl shadow-black/10 backdrop-blur-xl sm:p-4">
          <div className="flex flex-col gap-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search username, email, Telegram..."
                aria-label="Search managers"
                className="min-h-11 w-full rounded-2xl border border-white/10 bg-slate-950/60 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400/40 focus:ring-2 focus:ring-indigo-500/10"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {statusFilters.map((filter) => {
                const count = filter.value === 'ALL'
                  ? summary.total
                  : summary[filter.value.toLowerCase() as 'pending' | 'active' | 'disabled' | 'rejected']

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setStatusFilter(filter.value)}
                    className={`inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl border px-3 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-400/20 sm:text-sm ${
                      statusFilter === filter.value
                        ? 'border-indigo-400/30 bg-indigo-500/15 text-white shadow-sm shadow-indigo-950/40'
                        : 'border-white/10 bg-slate-950/50 text-slate-400 hover:border-white/15 hover:text-slate-200'
                    }`}
                  >
                    {filter.label}
                    <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${
                      statusFilter === filter.value ? 'bg-white/10 text-white' : 'bg-white/[0.05] text-slate-500'
                    }`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs text-slate-500">
              <span>Manager accounts</span>
              <span className="font-medium text-slate-300">
                {filteredManagers.length} <span className="text-slate-600">/</span> {managers.length}
              </span>
            </div>
          </div>
        </section>

        {error && (
          <div role="alert" className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/[0.08] p-4 text-sm text-red-200">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div role="status" className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.08] p-4 text-sm text-emerald-200">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Desktop table */}
        <section className="hidden overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-xl shadow-black/10 backdrop-blur-xl md:block">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full text-left text-sm">
              <thead className="border-b border-white/[0.07] bg-slate-950/50 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                <tr>
                  <th className="px-5 py-4">Manager</th>
                  <th className="px-5 py-4">Email</th>
                  <th className="px-5 py-4">Details</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredManagers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
                          <Search className="h-5 w-5 text-slate-500" />
                        </div>
                        <p className="mt-3 font-semibold text-slate-200">No managers found</p>
                        <p className="mt-1 text-sm text-slate-500">Try another search term or status filter.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredManagers.map((manager) => {
                    const isActionLoading = actionLoadingId === manager.id

                    return (
                      <tr key={manager.id} className="border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02]">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/10 text-sm font-bold text-indigo-200">
                              {manager.username.slice(0, 1).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-white">{manager.username}</div>
                              <div className="mt-0.5 text-xs text-slate-500">{manager.fullName ?? 'No name provided'}</div>
                            </div>
                          </div>
                        </td>

                        <td className="max-w-[240px] px-5 py-4 text-slate-300">
                          <div className="truncate">{manager.email}</div>
                          <div className="mt-1 text-xs text-slate-500">{manager.source ?? 'No source'}</div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1 text-xs text-slate-400">
                            <div><span className="text-slate-600">Contract:</span> {manager.contractNumber ?? '-'}</div>
                            <div><span className="text-slate-600">Telegram:</span> {manager.telegramUsername ? `@${manager.telegramUsername.replace(/^@/, '')}` : '-'}</div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {manager.bkashNumber ?? <span className="text-slate-600">Not added</span>}
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[manager.status]}`}>
                            {statusLabels[manager.status]}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <ActionButtons
                            manager={manager}
                            isActionLoading={isActionLoading}
                            updateStatus={updateStatus}
                            openDeleteConfirm={openDeleteConfirm}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Mobile cards */}
        <section className="space-y-3 md:hidden">
          {filteredManagers.length === 0 ? (
            <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-10 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 font-semibold text-slate-200">No managers found</p>
              <p className="mt-1 text-sm text-slate-500">Try another search or filter.</p>
            </div>
          ) : (
            filteredManagers.map((manager) => {
              const isActionLoading = actionLoadingId === manager.id

              return (
                <article
                  key={manager.id}
                  className="overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] shadow-xl shadow-black/10"
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-indigo-400/15 bg-indigo-500/10 font-bold text-indigo-200">
                        {manager.username.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate font-semibold text-white">{manager.username}</h2>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyles[manager.status]}`}>
                            {statusLabels[manager.status]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-slate-500">{manager.email}</p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <InfoItem label="Full name" value={manager.fullName ?? '-'} />
                      <InfoItem label="Source" value={manager.source ?? '-'} />
                      <InfoItem label="Contract" value={manager.contractNumber ?? '-'} />
                      <InfoItem
                        label="Telegram"
                        value={manager.telegramUsername ? `@${manager.telegramUsername.replace(/^@/, '')}` : '-'}
                      />
                      <InfoItem label="bKash" value={manager.bkashNumber ?? '-'} />
                      <InfoItem label="Created" value={new Date(manager.createdAt).toLocaleDateString()} />
                    </div>

                    <div className="mt-4 border-t border-white/[0.06] pt-3">
                      <ActionButtons
                        manager={manager}
                        isActionLoading={isActionLoading}
                        updateStatus={updateStatus}
                        openDeleteConfirm={openDeleteConfirm}
                        mobile
                      />
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </section>
      </div>

      {confirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center sm:p-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-dialog-title"
        >
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#090d14] p-5 shadow-2xl shadow-black/60 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="rounded-xl border border-red-400/15 bg-red-500/10 p-2.5">
                <Trash2 className="h-5 w-5 text-red-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-red-300">Permanent action</p>
                <h2 id="confirm-dialog-title" className="mt-1 text-xl font-bold text-white">{confirmDialog.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                Close
              </button>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-400">{confirmDialog.message}</p>

            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="min-h-11 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-semibold text-slate-300 transition hover:bg-white/[0.07]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => performDelete(confirmDialog.id)}
                disabled={actionLoadingId === confirmDialog.id}
                className="min-h-11 rounded-xl bg-red-500 px-4 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-wait disabled:opacity-60"
              >
                {actionLoadingId === confirmDialog.id ? 'Deleting…' : confirmDialog.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
