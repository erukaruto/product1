import { useState, type FormEvent } from 'react'
import { Card, Modal, StatusBadge, Switch, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import Icon from '../../components/Icon.tsx'
import { WEBHOOK_EVENTS, webhooks as initial } from '../../data/workspace.ts'
import { formatDate } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

/* UI only: no requests are sent. */
export default function Webhooks() {
  usePageTitle('Webhooks')
  const toast = useToast()
  const [hooks, setHooks] = useState(initial)
  const [adding, setAdding] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const url = String(data.get('url')).trim()
    const events = data.getAll('events').map(String)
    const next: Record<string, string> = {}
    if (!/^https:\/\/\S+\.\S+/.test(url)) next.url = 'Use a full https:// address.'
    if (events.length === 0) next.events = 'Choose at least one event.'
    setErrors(next)
    if (Object.keys(next).length) return
    setHooks((list) => [...list, { id: `wh_${list.length + 1}`, url, events, enabled: true, lastDelivery: null, successRate: null }])
    toast({ title: 'Endpoint added' })
    setAdding(false)
  }

  return (
    <SettingsShell
      title="Webhooks"
      description="Beacon sends a POST request to these addresses when events happen."
      actions={
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setErrors({})
            setAdding(true)
          }}
        >
          <Icon name="plus" size={16} />
          Add endpoint
        </button>
      }
    >
      <div className="stack-lg">
        {hooks.map((hook) => (
          <Card
            key={hook.id}
            title={<span className="mono break">{hook.url}</span>}
            actions={
              <Switch
                checked={hook.enabled}
                label={`${hook.url} enabled`}
                onChange={(enabled) => setHooks((list) => list.map((h) => (h.id === hook.id ? { ...h, enabled } : h)))}
              />
            }
          >
            <ul className="rule-chips">
              {hook.events.map((e) => (
                <li key={e}>
                  <span className="code-chip">{e}</span>
                </li>
              ))}
            </ul>
            <div className="card-foot">
              <span className="muted small">
                {hook.lastDelivery ? (
                  <>
                    Last delivery {formatDate(hook.lastDelivery.at)}:{' '}
                    <StatusBadge tone={hook.lastDelivery.status < 300 ? 'good' : 'bad'} label={`HTTP ${hook.lastDelivery.status}`} /> · {hook.successRate}% delivered in 30 days
                  </>
                ) : (
                  'No deliveries yet'
                )}
              </span>
              <button type="button" className="btn btn-ghost btn-sm" disabled={!hook.enabled} onClick={() => toast({ title: 'Test event sent', description: hook.url, tone: 'info' })}>
                Send test event
              </button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add an endpoint">
        <form className="stack" onSubmit={add} noValidate>
          <div className="field">
            <label htmlFor="wh-url">Endpoint URL</label>
            <input className="input" id="wh-url" name="url" placeholder="https://example.com/beacon" aria-invalid={Boolean(errors.url)} aria-describedby="wh-url-error" />
            {errors.url && (
              <span id="wh-url-error" className="field-error">
                {errors.url}
              </span>
            )}
          </div>
          <fieldset className="field">
            <legend>Events</legend>
            <div className="check-grid">
              {WEBHOOK_EVENTS.map((e) => (
                <label key={e} className="check">
                  <input type="checkbox" name="events" value={e} />
                  <span className="mono">{e}</span>
                </label>
              ))}
            </div>
            {errors.events && <span className="field-error">{errors.events}</span>}
          </fieldset>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setAdding(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add endpoint
            </button>
          </div>
        </form>
      </Modal>
    </SettingsShell>
  )
}
