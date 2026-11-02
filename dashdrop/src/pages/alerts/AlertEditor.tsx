import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { Card, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { ALERT_EVENTS, CHANNEL_LABELS, getAlertRule, type AlertChannel, type AlertEvent } from '../../data/workspace.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { PlanName } from '../../types.ts'
import { describeTrigger } from './AlertRules.tsx'

const PLANS: PlanName[] = ['Starter', 'Growth', 'Scale']

/* Create or edit an alert rule. UI only: saving shows a toast. */
export default function AlertEditor() {
  const { id } = useParams()
  const existing = getAlertRule(id)
  usePageTitle(existing ? existing.name : 'New alert rule')
  const navigate = useNavigate()
  const toast = useToast()
  const [name, setName] = useState(existing?.name ?? '')
  const [event, setEvent] = useState<AlertEvent>(existing?.event ?? 'payment_failed')
  const [threshold, setThreshold] = useState(String(existing?.threshold ?? 7))
  const [plans, setPlans] = useState<PlanName[]>(existing?.plans ?? PLANS)
  const [channels, setChannels] = useState<AlertChannel[]>(existing?.channels ?? ['email'])
  const [recipients, setRecipients] = useState(existing?.recipients ?? '')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const meta = ALERT_EVENTS[event]

  const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((v) => v !== value) : [...list, value])

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const next: Record<string, string> = {}
    if (!name.trim()) next.name = 'Give the rule a name.'
    if (plans.length === 0) next.plans = 'Choose at least one plan.'
    if (channels.length === 0) next.channels = 'Choose at least one channel.'
    if (!recipients.trim()) next.recipients = 'Add an email address, channel or URL.'
    if (meta.unit && !(Number(threshold) > 0)) next.threshold = 'Enter a number above 0.'
    setErrors(next)
    if (Object.keys(next).length) return
    toast({ title: existing ? 'Rule updated' : 'Rule created', description: name.trim() })
    navigate('/alerts')
  }

  const summary = `When ${describeTrigger({ event, threshold: meta.unit ? Number(threshold) || 0 : null }).toLowerCase()} on ${
    plans.length === 3 ? 'any plan' : plans.join(' or ') || 'no plan'
  }, send ${channels.map((c) => CHANNEL_LABELS[c].toLowerCase()).join(' and ') || 'nothing'} to ${recipients || '...'}.`

  return (
    <>
      <PageHeader
        back={
          <Link className="back-link" to="/alerts">
            <Icon name="arrowLeft" size={16} />
            Alert rules
          </Link>
        }
        title={existing ? `Edit "${existing.name}"` : 'New alert rule'}
      />
      <form className="grid grid-main" onSubmit={onSubmit} noValidate>
        <Card>
          <div className="stack">
            <div className="field">
              <label htmlFor="al-name">Rule name</label>
              <input className="input" id="al-name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={Boolean(errors.name)} aria-describedby="al-name-error" />
              {errors.name && <span id="al-name-error" className="field-error">{errors.name}</span>}
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="al-event">Trigger</label>
                <select className="input" id="al-event" value={event} onChange={(e) => setEvent(e.target.value as AlertEvent)}>
                  {Object.entries(ALERT_EVENTS).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                      {value.unit ? '...' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {meta.unit && (
                <div className="field">
                  <label htmlFor="al-threshold">{meta.thresholdLabel}</label>
                  <div className="input-group">
                    <input className="input" id="al-threshold" type="number" min="1" value={threshold} onChange={(e) => setThreshold(e.target.value)} aria-invalid={Boolean(errors.threshold)} />
                    <span className="input-addon">{meta.unit}</span>
                  </div>
                  {errors.threshold && <span className="field-error">{errors.threshold}</span>}
                </div>
              )}
            </div>
            <fieldset className="field">
              <legend>Plans</legend>
              <div className="choice-row">
                {PLANS.map((plan) => (
                  <label key={plan} className="choice">
                    <input type="checkbox" checked={plans.includes(plan)} onChange={() => setPlans((list) => toggle(list, plan))} />
                    <span>{plan}</span>
                  </label>
                ))}
              </div>
              {errors.plans && <span className="field-error">{errors.plans}</span>}
            </fieldset>
            <fieldset className="field">
              <legend>Send to</legend>
              <div className="choice-row">
                {(Object.keys(CHANNEL_LABELS) as AlertChannel[]).map((channel) => (
                  <label key={channel} className="choice">
                    <input type="checkbox" checked={channels.includes(channel)} onChange={() => setChannels((list) => toggle(list, channel))} />
                    <span>{CHANNEL_LABELS[channel]}</span>
                  </label>
                ))}
              </div>
              {errors.channels && <span className="field-error">{errors.channels}</span>}
            </fieldset>
            <div className="field">
              <label htmlFor="al-recipients">Recipients</label>
              <input
                className="input"
                id="al-recipients"
                placeholder="name@company.example, #channel or https://..."
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                aria-invalid={Boolean(errors.recipients)}
                aria-describedby="al-recipients-error"
              />
              {errors.recipients && <span id="al-recipients-error" className="field-error">{errors.recipients}</span>}
            </div>
          </div>
        </Card>
        <div className="stack-lg sticky-side">
          <Card title="Summary">
            <p className="rule-summary" aria-live="polite" data-testid="rule-summary">
              {summary}
            </p>
            <div className="stack">
              <button type="submit" className="btn btn-primary btn-block">
                {existing ? 'Save rule' : 'Create rule'}
              </button>
              <button type="button" className="btn btn-secondary btn-block" onClick={() => toast({ title: 'Test alert sent', description: recipients || 'No recipients yet', tone: 'info' })}>
                Send a test alert
              </button>
            </div>
          </Card>
        </div>
      </form>
    </>
  )
}
