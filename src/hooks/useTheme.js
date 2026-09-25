import { useEffect, useState } from 'react'

const STORAGE_KEY = 'buscador-libro-theme'

function isBrowser() {
  return typeof window !== 'undefined'
}

function getSystemTheme() {
  if (!isBrowser()) return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialTheme() {
  if (isBrowser()) {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') return stored
  }
  return getSystemTheme()
}

function applyTheme(theme) {
  if (isBrowser()) {
    document.documentElement.setAttribute('data-theme', theme)
  }
}

export function useTheme() {
  const [theme, setTheme] = useState(getInitialTheme)

  useEffect(() => {
    applyTheme(theme)
    if (isBrowser()) {
      localStorage.setItem(STORAGE_KEY, theme)
    }
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'))
  }

  return { theme, toggleTheme }
}