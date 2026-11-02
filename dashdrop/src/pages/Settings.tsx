import { useState, type FormEvent, type JSX } from 'react'
import { useSearchParams } from 'react-router'
import { Avatar, Card, Switch, Tabs, useToast } from '../components/ui.tsx'
import SettingsShell from '../components/SettingsShell.tsx'
import { THEMES, useTheme } from '../lib/theme.tsx'
import { usePageTitle } from '../lib/hooks.ts'
import { members } from '../data/workspace.ts'

type TabId = 'profile' | 'workspace' | 'appearance' | 'notifications'

const TABS: Array<{ id: TabId; label: string }> = [
  { id: 'profile', label: 'Profile' },
  { id: 'workspace', label: 'Workspace' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'notifications', label: 'Notifications' },
]


function useSave(message: string) {
  const toast = useToast()
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    toast({ title: message })
  }
}

function Profile() {
  const onSubmit = useSave('Profile saved')
  return (
    <Card title="Profile" description="How you appear to your team.">
      <form className="form-grid" onSubmit={onSubmit}>
        <div className="profile-row">
          <Avatar name="Lena Marsh" size={56} tone="accent" />
          <div>
            <strong>Lena Marsh</strong>
            <span className="muted">Owner</span>
          </div>
        </div>
        <div className="field">
          <label htmlFor="full-name">Full name</label>
          <input className="input" id="full-name" defaultValue="Lena Marsh" />
        </div>
        <div className="field">
          <label htmlFor="profile-email">Email</label>
          <input className="input" id="profile-email" type="email" defaultValue="lena@beacon.example" />
        </div>
        <div className="field">
          <label htmlFor="role">Job title</label>
          <input className="input" id="role" defaultValue="Co-founder, product" />
        </div>
        <div className="field">
          <label htmlFor="timezone">Time zone</label>
          <select className="input" id="timezone" defaultValue="Europe/London">
            <option value="America/Los_Angeles">Pacific Time (UTC-8)</option>
            <option value="America/New_York">Eastern Time (UTC-5)</option>
            <option value="Europe/London">London (UTC+0)</option>
            <option value="Europe/Berlin">Berlin (UTC+1)</option>
            <option value="Asia/Jakarta">Jakarta (UTC+7)</option>
            <option value="Asia/Tokyo">Tokyo (UTC+9)</option>
          </select>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" type="submit">
            Save changes
          </button>
        </div>
      </form>
    </Card>
  )
}

function Workspace() {
  const onSubmit = useSave('Workspace saved')
  return (
    <div className="stack-lg">
      <Card title="Workspace" description="Settings shared by everyone in Beacon HQ.">
        <form className="form-grid" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="workspace-name">Workspace name</label>
            <input className="input" id="workspace-name" defaultValue="Beacon HQ" />
          </div>
          <div className="field">
            <label htmlFor="currency">Reporting currency</label>
            <select className="input" id="currency" defaultValue="USD">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>IDR</option>
              <option>JPY</option>
            </select>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary" type="submit">
              Save changes
            </button>
          </div>
        </form>
      </Card>
      <Card title="Members" description={`${members.length} of 10 seats used on the Growth plan. Manage them on the Team page.`} flush>
        <ul className="members">
          {members.map((member) => (
            <li key={member.email}>
              <Avatar name={member.name} size={36} />
              <div>
                <strong>{member.name}</strong>
                <small>{member.email}</small>
              </div>
              <span className={`role role-${member.role.toLowerCase()}`}>{member.role}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

function Appearance() {
  const { theme, setTheme } = useTheme()
  return (
    <Card title="Appearance" description="Saved in this browser.">
      <div className="theme-cards" role="radiogroup" aria-label="Theme">
        {THEMES.map((t) => (
          <button key={t.id} type="button" role="radio" aria-checked={theme === t.id} className="theme-card" onClick={() => setTheme(t.id)}>
            <span className="theme-preview" data-theme={t.id}>
              <span className="tp-side" />
              <span className="tp-main">
                <span className="tp-line" />
                <span className="tp-line short" />
                <span className="tp-button" />
              </span>
            </span>
            <span className="theme-name">{t.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

const NOTIFICATION_OPTIONS = [
  { id: 'payment_failed', label: 'Failed payments', hint: 'When a card is declined or a payment bounces.', on: true },
  { id: 'canceled', label: 'Cancellations', hint: 'When a customer cancels or downgrades.', on: true },
  { id: 'inactive', label: 'Inactive accounts', hint: 'When an account has no logins for 14 days.', on: true },
  { id: 'new', label: 'New customers', hint: 'When a trial converts to a paid plan.', on: false },
  { id: 'digest', label: 'Weekly digest', hint: 'A Monday summary of last week.', on: false },
]

function Notifications() {
  const [values, setValues] = useState<Record<string, boolean>>(() => Object.fromEntries(NOTIFICATION_OPTIONS.map((o) => [o.id, o.on])))
  return (
    <Card title="Email notifications" description="Choose which events send an email to lena@beacon.example." flush>
      <ul className="switch-list">
        {NOTIFICATION_OPTIONS.map((option) => (
          <li key={option.id}>
            <div>
              <strong id={`label-${option.id}`}>{option.label}</strong>
              <small>{option.hint}</small>
            </div>
            <Switch checked={values[option.id]} labelledBy={`label-${option.id}`} onChange={(checked) => setValues((current) => ({ ...current, [option.id]: checked }))} />
          </li>
        ))}
      </ul>
    </Card>
  )
}

const PANELS: Record<TabId, () => JSX.Element> = { profile: Profile, workspace: Workspace, appearance: Appearance, notifications: Notifications }

export default function Settings() {
  usePageTitle('Settings')
  const [params, setParams] = useSearchParams()
  const requested = params.get('tab')
  const tab: TabId = TABS.some((t) => t.id === requested) ? (requested as TabId) : 'profile'
  const Panel = PANELS[tab]

  return (
    <SettingsShell title="Settings" description="Manage your profile, workspace, security and connections.">
      <div className="stack-lg">
        <Tabs<TabId> label="General settings" value={tab} onChange={(id) => setParams({ tab: id }, { replace: true })} tabs={TABS} />
        <Panel />
      </div>
    </SettingsShell>
  )
}
