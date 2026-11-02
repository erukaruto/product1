import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import Icon, { type IconName } from '../../components/Icon.tsx'
import { useToast } from '../../components/ui.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

/* Three onboarding steps. UI only: nothing is saved; each step moves to the next. */

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

export function OnboardingWorkspace() {
  usePageTitle('Set up your workspace')
  const navigate = useNavigate()
  const [name, setName] = useState('Beacon HQ')
  const [slug, setSlug] = useState('beacon-hq')
  const [slugEdited, setSlugEdited] = useState(false)

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/onboarding/billing')
  }

  return (
    <>
      <div className="auth-head">
        <h1>Set up your workspace</h1>
        <p>A workspace holds your billing data, reports and team. You can change these later in Settings.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="ws-name">Workspace name</label>
          <input
            className="input"
            id="ws-name"
            value={name}
            required
            onChange={(event) => {
              setName(event.target.value)
              if (!slugEdited) setSlug(slugify(event.target.value))
            }}
          />
        </div>
        <div className="field">
          <label htmlFor="ws-url">Workspace URL</label>
          <div className="input-group">
            <span className="input-addon">app.beacon.example/</span>
            <input
              className="input"
              id="ws-url"
              value={slug}
              required
              pattern="[a-z0-9-]+"
              onChange={(event) => {
                setSlug(slugify(event.target.value))
                setSlugEdited(true)
              }}
            />
          </div>
          <span className="field-hint">Lowercase letters, numbers and hyphens.</span>
        </div>
        <div className="field">
          <label htmlFor="ws-currency">Reporting currency</label>
          <select className="input" id="ws-currency" defaultValue="USD">
            <option>USD</option>
            <option>EUR</option>
            <option>GBP</option>
            <option>IDR</option>
            <option>JPY</option>
          </select>
        </div>
        <fieldset className="field">
          <legend>Team size</legend>
          <div className="choice-row">
            {['Just me', '2-10', '11-50', '51+'].map((size, index) => (
              <label key={size} className="choice">
                <input type="radio" name="team-size" value={size} defaultChecked={index === 1} />
                <span>{size}</span>
              </label>
            ))}
          </div>
        </fieldset>
        <button className="btn btn-primary btn-block btn-lg" type="submit">
          Continue
        </button>
      </form>
    </>
  )
}

type Source = 'provider' | 'csv' | 'api'

const SOURCES: Array<{ id: Source; title: string; text: string; icon: IconName }> = [
  { id: 'provider', title: 'Connect a billing provider', text: 'Sign in to your billing tool. History imports in the background.', icon: 'link' },
  { id: 'csv', title: 'Upload a CSV export', text: 'Customers, subscriptions and invoices from any system.', icon: 'upload' },
  { id: 'api', title: 'Send data through the API', text: 'For teams that run their own billing.', icon: 'zap' },
]

export function OnboardingBilling() {
  usePageTitle('Add your billing data')
  const navigate = useNavigate()
  const toast = useToast()
  const [source, setSource] = useState<Source>('provider')
  const [connected, setConnected] = useState(false)
  const [file, setFile] = useState<string>('')
  const apiKey = 'bk_live_51Hc8Q2demoKey7Tq'

  return (
    <>
      <div className="auth-head">
        <h1>Add your billing data</h1>
        <p>Pick how Beacon gets your subscriptions. You can add more sources later.</p>
      </div>
      <div className="option-cards" role="radiogroup" aria-label="Data source">
        {SOURCES.map((option) => (
          <button key={option.id} type="button" role="radio" aria-checked={source === option.id} className="option-card" onClick={() => setSource(option.id)}>
            <span className="option-icon">
              <Icon name={option.icon} size={18} />
            </span>
            <span>
              <strong>{option.title}</strong>
              <small>{option.text}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="option-detail">
        {source === 'provider' &&
          (connected ? (
            <p className="inline-status good">
              <Icon name="checkCircle" size={18} /> Connected. Importing 2 years of history.
            </p>
          ) : (
            <button type="button" className="btn btn-secondary btn-block" onClick={() => setConnected(true)}>
              <Icon name="link" size={16} />
              Connect billing provider
            </button>
          ))}
        {source === 'csv' && (
          <label className="dropzone">
            <Icon name="upload" />
            <strong>{file || 'Choose a CSV file'}</strong>
            <small>{file ? 'Ready to import' : 'Or drag it here. Up to 50 MB.'}</small>
            <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(event) => setFile(event.target.files?.[0]?.name ?? '')} />
          </label>
        )}
        {source === 'api' && (
          <div className="field">
            <label htmlFor="api-key">Your API key</label>
            <div className="input-group">
              <input className="input mono" id="api-key" value={apiKey} readOnly />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(apiKey).catch(() => {})
                  toast({ title: 'API key copied' })
                }}
              >
                <Icon name="copy" size={16} />
                Copy
              </button>
            </div>
            <span className="field-hint">Demo key. Keep real keys out of client-side code.</span>
          </div>
        )}
      </div>

      <div className="onboarding-actions">
        <Link className="btn btn-ghost" to="/onboarding/workspace">
          <Icon name="arrowLeft" size={16} />
          Back
        </Link>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding/team')}>
          Continue
        </button>
      </div>
    </>
  )
}

interface Invite {
  id: number
  email: string
  role: 'Admin' | 'Viewer'
}

export function OnboardingTeam() {
  usePageTitle('Invite your team')
  const navigate = useNavigate()
  const toast = useToast()
  const [invites, setInvites] = useState<Invite[]>([
    { id: 1, email: '', role: 'Admin' },
    { id: 2, email: '', role: 'Viewer' },
  ])

  const update = (id: number, patch: Partial<Invite>) => setInvites((list) => list.map((invite) => (invite.id === id ? { ...invite, ...patch } : invite)))

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const count = invites.filter((invite) => invite.email.trim()).length
    toast({ title: count ? `${count} ${count === 1 ? 'invite' : 'invites'} sent` : 'Setup complete' })
    navigate('/getting-started')
  }

  return (
    <>
      <div className="auth-head">
        <h1>Invite your team</h1>
        <p>Admins can change settings. Viewers can see reports. Skip this if you work alone.</p>
      </div>
      <form className="stack" onSubmit={onSubmit}>
        {invites.map((invite, index) => (
          <div key={invite.id} className="invite-row">
            <label className="sr-only" htmlFor={`invite-${invite.id}`}>
              Email {index + 1}
            </label>
            <input
              className="input"
              id={`invite-${invite.id}`}
              type="email"
              placeholder="name@company.example"
              value={invite.email}
              onChange={(event) => update(invite.id, { email: event.target.value })}
            />
            <label className="sr-only" htmlFor={`role-${invite.id}`}>
              Role {index + 1}
            </label>
            <select className="input" id={`role-${invite.id}`} value={invite.role} onChange={(event) => update(invite.id, { role: event.target.value as Invite['role'] })}>
              <option>Admin</option>
              <option>Viewer</option>
            </select>
            <button
              type="button"
              className="icon-button"
              disabled={invites.length === 1}
              onClick={() => setInvites((list) => list.filter((item) => item.id !== invite.id))}
            >
              <Icon name="trash" size={16} />
              <span className="sr-only">Remove email {index + 1}</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          className="btn btn-ghost add-row"
          onClick={() => setInvites((list) => [...list, { id: Math.max(...list.map((i) => i.id)) + 1, email: '', role: 'Viewer' }])}
        >
          <Icon name="plus" size={16} />
          Add another
        </button>
        <div className="onboarding-actions">
          <Link className="btn btn-ghost" to="/onboarding/billing">
            <Icon name="arrowLeft" size={16} />
            Back
          </Link>
          <button className="btn btn-primary btn-lg" type="submit">
            Send invites and finish
          </button>
        </div>
      </form>
    </>
  )
}
