'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Globe, Check, X, Power, PowerOff } from 'lucide-react'

interface Offer {
  id: string
  country: string
  offerUrl: string
  isActive: boolean
  isGlobal: boolean
}

export default function OffersPage() {
  const router = useRouter()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    country: '',
    offerUrl: '',
    isGlobal: false,
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      const response = await fetch('/api/offers')
      if (response.status === 401) {
        router.push('/login')
        return
      }
      const data = await response.json()
      setOffers(data)
    } catch (error) {
      console.error('Failed to fetch offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    setFormLoading(true)

    try {
      const url = editingId ? `/api/offers/${editingId}` : '/api/offers'
      const method = editingId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to save offer')
      }

      setShowForm(false)
      setEditingId(null)
      setFormData({ country: '', offerUrl: '', isGlobal: false })
      fetchOffers()
    } catch (err: any) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this offer?')) return

    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete offer')
      }

      fetchOffers()
    } catch (error) {
      console.error('Error deleting offer:', error)
    }
  }

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle offer')
      }

      fetchOffers()
    } catch (error) {
      console.error('Error toggling offer:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading offers...</p>
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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Offer Vault</h1>
          <p className="text-sm text-white/30 mt-1">Manage geo-targeted offers for your links</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 btn-gradient rounded-xl text-sm font-medium flex items-center gap-2"
        >
          {showForm ? (
            <>
              <X className="w-4 h-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Add Offer
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
              <label className="form-label">Country (e.g., US, GB, CA)</label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value.toUpperCase() })}
                className="form-input"
                placeholder="Enter country code"
                required
                disabled={formLoading}
              />
            </div>

            <div>
              <label className="form-label">Offer URL</label>
              <input
                type="url"
                value={formData.offerUrl}
                onChange={(e) => setFormData({ ...formData, offerUrl: e.target.value })}
                className="form-input"
                placeholder="https://affiliate.com/?s1="
                required
                disabled={formLoading}
              />
              <p className="text-xs text-white/20 mt-1">The slug will be automatically appended to this URL</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isGlobal"
                checked={formData.isGlobal}
                onChange={(e) => setFormData({ ...formData, isGlobal: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-white/20 rounded focus:ring-indigo-500 bg-white/5"
                disabled={formLoading}
              />
              <label htmlFor="isGlobal" className="text-sm text-white/60 flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Global Smart Link (fallback for all countries)
              </label>
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="px-4 py-2 btn-gradient rounded-xl disabled:opacity-50 font-medium flex items-center gap-2"
            >
              {formLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  {editingId ? 'Update Offer' : 'Add Offer'}
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}

      {/* Offers List */}
      {offers.length === 0 ? (
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <div className="text-5xl mb-4 animate-float">📦</div>
          <p className="text-white/60">No offers found</p>
          <p className="text-sm text-white/30 mt-1">Add your first offer to start redirecting traffic</p>
        </div>
      ) : (
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 sm:p-6 card-hover"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {offer.isGlobal ? (
                      <span className="text-sm font-medium text-purple-400 flex items-center gap-1">
                        <Globe className="w-4 h-4" /> Global
                      </span>
                    ) : (
                      <span className="text-sm font-medium flex items-center gap-1">🌍 {offer.country}</span>
                    )}
                    <span className={`badge ${offer.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {offer.isActive ? (
                        <span className="flex items-center gap-1"><Power className="w-3 h-3" /> Active</span>
                      ) : (
                        <span className="flex items-center gap-1"><PowerOff className="w-3 h-3" /> Inactive</span>
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-white/40 mt-1 break-all font-mono">{offer.offerUrl}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggle(offer.id, offer.isActive)}
                    className={`px-3 py-1 text-sm border rounded-lg transition flex items-center gap-1 ${
                      offer.isActive
                        ? 'border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10'
                        : 'border-green-500/30 text-green-400 hover:bg-green-500/10'
                    }`}
                  >
                    {offer.isActive ? (
                      <>
                        <PowerOff className="w-3 h-3" /> Disable
                      </>
                    ) : (
                      <>
                        <Power className="w-3 h-3" /> Enable
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setFormData({
                        country: offer.country,
                        offerUrl: offer.offerUrl,
                        isGlobal: offer.isGlobal,
                      })
                      setEditingId(offer.id)
                      setShowForm(true)
                    }}
                    className="px-3 py-1 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition flex items-center gap-1 text-white/60"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(offer.id)}
                    className="px-3 py-1 text-sm border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/10 transition flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}