'use client'

import { useEffect } from 'react'

export default function ThemeInitializer() {
  useEffect(() => {
    const applyTheme = () => {
      const storedTheme = window.localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.classList.toggle('dark', storedTheme ? storedTheme === 'dark' : prefersDark)
    }

    applyTheme()
    window.addEventListener('storage', applyTheme)
    window.addEventListener('themechange', applyTheme)

    return () => {
      window.removeEventListener('storage', applyTheme)
      window.removeEventListener('themechange', applyTheme)
    }
  }, [])

  return null
}
