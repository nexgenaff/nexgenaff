'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sun, Moon, User, Mail, Key, LogOut, AlertTriangle, Trash2, RefreshCw, Shield, CheckCircle2, XCircle, Lock } from 'lucide-react'

interface FeedbackState {
  type: 'success' | 'error'
  message: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [userInfo, setUserInfo] = useState<{ username?: string; email?: string } | null>(null)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false)
  const [sessionCount, setSessionCount] = useState(1)
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [showDangerZone, setShowDangerZone] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    const readTheme = () => {
      const storedTheme = window.localStorage.getItem('theme')
      const shouldUseDark = storedTheme
        ? storedTheme === 'dark'
        : window.matchMedia('(prefers-color-scheme: dark)').matches

      setDarkMode(shouldUseDark)
      document.documentElement.classList.toggle('dark', shouldUseDark)
    }

    const fetchAccount = async () => {
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' })
        if (response.ok) {
          const data = await response.json()
          setUserInfo({ username: data.username || 'admin', email: data.email || 'admin@nextgen.com' })
        } else {
          setUserInfo({ username: 'admin', email: 'admin@nextgen.com' })
        }
      } catch {
        setUserInfo({ username: 'admin', email: 'admin@nextgen.com' })
      } finally {
        setLoading(false)
      }
    }

    readTheme()
    fetchAccount()

    const handleThemeChange = () => readTheme()
    window.addEventListener('storage', handleThemeChange)
    window.addEventListener('themechange', handleThemeChange)

    return () => {
      window.removeEventListener('storage', handleThemeChange)
      window.removeEventListener('themechange', handleThemeChange)
    }
  }, [])

  const toggleTheme = () => {
    const newDark = !darkMode
    setDarkMode(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    window.localStorage.setItem('theme', newDark ? 'dark' : 'light')
    window.dispatchEvent(new Event('themechange'))
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
      router.push('/login')
    } catch {
      router.push('/login')
    }
  }

  const handlePasswordSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'change-password',
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      })

      const data = await response.json().catch(() => ({ message: 'Password updated' }))
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update password')
      }

      setFeedback({ type: 'success', message: data.message || 'Password updated successfully.' })
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordForm(false)
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to update password' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleTwoFactor = async () => {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-2fa', enabled: !isTwoFactorEnabled }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Unable to update two-factor authentication')
      }

      setIsTwoFactorEnabled(Boolean(data.enabled ?? !isTwoFactorEnabled))
      setFeedback({ type: 'success', message: data.message || 'Two-factor authentication updated.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to update two-factor authentication' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSessionManagement = async () => {
    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/auth/me', { credentials: 'include' })
      if (!response.ok) {
        throw new Error('Your session is no longer active.')
      }
      setSessionCount((previous) => Math.max(previous, 1))
      setFeedback({ type: 'success', message: 'Session check completed. Your current browser session is active.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to verify the active session' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDangerAction = async (action: 'delete-data' | 'reset-analytics') => {
    const confirmMessage = action === 'delete-data'
      ? 'This will permanently remove all workspace data for this account. Continue?'
      : 'This will reset all analytics for your workspace. Continue?'

    if (!window.confirm(confirmMessage)) return

    setIsSubmitting(true)
    setFeedback(null)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(data.error || 'Unable to complete that action')
      }

      setFeedback({ type: 'success', message: data.message || 'Action completed.' })
    } catch (error) {
      setFeedback({ type: 'error', message: error instanceof Error ? error.message : 'Unable to complete that action' })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-cyan-400/60 border-t-transparent" />
          <p className="mt-4 animate-pulse text-white/40">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${feedback.type === 'success' ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-300' : 'border-red-400/20 bg-red-500/10 text-red-300'}`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {feedback.message}
        </motion.div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="relative overflow-hidden rounded-[28px] border border-cyan-400/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.24)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-[radial-gradient(circle,rgba(34,211,238,0.19),transparent_65%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {darkMode ? <Moon className="h-5 w-5 text-cyan-200" /> : <Sun className="h-5 w-5 text-cyan-200" />}
                  <h3 className="text-lg font-semibold text-white">Appearance</h3>
                </div>
                <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-cyan-200/90">
                  Personalization
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-white">Dark Mode</p>
                  <p className="text-sm text-slate-400">Toggle between a darker workspace and a brighter one.</p>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`flex items-center gap-2 rounded-2xl border px-4 py-2.5 font-medium transition ${darkMode ? 'border-white/10 bg-white/10 text-white hover:bg-white/15' : 'border-cyan-400/20 bg-gradient-to-r from-cyan-500/14 via-cyan-500/10 to-violet-500/10 text-slate-100 hover:brightness-110'}`}
                >
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  {darkMode ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-6 shadow-[0_20px_60px_rgba(2,6,23,0.24)] backdrop-blur-2xl"
          >
            <div className="pointer-events-none absolute inset-y-0 left-0 w-36 bg-[radial-gradient(circle,rgba(129,140,248,0.18),transparent_70%)]" />
            <div className="relative">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-cyan-200" />
                  <h3 className="text-lg font-semibold text-white">Account</h3>
                </div>
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-400">
                  Profile details
                </span>
              </div>
              <div className="space-y-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="flex items-center gap-1 text-sm text-slate-400"><User className="h-4 w-4" /> Username</p>
                    <p className="mt-1 font-medium text-white">{userInfo?.username || 'admin'}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-3">
                    <p className="flex items-center gap-1 text-sm text-slate-400"><Mail className="h-4 w-4" /> Email</p>
                    <p className="mt-1 font-medium text-white">{userInfo?.email || 'admin@nextgen.com'}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowPasswordForm((value) => !value)}
                    className="flex items-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2.5 font-medium text-cyan-100 transition hover:bg-cyan-500/15"
                  >
                    <Key className="h-4 w-4" />
                    {showPasswordForm ? 'Hide Password Form' : 'Change Password'}
                  </button>
                  <button
                    onClick={() => setShowDangerZone((value) => !value)}
                    className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2.5 font-medium text-slate-300 transition hover:bg-white/8"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    {showDangerZone ? 'Hide Danger Zone' : 'Show Danger Zone'}
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-2.5 font-medium text-red-300 transition hover:bg-red-500/15"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>

                {showPasswordForm && (
                  <form onSubmit={handlePasswordSubmit} className="space-y-3 rounded-[24px] border border-white/10 bg-slate-950/50 p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-sm text-slate-400">
                        <span>Current password</span>
                        <input
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(event) => setPasswordForm((value) => ({ ...value, currentPassword: event.target.value }))}
                          className="form-input"
                          required
                        />
                      </label>
                      <label className="space-y-1 text-sm text-slate-400">
                        <span>New password</span>
                        <input
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(event) => setPasswordForm((value) => ({ ...value, newPassword: event.target.value }))}
                          className="form-input"
                          required
                          minLength={8}
                        />
                      </label>
                    </div>
                    <label className="block space-y-1 text-sm text-slate-400">
                      <span>Confirm new password</span>
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(event) => setPasswordForm((value) => ({ ...value, confirmPassword: event.target.value }))}
                        className="form-input"
                        required
                        minLength={8}
                      />
                    </label>
                    <div className="flex flex-wrap gap-3">
                      <button type="submit" disabled={isSubmitting} className="rounded-2xl bg-gradient-to-r from-cyan-500 to-violet-500 px-4 py-2 font-medium text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                        {isSubmitting ? 'Updating...' : 'Save password'}
                      </button>
                      <button type="button" onClick={() => setShowPasswordForm(false)} className="rounded-2xl border border-white/10 px-4 py-2 font-medium text-slate-300 transition hover:bg-white/5">
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </motion.section>
        </div>

        <div className="space-y-6">
          {showDangerZone && (
            <motion.section
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32 }}
              className="relative overflow-hidden rounded-[28px] border border-red-500/25 bg-[linear-gradient(135deg,rgba(127,29,29,0.26),rgba(255,255,255,0.04))] p-6 shadow-[0_20px_60px_rgba(127,29,29,0.16)] backdrop-blur-2xl"
            >
              <div className="pointer-events-none absolute inset-y-0 right-0 w-44 bg-[radial-gradient(circle,rgba(248,113,113,0.18),transparent_70%)]" />
              <div className="relative">
                <div className="mb-4 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-300" />
                  <h3 className="text-lg font-semibold text-red-200">Danger Zone</h3>
                </div>
                <p className="mb-4 text-sm text-slate-400">These actions are irreversible. Please be careful.</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => handleDangerAction('delete-data')} disabled={isSubmitting} className="flex items-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 font-medium text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <Trash2 className="h-4 w-4" />
                    Delete All Data
                  </button>
                  <button onClick={() => handleDangerAction('reset-analytics')} disabled={isSubmitting} className="flex items-center gap-2 rounded-2xl bg-red-600/90 px-4 py-2.5 font-medium text-white shadow-lg shadow-red-500/20 transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60">
                    <RefreshCw className="h-4 w-4" />
                    Reset All Analytics
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </div>
      </div>
    </div>
  )
}