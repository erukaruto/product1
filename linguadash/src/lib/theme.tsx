import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export const THEMES = ['light', 'dark', 'batik'] as const
export type Theme = (typeof THEMES)[number]
const THEME_COLORS: Record<Theme, string> = { light: '#3b3fc4', dark: '#0f1117', batik: '#8e3210' }
const isTheme = (value: unknown): value is Theme => THEMES.includes(value as Theme)

const ThemeContext = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({ theme: 'light', setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  // index.html already applied the theme before React loaded; start from that value.
  const [theme, setThemeState] = useState<Theme>(() => {
    const current = document.documentElement.getAttribute('data-theme')
    return isTheme(current) ? current : 'light'
  })
  const setTheme = useCallback((next: Theme) => {
    setThemeState(next)
    try { localStorage.setItem('lingua-theme', next) } catch { /* private mode */ }
  }, [])
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLORS[theme])
  }, [theme])
  return <ThemeContext value={{ theme, setTheme }}>{children}</ThemeContext>
}

export const useTheme = () => useContext(ThemeContext)

/** Link back to LinguaDrop, carrying the current theme (the two apps run on different origins). */
export function siteUrl(path = '/', theme?: Theme) {
  const base = (import.meta.env.VITE_SITE_URL || 'http://localhost:5173').replace(/\/+$/, '')
  const url = new URL(base + path)
  if (theme) url.searchParams.set('theme', theme)
  return url.toString()
}
