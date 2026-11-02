import { useState } from 'react'
import { Avatar, Card, PageHeader, Segmented, StatusBadge, Tabs, type Tone } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { usePageTitle } from '../../lib/hooks.ts'

const TONES: Array<{ tone: Tone; label: string }> = [
  { tone: 'good', label: 'Active' },
  { tone: 'accent', label: 'Trialing' },
  { tone: 'warn', label: 'Past due' },
  { tone: 'bad', label: 'Overdue' },
  { tone: 'neutral', label: 'Canceled' },
]

export default function UiButtons() {
  usePageTitle('Buttons & badges')
  const [tab, setTab] = useState<'overview' | 'activity' | 'billing'>('overview')
  const [range, setRange] = useState<'7d' | '30d' | '12m'>('30d')
  const [loading, setLoading] = useState(false)

  return (
    <>
      <PageHeader title="Buttons & badges" description="Building blocks used across the app. Classes live in src/styles/base.css and app.css." />

      <Card title="Buttons" description=".btn plus .btn-primary, .btn-secondary, .btn-ghost, .btn-danger or .btn-danger-ghost">
        <div className="demo-row">
          <button type="button" className="btn btn-primary">Primary</button>
          <button type="button" className="btn btn-secondary">Secondary</button>
          <button type="button" className="btn btn-ghost">Ghost</button>
          <button type="button" className="btn btn-danger">Danger</button>
          <button type="button" className="btn btn-danger-ghost">Danger ghost</button>
          <button type="button" className="btn btn-primary" disabled>Disabled</button>
        </div>
        <div className="demo-row">
          <button type="button" className="btn btn-primary btn-sm">Small</button>
          <button type="button" className="btn btn-primary">Default</button>
          <button type="button" className="btn btn-primary btn-lg">Large</button>
          <button type="button" className="btn btn-secondary">
            <Icon name="download" size={16} />
            With icon
          </button>
          <button
            type="button"
            className="btn btn-primary"
            aria-busy={loading}
            disabled={loading}
            onClick={() => {
              setLoading(true)
              window.setTimeout(() => setLoading(false), 1500)
            }}
          >
            {loading && <span className="spinner" aria-hidden="true" />}
            {loading ? 'Saving' : 'Click to load'}
          </button>
        </div>
        <div className="demo-row">
          <button type="button" className="icon-button">
            <Icon name="edit" />
            <span className="sr-only">Edit</span>
          </button>
          <button type="button" className="icon-button">
            <Icon name="trash" />
            <span className="sr-only">Delete</span>
          </button>
          <button type="button" className="icon-button has-dot">
            <Icon name="bell" />
            <span className="sr-only">Notifications</span>
          </button>
          <button type="button" className="link-button">Link button</button>
          <a className="text-link" href="#buttons">Text link</a>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card title="Status badges" description="<StatusBadge status=... /> or tone=...">
          <div className="demo-row">
            {TONES.map((t) => (
              <StatusBadge key={t.tone} tone={t.tone} label={t.label} />
            ))}
          </div>
          <div className="demo-row">
            <span className="code-chip">LAUNCH20</span>
            <span className="tag-chip">Tag</span>
            <span className="count">12</span>
            <span className="kbd">Ctrl</span>
            <span className="kbd">K</span>
          </div>
        </Card>
        <Card title="Avatars" description="Initials on a tinted circle">
          <div className="demo-row">
            <Avatar name="Lena Marsh" size={24} />
            <Avatar name="Daniel Kwame" size={32} />
            <Avatar name="Priya Sethi" size={40} tone="gold" />
            <Avatar name="Yuki Nakamura" size={56} tone="accent" />
            <span className="avatar-stack">
              <Avatar name="Sara Bianchi" size={32} />
              <Avatar name="Emma Walsh" size={32} tone="gold" />
              <Avatar name="Tomás Ortega" size={32} />
            </span>
          </div>
        </Card>
      </div>

      <Card title="Tabs and segmented controls">
        <div className="stack">
          <Tabs
            label="Example tabs"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: 'Activity', count: 5 },
              { id: 'billing', label: 'Billing' },
            ]}
          />
          <p className="muted small">Selected tab: {tab}</p>
          <Segmented
            label="Date range"
            value={range}
            onChange={setRange}
            options={[
              { id: '7d', label: '7 days' },
              { id: '30d', label: '30 days' },
              { id: '12m', label: '12 months' },
            ]}
          />
        </div>
      </Card>
    </>
  )
}
