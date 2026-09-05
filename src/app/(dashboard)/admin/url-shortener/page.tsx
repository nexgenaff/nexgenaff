'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Check, Copy, Dices, Link2, Plus, Trash2 } from 'lucide-react'

type ShortUrl = {
  id: string
  subdomain: string
  trackingUrl: string
  userId: string
  totalClicks: number
  createdAt: string
}

const shortUrlDomain = 'weebly.pro'

export default function UrlShortenerPage() {
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([])
  const [shortUrlBase, setShortUrlBase] = useState(`https://${shortUrlDomain}`)
  const [subdomain, setSubdomain] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [filterText, setFilterText] = useState('')
  const [userFilter, setUserFilter] = useState('all')
  const [isOwnerRoute, setIsOwnerRoute] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)

  const getShortUrl = (subdomain: string) => {
    const url = new URL(shortUrlBase)
    url.hostname = `${subdomain}.${url.hostname}`
    return url.toString().replace(/\/$/, '')
  }

  const loadShortUrls = async () => {
    const response = await fetch('/api/url-shortener', { credentials: 'include' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load short URLs')
    const pages = data as ShortUrl[]
    setShortUrls(pages)
  }

  useEffect(() => {
    setIsOwnerRoute(window.location.pathname.startsWith('/owner/'))
    if (window.location.hostname === 'localhost' || window.location.hostname.startsWith('127.')) {
      setShortUrlBase(`${window.location.protocol}//localhost:${window.location.port || '3000'}`)
    }
    loadShortUrls().catch((reason) => setError(reason instanceof Error ? reason.message : 'Unable to load short URLs')).finally(() => setLoading(false))
  }, [])

  const createShortUrl = async (event: FormEvent) => {
    event.preventDefault()
    try {
      const hostname = new URL(trackingUrl).hostname.toLowerCase().replace(/\.$/, '')
      if (hostname === 'weebly.pro' || hostname.endsWith('.weebly.pro')) {
        setError('weebly.pro URLs cannot be used as short URL destinations.')
        return
      }
    } catch {
      setError('Enter a valid destination URL')
      return
    }

    setSaving(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/url-shortener', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ subdomain, trackingUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to create short URL')
      setShortUrls((current) => [data, ...current])
      setSubdomain('')
      setTrackingUrl('')
      setMessage('Short URL created')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Failed to create short URL')
    } finally {
      setSaving(false)
    }
  }

  const copyUrl = async (shortUrl: ShortUrl) => {
    try {
      await navigator.clipboard.writeText(getShortUrl(shortUrl.subdomain))
      setMessage('Short URL copied')
    } catch {
      setError('Unable to copy the short URL')
    }
  }

  const generateShortCode = () => {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const code = Array.from({ length: 6 }, () => characters[Math.floor(Math.random() * characters.length)]).join('')
    setSubdomain(code)
  }

  const deleteUrl = async (id: string) => {
    const response = await fetch(`/api/url-shortener/${id}`, { method: 'DELETE', credentials: 'include' })
    if (response.ok) {
      setShortUrls((current) => current.filter((shortUrl) => shortUrl.id !== id))
      setSelectedIds((current) => current.filter((selectedId) => selectedId !== id))
      setConfirmDeleteId(null)
    } else {
      const data = await response.json().catch(() => null)
      setError(data?.error || 'Failed to delete short URL')
    }
  }

  const filteredShortUrls = shortUrls.filter((shortUrl) => {
    const query = filterText.trim().toLowerCase()
    const matchesUser = userFilter === 'all' || shortUrl.userId === userFilter
    return matchesUser && (!query || `${shortUrl.subdomain} ${shortUrl.trackingUrl}`.toLowerCase().includes(query))
  })
  const userOptions = [...new Set(shortUrls.map((shortUrl) => shortUrl.userId).filter(Boolean))]
  const allVisibleSelected = filteredShortUrls.length > 0 && filteredShortUrls.every((shortUrl) => selectedIds.includes(shortUrl.id))

  const toggleAllVisible = () => {
    setSelectedIds((current) => allVisibleSelected
      ? current.filter((id) => !filteredShortUrls.some((shortUrl) => shortUrl.id === id))
      : [...new Set([...current, ...filteredShortUrls.map((shortUrl) => shortUrl.id)])])
  }

  const copySelected = async () => {
    const selectedUrls = shortUrls.filter((shortUrl) => selectedIds.includes(shortUrl.id))
    try {
      await navigator.clipboard.writeText(selectedUrls.map((shortUrl) => getShortUrl(shortUrl.subdomain)).join('\n'))
      setMessage(`${selectedUrls.length} short URL${selectedUrls.length === 1 ? '' : 's'} copied`)
    } catch {
      setError('Unable to copy the selected short URLs')
    }
  }

  return (
    <main className="min-h-screen bg-[var(--page-bg)] px-4 py-6 text-[var(--text-primary)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-start gap-3">
          <div className="rounded-lg bg-cyan-500/15 p-2 text-cyan-500"><Link2 className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">URL Shortener</h1>
          </div>
        </div>

        {message && <div role="status" aria-live="polite" className="mb-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-700"><Check className="h-4 w-4" />{message}</div>}
        {error && <div role="alert" aria-live="assertive" className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">{error}</div>}

        <form onSubmit={createShortUrl} className="mb-8 grid gap-4 rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 md:grid-cols-[0.8fr_1.5fr_auto] md:items-end">
          <label className="block text-sm font-medium">Short name
            <div className="mt-2 flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-950">
              <input required value={subdomain} onChange={(event) => setSubdomain(event.target.value)} pattern="[a-zA-Z0-9]+([a-zA-Z0-9-]*[a-zA-Z0-9])?" minLength={3} maxLength={63} className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
              <button type="button" onClick={generateShortCode} title="Generate six-character code" aria-label="Generate six-character code" className="ml-2 rounded-md p-1 text-slate-500 transition-colors hover:bg-cyan-500/10 hover:text-cyan-600"><Dices className="h-4 w-4" /></button>
              <span className="text-xs text-slate-500">.weebly.pro</span>
            </div>
          </label>
          <label className="block text-sm font-medium">Destination URL
            <input required type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" />
          </label>
          <button disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"><Plus className="h-4 w-4" />{saving ? 'Creating...' : 'Create short URL'}</button>
        </form>

        <section>
          <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Short URLs</h2>
            <div className="flex flex-wrap gap-2">
              <input value={filterText} onChange={(event) => setFilterText(event.target.value)} placeholder="Filter short URLs" aria-label="Filter short URLs" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950" />
              {isOwnerRoute && <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)} aria-label="Filter by user" className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-700 dark:bg-slate-950">
                <option value="all">All users</option>
                {userOptions.map((userId) => <option key={userId} value={userId}>{userId}</option>)}
              </select>}
              <button type="button" onClick={toggleAllVisible} disabled={filteredShortUrls.length === 0} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium disabled:opacity-50 dark:border-slate-700">{allVisibleSelected ? 'Clear visible' : 'Select visible'}</button>
              {selectedIds.length > 0 && <button type="button" onClick={copySelected} className="inline-flex items-center gap-1 rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-medium text-cyan-700 dark:text-cyan-300"><Copy className="h-3.5 w-3.5" />Copy selected ({selectedIds.length})</button>}
            </div>
          </div>
          {loading ? <p className="text-sm text-slate-500">Loading...</p> : shortUrls.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">No short URLs yet.</div> : filteredShortUrls.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center text-sm text-slate-500 dark:border-slate-700">No short URLs match this filter.</div> : <div className="space-y-3">{filteredShortUrls.map((shortUrl) => <article key={shortUrl.id} className="grid gap-3 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"><div className="flex min-w-0 items-start gap-3"><input type="checkbox" checked={selectedIds.includes(shortUrl.id)} onChange={() => setSelectedIds((current) => current.includes(shortUrl.id) ? current.filter((id) => id !== shortUrl.id) : [...current, shortUrl.id])} aria-label={`Select ${shortUrl.subdomain}`} className="mt-1 h-4 w-4 accent-cyan-600" /><div className="min-w-0"><a href={getShortUrl(shortUrl.subdomain)} target="_blank" rel="noreferrer" className="font-mono text-sm font-semibold text-cyan-700 hover:underline dark:text-cyan-300">{getShortUrl(shortUrl.subdomain).replace(/^https?:\/\//, '')}</a><p className="mt-1 truncate text-xs text-slate-500">{shortUrl.trackingUrl}</p><p className="mt-1 text-xs text-slate-400">{shortUrl.totalClicks} clicks</p></div></div><div className="flex gap-2"><button onClick={() => copyUrl(shortUrl)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-medium dark:border-slate-700"><Copy className="h-3.5 w-3.5" />Copy</button><button onClick={() => setConfirmDeleteId(shortUrl.id)} className="rounded-md border border-red-300 p-2 text-red-600 dark:border-red-900/50"><Trash2 className="h-3.5 w-3.5" /></button></div>{confirmDeleteId === shortUrl.id && <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 sm:col-span-2 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300"><span>Delete this short URL? This cannot be undone.</span><div className="flex gap-2"><button type="button" onClick={() => setConfirmDeleteId(null)} className="rounded-md border border-slate-300 px-2 py-1 text-slate-600 dark:border-slate-700 dark:text-slate-300">Cancel</button><button type="button" onClick={() => deleteUrl(shortUrl.id)} className="rounded-md bg-red-600 px-2 py-1 font-medium text-white hover:bg-red-500">Delete</button></div></div>}</article>)}</div>}
        </section>
      </div>
    </main>
  )
}