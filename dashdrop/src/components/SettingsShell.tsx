import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { PageHeader } from './ui.tsx'

const LINKS = [
  { to: '/settings', label: 'General', end: true },
  { to: '/settings/security', label: 'Security' },
  { to: '/settings/billing', label: 'Plan & billing' },
  { to: '/settings/integrations', label: 'Integrations' },
  { to: '/settings/api-keys', label: 'API keys' },
  { to: '/settings/webhooks', label: 'Webhooks' },
  { to: '/settings/data', label: 'Data & privacy' },
]

/** Page header plus the settings sub-navigation, shared by every settings page. */
export default function SettingsShell({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <>
      <PageHeader title={title} description={description} actions={actions} />
      <div className="settings">
        <nav className="settings-nav" aria-label="Settings sections">
          {LINKS.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="settings-panel">{children}</div>
      </div>
    </>
  )
}
