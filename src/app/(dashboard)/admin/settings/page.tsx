'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Sun, Moon, User, Mail, Key, LogOut, AlertTriangle, Trash2, RefreshCw, Shield } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const dark = localStorage.getItem('theme') === 'dark'
    setDarkMode(dark)
    setLoading(false)
  }, [])

  const toggleTheme = () => {
    const newDark = !darkMode
    setDarkMode(newDark)
    document.documentElement.classList.toggle('dark', newDark)
    localStorage.setItem('theme', newDark ? 'dark' : 'light')
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/40 mt-4 animate-pulse">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/30 mt-1">Manage your account and application preferences</p>
      </motion.div>

      {/* Appearance */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 card-hover"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          Appearance
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-medium text-white">Dark Mode</p>
            <p className="text-sm text-white/30">Toggle dark/light theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`px-4 py-2 rounded-xl transition font-medium flex items-center gap-2 ${
              darkMode
                ? 'bg-white/10 text-white hover:bg-white/20'
                : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>
      </motion.div>

      {/* Account */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 card-hover"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <User className="w-5 h-5" />
          Account
        </h3>
        <div className="space-y-3">
          <div>
            <p className="text-sm text-white/30 flex items-center gap-1"><User className="w-4 h-4" /> Username</p>
            <p className="font-medium text-white">admin</p>
          </div>
          <div>
            <p className="text-sm text-white/30 flex items-center gap-1"><Mail className="w-4 h-4" /> Email</p>
            <p className="font-medium text-white">admin@nextgen.com</p>
          </div>
          <button className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition text-white/60 font-medium flex items-center gap-2">
            <Key className="w-4 h-4" />
            Change Password
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/10 transition font-medium flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </motion.div>

      {/* Security */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 card-hover"
      >
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Two-Factor Authentication</p>
              <p className="text-sm text-white/30">Add an extra layer of security</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition font-medium">Enable</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Session Management</p>
              <p className="text-sm text-white/30">Active sessions: 1</p>
            </div>
            <button className="px-4 py-2 border border-white/10 rounded-xl hover:bg-white/5 transition text-white/60">Manage</button>
          </div>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/5 backdrop-blur-xl border-2 border-red-500/20 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Danger Zone
        </h3>
        <p className="text-sm text-white/30 mb-4">
          These actions are irreversible. Please be careful.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg shadow-red-500/20 flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-medium shadow-lg shadow-red-500/20 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset All Analytics
          </button>
        </div>
      </motion.div>
    </div>
  )
}