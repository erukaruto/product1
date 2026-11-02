import { useState } from 'react'
import { Link } from 'react-router'
import { Card, PageHeader, StatCard, Switch, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { ALERT_EVENTS, alertRules, CHANNEL_LABELS, type AlertRule } from '../../data/workspace.ts'
import { formatDate } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export function describeTrigger(rule: Pick<AlertRule, 'event' | 'threshold'>): string {
  const event = ALERT_EVENTS[rule.event]
  return rule.threshold != null && event.unit ? `${event.label} ${rule.threshold}${event.unit === '%' ? '%' : ` ${event.unit}`}` : event.label
}

export default function AlertRules() {
  usePageTitle('Alert rules')
  const toast = useToast()
  const [rules, setRules] = useState(alertRules)
  const active = rules.filter((r) => r.enabled)
  const sent = rules.reduce((sum, r) => sum + r.triggered30d, 0)

  return (
    <>
      <PageHeader
        title="Alert rules"
        description="Who gets told, and when, about changes in your revenue."
        actions={
          <Link className="btn btn-primary" to="/alerts/new">
            <Icon name="plus" size={16} />
            New rule
          </Link>
        }
      />
      <div className="stats stats-3">
        <StatCard label="Active rules" value={active.length} note={`of ${rules.length}`} />
        <StatCard label="Alerts sent, 30 days" value={sent} />
        <StatCard label="Channels in use" value={new Set(active.flatMap((r) => r.channels)).size} note="Email, Slack, webhook" />
      </div>
      <Card flush>
        <ul className="rule-list">
          {rules.map((rule) => (
            <li key={rule.id}>
              <div>
                <Link className="row-link" to={`/alerts/${rule.id}`}>
                  {rule.name}
                </Link>
                <small className="muted">
                  When {describeTrigger(rule).toLowerCase()} · {rule.channels.map((c) => CHANNEL_LABELS[c]).join(', ')} to {rule.recipients}
                </small>
              </div>
              <span className="muted small rule-meta">
                {rule.lastTriggered ? `Last sent ${formatDate(rule.lastTriggered)}` : 'Never sent'} · {rule.triggered30d} in 30 days
              </span>
              <Switch
                checked={rule.enabled}
                label={`${rule.name} enabled`}
                onChange={(enabled) => {
                  setRules((list) => list.map((r) => (r.id === rule.id ? { ...r, enabled } : r)))
                  toast({ title: `${rule.name} ${enabled ? 'turned on' : 'paused'}`, tone: enabled ? 'good' : 'info' })
                }}
              />
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
