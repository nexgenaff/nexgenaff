'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Search, Plus, MousePointerClick, Users, Bot, Globe2, Link2, Sparkles, ShieldCheck, Copy, Check, Pencil, RotateCcw, Trash2, X } from 'lucide-react'
import { formatNumber } from '@/lib/utils/helpers'

interface LinkAccount {
  id: string
  accountName: string
  slug: string
  totalClicks: number
  uniqueClicks: number
  botClicks: number
  createdAt: string
  isActive: boolean
  offerGroupName: string | null
  customDomain: { domain: string } | null
  customDomainId?: string | null
  publicDashboard: { publicId: string } | null
}

interface DomainOption {
  id: string
  domain: string
  verified: boolean
  isActive: boolean
}

const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin.replace(/\/$/, '')
  }

  return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
}

export default function LinksPage() {
  const router = useRouter()
  const [links, setLinks] = useState<LinkAccount[]>([])
  const [domains, setDomains] = useState<DomainOption[]>([])
  const [offerGroups, setOfferGroups] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [showBulkEditor, setShowBulkEditor] = useState(false)
  const [bulkCustomDomainId, setBulkCustomDomainId] = useState('')
  const [bulkOfferGroupName, setBulkOfferGroupName] = useState('')
  const [bulkIsActive, setBulkIsActive] = useState(true)
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null)
  const [editingAccountName, setEditingAccountName] = useState('')
  const [editingSlug, setEditingSlug] = useState('')
  const [editingCustomDomainId, setEditingCustomDomainId] = useState('')
  const [editingOfferGroupName, setEditingOfferGroupName] = useState('')
  const [editingIsActive, setEditingIsActive] = useState(true)
  const [savingLinkId, setSavingLinkId] = useState<string | null>(null)
  const [busyLinkId, setBusyLinkId] = useState<string | null>(null)

  const fetchLinks = useCallback(async () => {
    try {
      const response = await fetch('/api/links')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setLinks(data)
    } catch (error) {
      console.error('Failed to fetch links:', error)
    }
  }, [router])

  const fetchDomains = useCallback(async () => {
    try {
      const response = await fetch('/api/domains')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setDomains(data)
    } catch (error) {
      console.error('Failed to fetch domains:', error)
    }
  }, [router])

  const fetchOfferGroups = useCallback(async () => {
    try {
      const response = await fetch('/api/offers')
      if (response.status === 401) {
        router.push('/login')
        return
      }

      const data = await response.json()
      const groups = Array.from(
        new Set(
          (data as Array<{ groupName: string | null }>).map((offer) => offer.groupName?.trim()).filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b))

      setOfferGroups(groups)
    } catch (error) {
      console.error('Failed to fetch offer groups:', error)
    }
  }, [router])

  useEffect(() => {
    void (async () => {
      await Promise.all([fetchLinks(), fetchDomains(), fetchOfferGroups()])
      setLoading(false)
    })()
  }, [fetchLinks, fetchDomains, fetchOfferGroups])

  const filteredLinks = links
    .filter((link) => {
      const haystack = `${link.accountName} ${link.slug} ${link.offerGroupName || ''}`.toLowerCase()
      return haystack.includes(search.toLowerCase())
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const activeLinks = links.filter((link) => link.isActive).length
  const totalClicks = links.reduce((sum, link) => sum + link.totalClicks, 0)
  const uniqueClicks = links.reduce((sum, link) => sum + link.uniqueClicks, 0)
  const botClicks = links.reduce((sum, link) => sum + link.botClicks, 0)

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive)

  const getPreviewUrl = (link: LinkAccount) => {
    const baseUrl = link.customDomain?.domain ? `https://${link.customDomain.domain}` : getBaseUrl()
    return `${baseUrl}/${link.slug}`
  }

  const getPublicStatsUrl = (link: LinkAccount) => `${getBaseUrl()}/stats/${link.publicDashboard?.publicId ?? ''}`

  const toggleSelectedId = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    )
  }

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredLinks.map((link) => link.id)
    const allVisibleSelected = visibleIds.every((id) => selectedIds.includes(id))

    setSelectedIds((current) => {
      if (allVisibleSelected) {
        return current.filter((id) => !visibleIds.includes(id))
      }

      return Array.from(new Set([...current, ...visibleIds]))
    })
  }

  const openEdit = (link: LinkAccount) => {
    setActionError('')
    setActionMessage('')
    setEditingLinkId(link.id)
    setEditingAccountName(link.accountName)
    setEditingSlug(link.slug)
    setEditingCustomDomainId(link.customDomainId ?? '')
    setEditingOfferGroupName(link.offerGroupName ?? '')
    setEditingIsActive(link.isActive)
  }

  const closeEdit = () => {
    setEditingLinkId(null)
    setEditingAccountName('')
    setEditingSlug('')
    setEditingCustomDomainId('')
    setEditingOfferGroupName('')
    setEditingIsActive(true)
  }

  const handleSaveEdit = async () => {
    if (!editingLinkId) return

    setActionError('')
    setActionMessage('')
    setSavingLinkId(editingLinkId)

    try {
      const response = await fetch(`/api/links/${editingLinkId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName: editingAccountName.trim(),
          slug: editingSlug.trim().toLowerCase().replace(/\s+/g, '-'),
          customDomainId: editingCustomDomainId || null,
          offerGroupName: editingOfferGroupName.trim() || null,
          isActive: editingIsActive,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update link')
      }

      setActionMessage(`Link “${data.accountName}” was updated successfully.`)
      closeEdit()
      await fetchLinks()
    } catch (error) {
      console.error('Error updating link:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to update link')
    } finally {
      setSavingLinkId(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this link account?')) return

    setActionError('')
    setActionMessage('')
    setBusyLinkId(id)

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'DELETE',
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete link')
      }

      setActionMessage('Link account deleted successfully.')
      await fetchLinks()
    } catch (error) {
      console.error('Error deleting link:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to delete link')
    } finally {
      setBusyLinkId(null)
    }
  }

  const handleReset = async (id: string) => {
    if (!confirm('Reset this link’s stats and click history? This will clear the recorded totals for this account.')) return

    setActionError('')
    setActionMessage('')
    setBusyLinkId(id)

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to reset link')
      }

      setActionMessage('Link statistics have been reset successfully.')
      await fetchLinks()
    } catch (error) {
      console.error('Error resetting link:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to reset link')
    } finally {
      setBusyLinkId(null)
    }
  }

  const handleBulkReset = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Reset stats for ${selectedIds.length} selected link account(s)?`)) return

    setActionError('')
    setActionMessage('')
    setBusyLinkId('bulk-reset')

    try {
      const response = await fetch('/api/links/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', ids: selectedIds }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to reset selected links')
      }

      setSelectedIds([])
      setActionMessage(`Reset ${data?.resetCount ?? selectedIds.length} link account(s) successfully.`)
      await fetchLinks()
    } catch (error) {
      console.error('Error resetting selected links:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to reset selected links')
    } finally {
      setBusyLinkId(null)
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} selected link account(s)?`)) return

    setActionError('')
    setActionMessage('')
    setBusyLinkId('bulk-delete')

    try {
      const response = await fetch('/api/links/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: selectedIds }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to delete selected links')
      }

      setSelectedIds([])
      setActionMessage(`Deleted ${data?.deletedCount ?? selectedIds.length} link account(s) successfully.`)
      await fetchLinks()
    } catch (error) {
      console.error('Error deleting selected links:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to delete selected links')
    } finally {
      setBusyLinkId(null)
    }
  }

  const handleBulkUpdate = async () => {
    if (selectedIds.length === 0) return

    setActionError('')
    setActionMessage('')
    setBusyLinkId('bulk-update')

    try {
      const response = await fetch('/api/links/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update',
          ids: selectedIds,
          customDomainId: bulkCustomDomainId || null,
          offerGroupName: bulkOfferGroupName.trim() || null,
          isActive: bulkIsActive,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || 'Failed to update selected links')
      }

      setSelectedIds([])
      setShowBulkEditor(false)
      setBulkCustomDomainId('')
      setBulkOfferGroupName('')
      setBulkIsActive(true)
      setActionMessage(`Updated ${data?.updatedCount ?? selectedIds.length} link account(s) successfully.`)
      await fetchLinks()
    } catch (error) {
      console.error('Error updating selected links:', error)
      setActionError(error instanceof Error ? error.message : 'Failed to update selected links')
    } finally {
      setBusyLinkId(null)
    }
  }

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1600)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          <p className="mt-4 animate-pulse text-white/40">Loading link accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {(actionError || actionMessage) && (
        <div className={`rounded-2xl border p-3 text-sm backdrop-blur ${actionError ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'}`}>
          {actionError || actionMessage}
        </div>
      )}

      {selectedIds.length > 0 && (
        <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.8))] p-4 backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Bulk actions</div>
              <div className="mt-1 text-sm text-white/75">{selectedIds.length} link account(s) selected</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowBulkEditor((current) => !current)} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
                {showBulkEditor ? 'Hide editor' : 'Bulk edit'}
              </button>
              <button type="button" onClick={handleBulkReset} disabled={busyLinkId === 'bulk-reset'} className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-300 transition hover:bg-amber-500/15 disabled:opacity-60">
                {busyLinkId === 'bulk-reset' ? 'Resetting...' : 'Bulk reset'}
              </button>
              <button type="button" onClick={handleBulkDelete} disabled={busyLinkId === 'bulk-delete'} className="rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-60">
                {busyLinkId === 'bulk-delete' ? 'Deleting...' : 'Bulk delete'}
              </button>
            </div>
          </div>

          {showBulkEditor && (
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div>
                <label className="form-label">Custom Domain</label>
                <select value={bulkCustomDomainId} onChange={(e) => setBulkCustomDomainId(e.target.value)} className="form-select">
                  <option value="">Keep current domain</option>
                  {selectableDomains.map((domain) => (
                    <option key={domain.id} value={domain.id}>{domain.domain}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Offer Group</label>
                <select value={bulkOfferGroupName} onChange={(e) => setBulkOfferGroupName(e.target.value)} className="form-select">
                  <option value="">Keep current offer pool</option>
                  {offerGroups.map((group) => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Status</label>
                <select value={bulkIsActive ? 'active' : 'paused'} onChange={(e) => setBulkIsActive(e.target.value === 'active')} className="form-select">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                </select>
              </div>

              <div className="md:col-span-3">
                <button type="button" onClick={handleBulkUpdate} disabled={busyLinkId === 'bulk-update'} className="rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
                  {busyLinkId === 'bulk-update' ? 'Applying...' : 'Apply bulk update'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {editingLinkId && (
        <div className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.12),rgba(15,23,42,0.8))] p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">Edit link account</div>
              <h2 className="mt-1 text-lg font-semibold text-white">Update routing details</h2>
            </div>
            <button type="button" onClick={closeEdit} className="rounded-lg border border-white/10 bg-white/5 p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="form-label">Account Name</label>
              <input value={editingAccountName} onChange={(e) => setEditingAccountName(e.target.value)} className="form-input" />
            </div>
            <div>
              <label className="form-label">Slug</label>
              <input value={editingSlug} onChange={(e) => setEditingSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))} className="form-input" />
            </div>
            <div>
              <label className="form-label">Custom Domain</label>
              <select value={editingCustomDomainId} onChange={(e) => setEditingCustomDomainId(e.target.value)} className="form-select">
                <option value="">Use default domain</option>
                {selectableDomains.map((domain) => (
                  <option key={domain.id} value={domain.id}>{domain.domain}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Offer Group</label>
              <select value={editingOfferGroupName} onChange={(e) => setEditingOfferGroupName(e.target.value)} className="form-select">
                <option value="">Default routing mode</option>
                {offerGroups.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="form-label">Status</label>
              <select value={editingIsActive ? 'active' : 'paused'} onChange={(e) => setEditingIsActive(e.target.value === 'active')} className="form-select">
                <option value="active">Active</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button type="button" onClick={handleSaveEdit} disabled={savingLinkId === editingLinkId} className="rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
              {savingLinkId === editingLinkId ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={closeEdit} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white">
              Cancel
            </button>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex flex-col gap-4 rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <div className="mb-2 flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em]">Link control center</span>
          </div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">All Link Accounts</h1>
          <p className="mt-1 text-sm text-white/35">Monitor, preview, and route every smart tracking link from one clean workspace.</p>
        </div>

        <Link
          href="/admin/links/create"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_32px_rgba(99,102,241,0.35)] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create New Link
        </Link>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Active links</div>
          <div className="mt-2 text-2xl font-semibold text-white">{activeLinks}</div>
          <div className="text-xs text-white/40">Live tracking campaigns</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Total clicks</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatNumber(totalClicks)}</div>
          <div className="text-xs text-white/40">All recorded traffic</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Unique visitors</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatNumber(uniqueClicks)}</div>
          <div className="text-xs text-white/40">Real audience reach</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
          <div className="text-[11px] uppercase tracking-[0.24em] text-white/35">Bot traffic</div>
          <div className="mt-2 text-2xl font-semibold text-white">{formatNumber(botClicks)}</div>
          <div className="text-xs text-white/40">Filtered and posted</div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20" />
            <input
              type="text"
              placeholder="Search by account name, slug, or routing pool..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950/60 py-3 pl-12 pr-4 text-white placeholder:text-white/20 focus:border-cyan-400/40 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={toggleSelectAllVisible} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
              {filteredLinks.length > 0 && filteredLinks.every((link) => selectedIds.includes(link.id)) ? 'Clear selected' : 'Select visible'}
            </button>
          </div>
        </div>
      </div>

      {filteredLinks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-12 text-center backdrop-blur-xl">
          <div className="mb-4 text-5xl">📭</div>
          <div className="text-xl font-semibold text-white">No links match your search</div>
          <p className="mt-2 text-sm text-white/35">Create your first smart tracking link to start routing campaigns.</p>
          <Link
            href="/admin/links/create"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            Create your first link →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLinks.map((link, index) => (
            <motion.article
              key={link.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04, duration: 0.28, ease: 'easeOut' }}
              whileHover={{ y: -2 }}
              className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-4 backdrop-blur-xl sm:p-5"
            >
              <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-white/75">
                      <input type="checkbox" checked={selectedIds.includes(link.id)} onChange={() => toggleSelectedId(link.id)} className="h-3.5 w-3.5 accent-cyan-400" />
                      Mark
                    </label>
                    <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
                      <Sparkles className="h-3.5 w-3.5" />
                      {link.isActive ? 'Live' : 'Paused'}
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-white/70">
                      {link.customDomain?.domain ? 'Custom domain' : 'Default domain'}
                    </span>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{link.accountName}</h3>
                    <span className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1 text-[11px] text-white/55">
                      {link.offerGroupName ? `Pool: ${link.offerGroupName}` : 'Default smart routing'}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/45">
                          <Link2 className="h-3.5 w-3.5" />
                          Tracking URL
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(getPreviewUrl(link), `tracking-${link.id}`)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                          {copiedKey === `tracking-${link.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="mt-2 break-all font-mono text-sm text-indigo-300">{getPreviewUrl(link)}</div>
                    </div>

                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-300">
                          <Globe2 className="h-3.5 w-3.5" />
                          Public Stats
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(getPublicStatsUrl(link), `stats-${link.id}`)}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                        >
                          {copiedKey === `stats-${link.id}` ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="mt-2 break-all font-mono text-sm text-emerald-300">{getPublicStatsUrl(link)}</div>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/40">
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      <Globe2 className="h-3.5 w-3.5" />
                      /{link.slug}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2.5 py-1">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Created {new Date(link.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 xl:w-[360px]">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.24em] text-white/35">
                      <MousePointerClick className="h-3.5 w-3.5" />
                      Total
                    </div>
                    <div className="mt-2 text-xl font-bold text-indigo-400">{formatNumber(link.totalClicks)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.24em] text-white/35">
                      <Users className="h-3.5 w-3.5" />
                      Unique
                    </div>
                    <div className="mt-2 text-xl font-bold text-emerald-400">{formatNumber(link.uniqueClicks)}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3 text-center">
                    <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-[0.24em] text-white/35">
                      <Bot className="h-3.5 w-3.5" />
                      Bots
                    </div>
                    <div className="mt-2 text-xl font-bold text-rose-400">{formatNumber(link.botClicks)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 xl:justify-end">
                  <button type="button" onClick={() => openEdit(link)} className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit
                  </button>
                  <button type="button" onClick={() => handleReset(link.id)} disabled={busyLinkId === link.id} className="inline-flex items-center gap-1 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs font-medium text-amber-300 transition hover:bg-amber-500/15 disabled:opacity-60">
                    <RotateCcw className="h-3.5 w-3.5" />
                    {busyLinkId === link.id ? 'Resetting...' : 'Reset'}
                  </button>
                  <button type="button" onClick={() => handleDelete(link.id)} disabled={busyLinkId === link.id} className="inline-flex items-center gap-1 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/15 disabled:opacity-60">
                    <Trash2 className="h-3.5 w-3.5" />
                    {busyLinkId === link.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}