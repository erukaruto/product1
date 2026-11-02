import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

/* The initial theme is set by the inline script in index.html, before React loads. */
export type ThemeId = 'light' | 'dark' | 'sand'

export const THEMES: Array<{ id: ThemeId; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'sand', label: 'Sand' },
]

const STORAGE_KEY = 'beacon-theme'

interface ThemeContextValue {
  theme: ThemeId
  setTheme: (theme: ThemeId) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const isTheme = (value: string | null): value is ThemeId => THEMES.some((t) => t.id === value)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => {
    const current = document.documentElement.getAttribute('data-theme')
    return isTheme(current) ? current : 'light'
  })

  const setTheme = useCallback((next: ThemeId) => {
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      /* storage can be blocked; the theme still applies for this session */
    }
    setThemeState(next)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used inside <ThemeProvider>')
  return context
}
