'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Trash2, CheckCircle, RefreshCw, XCircle, Copy, ExternalLink } from 'lucide-react'

interface Domain {
  id: string
  domain: string
  verified: boolean
  verifiedAt: string | null
  sslEnabled: boolean
  isActive: boolean
  createdAt: string
  verificationInstructions?: {
    cname: { host: string; value: string }
    txt: { host: string; value: string }
  }
}

export default function DomainsPage() {
  const router = useRouter()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newDomain, setNewDomain] = useState('')
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

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
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const response = await fetch('/api/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: newDomain }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add domain')
      }

      setNewDomain('')
      setShowForm(false)
      fetchDomains()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this domain?')) return

    try {
      const response = await fetch(`/api/domains/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete domain')
      }

      fetchDomains()
    } catch (error) {
      console.error('Error deleting domain:', error)
    }
  }

  const handleVerify = async (id: string) => {
    setVerifyingId(id)
    try {
      const response = await fetch(`/api/domains/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domainId: id }),
      })

      if (!response.ok) {
        throw new Error('Failed to verify domain')
      }

      fetchDomains()
    } catch (error) {
      console.error('Error verifying domain:', error)
    } finally {
      setVerifyingId(null)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading domains...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Custom Domains</h1>
          <p className="text-sm text-white/30 mt-1">Connect your own domains with REAL DNS verification</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 btn-gradient rounded-xl text-sm font-medium flex items-center gap-2"
        >
          {showForm ? (
            <>
              <XCircle className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Domain
            </>
          )}
        </button>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
              <div className="bg-red-500/10 backdrop-blur text-red-400 p-3 rounded-xl text-sm border border-red-500/20">
                {formError}
              </div>
            )}

            <div>
              <label className="form-label">Domain Name</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value.toLowerCase())}
                placeholder="example.com"
                className="form-input"
                required
                disabled={formLoading}
              />
              <p className="text-xs text-white/20 mt-1">
                Add a CNAME record pointing to <span className="text-indigo-400 font-mono">cname.vercel-dns.com</span>
              </p>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 btn-gradient rounded-xl disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {formLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Domain
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Domains List */}
      {domains.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 animate-float">🌐</div>
          <p className="text-white/60">No custom domains added yet</p>
          <p className="text-sm text-white/30 mt-1">Add your first domain to use custom tracking links</p>
        </div>
      ) : (
        <div className="space-y-4">
          {domains.map((domain, index) => (
            <motion.div
              key={domain.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 card-hover"
            >
              <div className="flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-lg font-semibold text-white">{domain.domain}</span>
                      <span className={`badge ${domain.verified ? 'badge-success' : 'badge-warning'}`}>
                        {domain.verified ? (
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Verified</span>
                        ) : (
                          <span className="flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Pending</span>
                        )}
                      </span>
                      <span className={`badge ${domain.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {domain.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-white/30 mt-1">
                      Added: {new Date(domain.createdAt).toLocaleDateString()}
                      {domain.verifiedAt && ` • Verified: ${new Date(domain.verifiedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {!domain.verified && (
                      <button
                        onClick={() => handleVerify(domain.id)}
                        disabled={verifyingId === domain.id}
                        className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium flex items-center gap-1"
                      >
                        {verifyingId === domain.id ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                          <RefreshCw className="w-3 h-3" />
                        )}
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(domain.id)}
                      className="px-3 py-1 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition flex items-center gap-1"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                </div>

                {/* DNS Instructions */}
                {domain.verificationInstructions && !domain.verified && (
                  <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-indigo-400">📋 DNS Verification Instructions</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/30 mb-1">CNAME Record</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-indigo-400 flex-1 break-all">
                            {domain.verificationInstructions?.cname?.host || '—'} → {domain.verificationInstructions?.cname?.value || '—'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${domain.verificationInstructions?.cname?.host || ''} → ${domain.verificationInstructions?.cname?.value || ''}`)}
                            className="p-1 text-white/30 hover:text-white/60 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                      <div className="bg-white/5 rounded-lg p-3">
                        <p className="text-xs text-white/30 mb-1">TXT Record</p>
                        <div className="flex items-center gap-2">
                          <code className="text-xs font-mono text-indigo-400 flex-1 break-all">
                            {domain.verificationInstructions?.txt?.host || '—'} → {domain.verificationInstructions?.txt?.value || '—'}
                          </code>
                          <button
                            onClick={() => copyToClipboard(`${domain.verificationInstructions?.txt?.host || ''} → ${domain.verificationInstructions?.txt?.value || ''}`)}
                            className="p-1 text-white/30 hover:text-white/60 transition"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}