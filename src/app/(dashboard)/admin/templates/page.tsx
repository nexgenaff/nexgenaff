'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  thumbnail?: string
  customText?: string
  htmlContent: string
  isActive: boolean
  createdAt: string
}

export default function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [userRole, setUserRole] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    thumbnail: '',
    customText: '',
    htmlContent: '',
  })

  useEffect(() => {
    checkUserRole()
    fetchTemplates()
    // Clear any previous errors/success messages on mount
    setError('')
    setSuccess('')
  }, [])

  const checkUserRole = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUserRole(data.role || 'OWNER')
        setUserId(data.id || 'current-user')
      } else {
        // If auth/me fails, assume OWNER for this admin page
        setUserRole('OWNER')
        setUserId('current-user')
      }
    } catch (err) {
      console.error('Auth check failed:', err)
      // Default to OWNER if fetch fails
      setUserRole('OWNER')
      setUserId('current-user')
    } finally {
      setAuthLoading(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/landing-pages/templates')
      if (response.ok) {
        setTemplates(await response.json())
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (userRole !== 'OWNER') {
      setError('Only owners can add templates')
      return
    }

    if (!formData.name || !formData.htmlContent) {
      setError('Please fill in name and HTML content')
      return
    }

    try {
      setLoading(true)
      setError('')

      const url = editingId 
        ? `/api/landing-pages/templates/${editingId}`
        : '/api/landing-pages/templates'

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          userId,
          userRole,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setSuccess(editingId ? 'Template updated successfully!' : 'Template created successfully!')
      setFormData({
        name: '',
        description: '',
        thumbnail: '',
        customText: '',
        htmlContent: '',
      })
      setShowForm(false)
      setEditingId(null)
      setTimeout(() => {
        fetchTemplates()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setLoading(false)
    }
  }

  const deleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return

    try {
      setLoading(true)
      const response = await fetch(`/api/landing-pages/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': userRole || '',
          'x-user-id': userId || '',
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error)
      }

      setSuccess('Template deleted successfully!')
      setTimeout(() => {
        fetchTemplates()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template')
    } finally {
      setLoading(false)
    }
  }

  const editTemplate = (template: Template) => {
    setFormData({
      name: template.name,
      description: template.description || '',
      thumbnail: template.thumbnail || '',
      customText: template.customText || '',
      htmlContent: template.htmlContent,
    })
    setEditingId(template.id)
    setShowForm(true)
  }

  const cancelEdit = () => {
    setShowForm(false)
    setEditingId(null)
    setFormData({
      name: '',
      description: '',
      thumbnail: '',
      customText: '',
      htmlContent: '',
    })
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (userRole !== 'OWNER') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Access Denied</h1>
          <p className="text-slate-400">Only owners can manage templates</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="mb-6 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors text-sm sm:text-base"
        >
          ← Back
        </button>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')}>
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')}>
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
              Templates
            </h1>
            <p className="text-slate-400 mt-1 text-sm">Manage landing page templates</p>
          </div>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold text-sm sm:text-base"
            >
              <Plus className="w-5 h-5" />
              New Template
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <div className="mb-8 p-5 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mb-5">{editingId ? 'Edit Template' : 'New Template'}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 hover:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 hover:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Thumbnail URL</label>
                <input
                  type="url"
                  value={formData.thumbnail}
                  onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 hover:border-slate-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">Text</label>
                <textarea
                  value={formData.customText}
                  onChange={(e) => setFormData({ ...formData, customText: e.target.value })}
                  rows={1}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-cyan-400 hover:border-slate-500 transition-colors"
                />
                <p className="text-xs text-slate-400 mt-2">Use <code className="bg-slate-900 px-1.5 py-0.5 rounded">{`{link}`}</code> as a placeholder for the landing page URL. When copied, it will be replaced with the actual link.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">HTML Content *</label>
                <textarea
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={6}
                  className="w-full px-3 py-1.5 bg-slate-700 border border-slate-600 rounded text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 hover:border-slate-500 transition-colors font-mono"
                />
                <div className="text-xs text-slate-400 mt-3 space-y-2">
                  <p><span className="font-semibold text-slate-300">Link Function:</span> <code className="bg-slate-900 px-1.5 py-0.5 rounded">{'{link.url}'}</code> will be replaced with the tracking URL. Use it in <code className="bg-slate-900 px-1.5 py-0.5 rounded">href</code> attributes to redirect users: <code className="bg-slate-900 px-1.5 py-0.5 rounded text-cyan-300">&lt;a href=&quot;{'{link.url}'}&quot;&gt;</code></p>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full sm:flex-1 px-6 py-3 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold text-sm sm:text-base"
                >
                  {loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Templates Grid */}
        {templates.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2">No templates yet</h3>
            <p className="text-slate-400 text-sm mb-4">Create your first template to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <div key={template.id} className="p-4 sm:p-5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors">
                {template.thumbnail && (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="w-full h-28 sm:h-32 object-cover rounded mb-3"
                  />
                )}
                <h3 className="text-base sm:text-lg font-semibold text-slate-100 mb-1">{template.name}</h3>
                {template.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mb-3 line-clamp-2">{template.description}</p>
                )}
                <p className="text-xs text-slate-500 mb-3">HTML: {template.htmlContent.length} chars</p>
                {template.customText && (
                  <p className="text-xs text-slate-400 mb-3 italic truncate">Copy text: {template.customText}</p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => editTemplate(template)}
                    className="flex-1 px-3 py-2 bg-blue-900 text-blue-300 hover:bg-blue-800 rounded text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTemplate(template.id)}
                    disabled={loading}
                    className="flex-1 px-3 py-2 bg-red-900 text-red-300 hover:bg-red-800 disabled:bg-red-900/50 disabled:cursor-not-allowed rounded text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
