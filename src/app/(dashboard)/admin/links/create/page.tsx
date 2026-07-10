'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Plus, Link2 } from 'lucide-react'

interface Domain {
  id: string
  domain: string
}

export default function CreateLinkPage() {
  const router = useRouter()
  const [accountName, setAccountName] = useState('')
  const [slug, setSlug] = useState('')
  const [customDomainId, setCustomDomainId] = useState('')
  const [domains, setDomains] = useState<Domain[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchDomains()
  }, [])

  const fetchDomains = async () => {
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
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountName,
          slug,
          customDomainId: customDomainId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create link')
      }

      router.push('/admin/links')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Link href="/admin/links" className="p-2 hover:bg-white/5 rounded-xl transition">
          <ArrowLeft className="w-5 h-5 text-white/60" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Create New Link Account</h1>
          <p className="text-sm text-white/30 mt-1">Set up a new tracking link for your campaigns</p>
        </div>
      </motion.div>

      {/* Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 backdrop-blur text-red-400 p-3 rounded-xl text-sm border border-red-500/20 animate-fadeInUp">
              {error}
            </div>
          )}

          <div>
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

          <div>
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
            <p className="text-xs text-white/20 mt-1">Must be unique. Use letters, numbers, and hyphens only.</p>
          </div>

          <div>
            <label className="form-label">Custom Domain (Optional)</label>
            <select
              value={customDomainId}
              onChange={(e) => setCustomDomainId(e.target.value)}
              className="form-select"
              disabled={loading}
            >
              <option value="">Use default domain</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {domain.domain}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/20 p-4 rounded-xl">
            <p className="text-sm text-white/40 flex items-center gap-2">
              <Link2 className="w-4 h-4" />
              Tracking Link Preview:
            </p>
            <p className="text-sm font-mono text-indigo-400 mt-1 break-all">
              {customDomainId
                ? `https://${domains.find((d) => d.id === customDomainId)?.domain}/${slug || 'your-slug'}`
                : `https://${process.env.NEXT_PUBLIC_APP_URL?.replace('http://', '').replace('https://', '') || 'yourdomain.com'}/${slug || 'your-slug'}`}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 btn-gradient rounded-xl disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Link Account
                </>
              )}
            </button>
            <Link
              href="/admin/links"
              className="px-6 py-2.5 border border-white/10 rounded-xl hover:bg-white/5 transition text-white/60 font-medium"
            >
              Cancel
            </Link>
          </div>
        </form>
      </motion.div>
    </div>
  )
}