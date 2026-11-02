import { useState } from 'react'
import { Card, StatusBadge, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import Icon, { type IconName } from '../../components/Icon.tsx'
import { integrations as initial, type Integration } from '../../data/workspace.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const ICON: Record<Integration['category'], IconName> = { Billing: 'card', Messaging: 'mail', Data: 'layers' }

export default function Integrations() {
  usePageTitle('Integrations')
  const toast = useToast()
  const [items, setItems] = useState(initial)

  function toggle(item: Integration) {
    setItems((list) => list.map((x) => (x.id === item.id ? { ...x, connected: !x.connected, detail: x.connected ? undefined : 'Connected just now' } : x)))
    toast({ title: item.connected ? `${item.name} disconnected` : `${item.name} connected`, tone: item.connected ? 'info' : 'good' })
  }

  return (
    <SettingsShell title="Integrations" description="Where Beacon reads data from and sends it to.">
      {(['Billing', 'Messaging', 'Data'] as const).map((category) => (
        <section key={category} className="integration-group">
          <h2 className="section-title">{category}</h2>
          <div className="integration-grid">
            {items
              .filter((i) => i.category === category)
              .map((item) => (
                <Card key={item.id}>
                  <div className="integration">
                    <span className="option-icon">
                      <Icon name={ICON[item.category]} size={18} />
                    </span>
                    <div>
                      <strong>{item.name}</strong>
                      <small className="muted">{item.description}</small>
                      {item.connected && item.detail && <small className="muted">{item.detail}</small>}
                    </div>
                    {item.connected && <StatusBadge tone="good" label="Connected" />}
                  </div>
                  <button type="button" className={`btn btn-sm ${item.connected ? 'btn-ghost' : 'btn-secondary'} top-gap`} onClick={() => toggle(item)}>
                    {item.connected ? 'Disconnect' : 'Connect'}
                  </button>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </SettingsShell>
  )
}
