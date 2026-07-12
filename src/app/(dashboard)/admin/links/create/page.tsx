'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  Link2,
  Sparkles,
  CheckCircle2,
  Globe2,
  ShieldCheck,
  Orbit,
  Copy,
  Check,
} from 'lucide-react'

interface Domain {
  id: string
  domain: string
  verified: boolean
  isActive: boolean
}

interface CreatedAccount {
  accountName: string
  slug: string
  domain?: string
  trackingUrl: string
  publicStatsUrl: string
}

interface OfferSummary {
  groupName: string | null
}

export default function CreateLinkPage() {
  const router = useRouter()
  const [accountName, setAccountName] = useState('')
  const [slug, setSlug] = useState('')
  const [customDomainId, setCustomDomainId] = useState('')
  const [offerGroupName, setOfferGroupName] = useState('')
  const [domains, setDomains] = useState<Domain[]>([])
  const [offerGroups, setOfferGroups] = useState<string[]>([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [createdAccount, setCreatedAccount] = useState<CreatedAccount | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

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
          (data as OfferSummary[])
            .map((offer) => offer.groupName?.trim())
            .filter((value): value is string => Boolean(value))
        )
      ).sort((a, b) => a.localeCompare(b))

      setOfferGroups(groups)
    } catch (error) {
      console.error('Failed to fetch offer groups:', error)
    }
  }, [router])

  useEffect(() => {
    void fetchDomains()
    void fetchOfferGroups()
  }, [fetchDomains, fetchOfferGroups])

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin.replace(/\/$/, '')
    }

    return (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')
  }

  const selectableDomains = domains.filter((domain) => domain.verified && domain.isActive)
  const selectedDomain = selectableDomains.find((domain) => domain.id === customDomainId)
  const previewUrl = selectedDomain
    ? `https://${selectedDomain.domain}/${slug || 'your-slug'}`
    : `${getBaseUrl()}/${slug || 'your-slug'}`

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      window.setTimeout(() => setCopiedKey(null), 1600)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          slug,
          customDomainId: customDomainId || null,
          offerGroupName: offerGroupName || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link')
      }

      const createdTrackingUrl = data.customDomain?.domain
        ? `https://${data.customDomain.domain}/${data.slug}`
        : `${getBaseUrl()}/${data.slug}`

      const createdPublicStatsUrl = `${getBaseUrl()}/stats/${data.publicDashboard?.publicId}`

      setCreatedAccount({
        accountName: data.accountName,
        slug: data.slug,
        domain: data.customDomain?.domain,
        trackingUrl: createdTrackingUrl,
        publicStatsUrl: createdPublicStatsUrl,
      })
      setSuccess(`Link account “${data.accountName}” was created successfully. Your tracking and public stats URLs are ready to copy.`)
      setAccountName('')
      setSlug('')
      setCustomDomainId('')
      setOfferGroupName('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative space-y-6 overflow-hidden">
      <div className="absolute -left-12 top-6 h-36 w-36 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute right-0 top-8 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex items-center gap-4"
      >
        <Link href="/admin/links" className="rounded-xl border border-white/10 bg-white/5 p-2 transition hover:bg-white/10">
          <ArrowLeft className="h-5 w-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white sm:text-3xl">Create New Link Account</h1>
          <p className="mt-1 text-sm text-white/30">Launch a new branded tracking link and attach it to a smart routing pool in one flow.</p>
        </div>
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.4, ease: 'easeOut' }}
          className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl sm:p-8"
        >
          <div className="mb-6 flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.24em]">Campaign Builder</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-200"
                >
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{success}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="form-label">Account Name</label>
                <input
                  type="text"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., iPhone Campaign"
                  required
                  disabled={loading}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Slug</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s/g, '-'))}
                  className="form-input"
                  placeholder="e.g., iphone-offer"
                  required
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-white/25">Use a unique slug. Letters, numbers, and hyphens only.</p>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Custom Domain (Optional)</label>
                <select
                  value={customDomainId}
                  onChange={(e) => setCustomDomainId(e.target.value)}
                  className="form-select"
                  disabled={loading || selectableDomains.length === 0}
                >
                  <option value="">Use default domain</option>
                  {selectableDomains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/25">
                  Only verified and active custom domains are eligible for branded link creation.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="form-label">Destination Offer Group (Optional)</label>
                <select
                  value={offerGroupName}
                  onChange={(e) => setOfferGroupName(e.target.value)}
                  className="form-select"
                  disabled={loading}
                >
                  <option value="">Use default country/global smart routing</option>
                  {offerGroups.map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-white/25">If selected, this link will try that named routing pool first before falling back to normal geo routing.</p>
              </div>
            </div>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm text-white/50">
                <Link2 className="h-4 w-4 text-indigo-300" />
                Tracking Link Preview
              </div>
              <div className="rounded-xl border border-white/10 bg-slate-950/70 px-3 py-3 font-mono text-sm text-indigo-300 break-all">
                {previewUrl}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                type="submit"
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-violet-500 px-6 py-2.5 font-medium text-white shadow-[0_10px_30px_rgba(99,102,241,0.35)] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Create Link Account
                  </>
                )}
              </motion.button>

              <Link
                href="/admin/links"
                className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 font-medium text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                Cancel
              </Link>
            </div>
          </form>
        </motion.div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4, ease: 'easeOut' }}
            className="rounded-3xl border border-cyan-400/20 bg-[linear-gradient(180deg,rgba(34,211,238,0.09),rgba(15,23,42,0.75))] p-5"
          >
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <Orbit className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.24em]">Smart routing preview</span>
            </div>
            <div className="space-y-3 text-sm text-white/75">
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Selected pool</div>
                <div className="mt-1 font-semibold text-white">{offerGroupName || 'Default routing mode'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Priority order</div>
                <div className="mt-1 text-white/75">Named pool → country offers → global fallback</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                <div className="text-[11px] uppercase tracking-[0.24em] text-white/40">Tracking ready</div>
                <div className="mt-1 text-white/75">Your slug and domain are prepared for instant campaign deployment.</div>
              </div>
            </div>
          </motion.div>

          {createdAccount && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22, duration: 0.4, ease: 'easeOut' }}
              className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5"
            >
              <div className="mb-2 flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.24em]">Last created</span>
              </div>
              <div className="text-sm text-white/80">{createdAccount.accountName}</div>
              <div className="text-xs text-white/45">/{createdAccount.slug}</div>
              {createdAccount.domain && (
                <div className="mt-2 text-xs text-emerald-200">Domain: {createdAccount.domain}</div>
              )}

              <div className="mt-4 space-y-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/55 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-white/40">
                      <Link2 className="h-3.5 w-3.5" />
                      Tracking link
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdAccount.trackingUrl, 'created-tracking')}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      {copiedKey === 'created-tracking' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="mt-2 break-all font-mono text-xs text-indigo-300">{createdAccount.trackingUrl}</div>
                </div>

                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.24em] text-emerald-300">
                      <Globe2 className="h-3.5 w-3.5" />
                      Public stats link
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(createdAccount.publicStatsUrl, 'created-stats')}
                      className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
                    >
                      {copiedKey === 'created-stats' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  <div className="mt-2 break-all font-mono text-xs text-emerald-300">{createdAccount.publicStatsUrl}</div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}