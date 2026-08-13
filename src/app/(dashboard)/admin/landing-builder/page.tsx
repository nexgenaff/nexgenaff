'use client'

import { useState, useEffect } from 'react'
import { Plus, Trash2, Copy, Eye, Edit2, Check, X, Globe, Link as LinkIcon, Zap } from 'lucide-react'

interface Template {
  id: string
  name: string
  description?: string
  thumbnail?: string
  customText?: string
  htmlContent: string
}

interface LandingPage {
  id: string
  subdomain: string
  trackingUrl: string
  headline?: string
  description?: string
  imageUrl?: string
  primaryColor: string
  secondaryColor: string
  buttonText: string
  isPublished: boolean
  totalClicks: number
  template: Template
  createdAt: string
}

// Get the domain dynamically based on the current host
const getDomain = (): string => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname
    // For localhost, use the env variable or default
    if (host === 'localhost' || host.startsWith('127.')) {
      return process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'localhost:3000'
    }
    // For production, detect if it's a subdomain and extract the main domain
    const parts = host.split('.')
    if (parts.length > 2) {
      // It's a subdomain like admin.afficixo.com, return afficixo.com
      return parts.slice(-2).join('.')
    }
    // It's already the main domain
    return host
  }
  return process.env.NEXT_PUBLIC_LANDING_PAGE_DOMAIN || 'afficixo.com'
}

export default function LandingPageBuilder() {
  const [currentStep, setCurrentStep] = useState<'list' | 'builder'>('list')
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [landingPageDomain, setLandingPageDomain] = useState('')
  const [userId, setUserId] = useState<string | null>(null)

  // Builder form state
  const [subdomain, setSubdomain] = useState('')
  const [trackingUrl, setTrackingUrl] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)
  const [subdomainError, setSubdomainError] = useState('')

  // Fetch current user ID
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (response.ok) {
        const data = await response.json()
        setUserId(data.id)
      } else {
        setError('Failed to authenticate user')
      }
    } catch (err) {
      console.error('Auth error:', err)
      setError('Authentication error')
    }
  }

  useEffect(() => {
    setLandingPageDomain(getDomain())
    fetchCurrentUser()
    fetchTemplates()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchLandingPages()
    }
  }, [userId])

  const fetchLandingPages = async () => {
    if (!userId) return
    try {
      setLoading(true)
      const response = await fetch('/api/landing-pages', {
        headers: { 'x-user-id': userId },
      })
      if (response.ok) {
        setLandingPages(await response.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
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

  const validateSubdomain = async (value: string) => {
    setSubdomain(value)
    if (!value.trim()) {
      setSubdomainError('')
      return
    }

    // Check if subdomain is already taken
    if (landingPages.some(page => page.subdomain === value)) {
      setSubdomainError('This subdomain is already taken')
    } else if (!/^[a-z0-9-]+$/.test(value)) {
      setSubdomainError('Only lowercase letters, numbers, and hyphens allowed')
    } else if (value.length < 3) {
      setSubdomainError('Subdomain must be at least 3 characters')
    } else {
      setSubdomainError('')
    }
  }

  const createLandingPage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subdomain || !trackingUrl || !selectedTemplate || !userId) {
      setError('Please fill in all required fields')
      return
    }

    if (subdomainError) {
      setError('Please fix subdomain issues')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await fetch('/api/landing-pages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': userId,
        },
        body: JSON.stringify({
          subdomain,
          trackingUrl,
          templateId: selectedTemplate.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to create landing page')
      }

      setSuccess('Landing page created successfully!')
      setCurrentStep('list')
      
      // Reset form
      setSubdomain('')
      setTrackingUrl('')
      setSelectedTemplate(null)
      
      // Refresh list
      setTimeout(() => {
        fetchLandingPages()
        setSuccess('')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create landing page')
    } finally {
      setLoading(false)
    }
  }

  const copyLandingPageLink = async (page: LandingPage) => {
    const url = `https://${page.subdomain}.${landingPageDomain}`
    let textToCopy = url

    // If template has custom text, use it and replace placeholder with actual link
    if (page.template?.customText) {
      textToCopy = page.template.customText.replace('{link}', url)
    }

    try {
      await navigator.clipboard.writeText(textToCopy)
      setSuccess(`Copied: ${textToCopy}`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Copy failed:', err)
      setError('Failed to copy link')
      setTimeout(() => setError(''), 2000)
    }
  }

  const deleteLandingPage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this landing page?')) return
    if (!userId) return

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId },
      })

      if (response.ok) {
        setLandingPages(landingPages.filter(page => page.id !== id))
        setSuccess('Landing page deleted')
        setTimeout(() => setSuccess(''), 2000)
      }
    } catch (err) {
      setError('Failed to delete landing page')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 flex items-center justify-between">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-400 hover:text-green-300">
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}

        {currentStep === 'list' ? (
          <>
            {/* List View */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 sm:mb-10">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">
                  Landing Pages
                </h1>
                <p className="text-slate-400 mt-1 text-sm">Create landing pages with tracking links - auto-published instantly</p>
              </div>
              <button
                onClick={() => setCurrentStep('builder')}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold text-sm sm:text-base"
              >
                <Plus className="w-5 h-5" />
                New Page
              </button>
            </div>

            {landingPages.length === 0 ? (
              <div className="text-center py-12 sm:py-20">
                <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-800 mb-4">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-slate-100 mb-2">No landing pages yet</h3>
                <p className="text-slate-400 mb-6 text-sm px-4">Get started by creating your first landing page</p>
                <button
                  onClick={() => setCurrentStep('builder')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-semibold text-sm sm:text-base mx-auto"
                >
                  <Plus className="w-4 h-4" />
                  Create Page
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {landingPages.map((page) => (
                  <div 
                    key={page.id} 
                    className="p-4 sm:p-5 bg-slate-800 border border-slate-700 rounded-lg hover:border-slate-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1 font-medium">Subdomain</p>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-100 truncate">
                          https://{page.subdomain}.{landingPageDomain}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyLandingPageLink(page)}
                        title="Copy landing page link"
                        className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-md bg-cyan-900/60 text-cyan-300 hover:bg-cyan-800 transition-colors"
                        aria-label={`Copy link for ${page.subdomain}`}
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="mb-4 space-y-2 pb-4 border-t border-slate-700">
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Template</p>
                        <p className="text-sm text-slate-300">{page.template?.name || 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide mb-1">Clicks</p>
                        <p className="text-sm font-semibold text-slate-300">{page.totalClicks}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => deleteLandingPage(page.id)}
                        className="px-3 py-2 bg-red-900 text-red-300 hover:bg-red-800 rounded text-sm font-medium transition-colors"
                        title="Delete landing page"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Builder View */}
            <button
              onClick={() => setCurrentStep('list')}
              className="mb-6 sm:mb-8 text-cyan-400 hover:text-cyan-300 flex items-center gap-2 transition-colors text-sm sm:text-base"
            >
              ← Back to Landing Pages
            </button>

            <div className="max-w-4xl mx-auto px-0">
              <div className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-100 mb-2">
                  Create Landing Page
                </h2>
                <p className="text-slate-400 text-sm">2 simple steps to set up your landing page</p>
              </div>

              {/* Progress Steps */}
              <div className="mb-8 flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">1</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 text-xs sm:text-sm">Basic Info</p>
                    <p className="text-slate-500 text-xs hidden sm:inline">Subdomain & link</p>
                  </div>
                </div>
                <div className="w-3 h-0.5 sm:w-6 bg-slate-600 flex-shrink-0"></div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-600 flex items-center justify-center text-slate-300 text-xs sm:text-sm font-bold flex-shrink-0">2</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-100 text-xs sm:text-sm">Template</p>
                    <p className="text-slate-500 text-xs hidden sm:inline">Choose design</p>
                  </div>
                </div>
              </div>

              <form onSubmit={createLandingPage} className="space-y-5 sm:space-y-6">
                {/* Step 1: Basic Info */}
                <div className="p-5 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-5">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-100">Step 1: Basic Information</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Subdomain *</label>
                      <p className="text-xs text-slate-400 mb-2">Unique URL for your page</p>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 sm:py-3 hover:border-slate-500 transition-colors focus-within:border-cyan-400">
                        <input
                          type="text"
                          value={subdomain}
                          onChange={(e) => validateSubdomain(e.target.value)}
                          placeholder="myoffer"
                          className={`flex-1 px-0 py-1 sm:py-2 bg-transparent text-slate-100 text-sm sm:text-base placeholder-slate-500 focus:outline-none`}
                        />
                        <span className="text-slate-400 font-medium text-xs sm:text-sm flex-shrink-0">.{landingPageDomain}</span>
                      </div>
                      {subdomainError && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><X className="w-3 h-3" /> {subdomainError}</p>}
                      {!subdomainError && subdomain && <p className="text-green-400 text-xs mt-2 flex items-center gap-1"><Check className="w-3 h-3" /> Looks good!</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-200 mb-2">Tracking Link *</label>
                      <p className="text-xs text-slate-400 mb-2">Where visitors get redirected after landing</p>
                      <div className="flex items-center gap-2 rounded-lg bg-slate-700 border border-slate-600 px-3 py-2 sm:py-3 hover:border-slate-500 transition-colors focus-within:border-cyan-400">
                        <LinkIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                        <input
                          type="url"
                          value={trackingUrl}
                          onChange={(e) => setTrackingUrl(e.target.value)}
                          placeholder="https://example.com/offer"
                          required
                          className="flex-1 px-0 py-1 sm:py-2 bg-transparent text-slate-100 text-sm sm:text-base placeholder-slate-500 focus:outline-none"
                        />
                      </div>
                    </div>


                  </div>
                </div>

                {/* Step 2: Template Selection */}
                <div className="p-5 sm:p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-2 mb-5">
                    <Zap className="w-5 h-5 text-cyan-400" />
                    <h3 className="text-lg sm:text-xl font-semibold text-slate-100">Step 2: Select Template</h3>
                  </div>
                  
                  {templates.length === 0 ? (
                    <p className="text-slate-400 text-center py-6 text-sm">No templates available. Contact your administrator.</p>
                  ) : (
                    <>
                      <p className="text-xs text-slate-400 mb-4">Choose a template</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {templates.map((template) => (
                          <button
                            key={template.id}
                            type="button"
                            onClick={() => setSelectedTemplate(template)}
                            className={`relative overflow-hidden rounded-lg transition-all text-left ${
                              selectedTemplate?.id === template.id
                                ? 'ring-2 ring-cyan-400 bg-slate-700'
                                : 'bg-slate-700 hover:bg-slate-600'
                            }`}
                          >
                            <div className="p-3">
                              {template.thumbnail && (
                                <img 
                                  src={template.thumbnail} 
                                  alt={template.name} 
                                  className="w-full h-28 sm:h-32 object-cover rounded mb-2" 
                                />
                              )}
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-slate-100 text-sm">{template.name}</h4>
                                  {template.description && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{template.description}</p>}
                                </div>
                                {selectedTemplate?.id === template.id && (
                                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-cyan-400 flex items-center justify-center">
                                    <Check className="w-3 h-3 text-cyan-900" />
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Submit Section */}
                <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setCurrentStep('list')}
                    className="w-full sm:flex-1 px-6 py-3 bg-slate-700 text-slate-100 rounded-lg hover:bg-slate-600 transition-colors font-semibold text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !selectedTemplate}
                    className="w-full sm:flex-1 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-600/50 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-semibold flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

