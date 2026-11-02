import Icon, { type IconName } from './Icon.tsx'
import { THEMES, useTheme, type ThemeId } from '../lib/theme.tsx'

const ICONS: Record<ThemeId, IconName> = { light: 'sun', dark: 'moon', sand: 'sand' }

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme()
  return (
    <div className="theme-switch" role="group" aria-label="Color theme">
      {THEMES.map((t) => (
        <button key={t.id} type="button" aria-pressed={theme === t.id} title={`${t.label} theme`} onClick={() => setTheme(t.id)}>
          <Icon name={ICONS[t.id]} size={16} />
          <span className="sr-only">{t.label}</span>
        </button>
      ))}
    </div>
  )
}
