import { useState, type FormEvent } from 'react'
import { Card, Dropdown, Modal, PageHeader, Segmented, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { plans as initialPlans } from '../../data/billing.ts'
import { formatMoney, formatNumber } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { PlanDefinition } from '../../types.ts'

type Interval = 'monthly' | 'yearly'

export default function Plans() {
  usePageTitle('Plans & prices')
  const toast = useToast()
  const [plans, setPlans] = useState(initialPlans)
  const [interval, setBillingInterval] = useState<Interval>('monthly')
  const [editing, setEditing] = useState<PlanDefinition | null>(null)

  function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const data = new FormData(event.currentTarget)
    const monthly = Number(data.get('monthly'))
    const seatPrice = Number(data.get('seatPrice'))
    setPlans((list) => list.map((p) => (p.name === editing.name ? { ...p, description: String(data.get('description')), monthly, yearly: monthly * 10, seatPrice } : p)))
    toast({ title: `${editing.name} updated`, description: 'New prices apply to new subscriptions. Existing customers keep their price.' })
    setEditing(null)
  }

  return (
    <>
      <PageHeader
        title="Plans & prices"
        description="What customers can buy. Yearly prices are 10 months for 12."
        actions={
          <Segmented<Interval>
            label="Billing period"
            value={interval}
            onChange={setBillingInterval}
            options={[
              { id: 'monthly', label: 'Monthly' },
              { id: 'yearly', label: 'Yearly' },
            ]}
          />
        }
      />
      <div className="plan-grid">
        {plans.map((plan) => (
          <Card
            key={plan.name}
            title={plan.name}
            description={plan.description}
            actions={
              <Dropdown
                label={`Actions for ${plan.name}`}
                items={[
                  { label: 'Edit plan', icon: 'edit', onSelect: () => setEditing(plan) },
                  { label: 'Copy checkout link', icon: 'link', onSelect: () => toast({ title: 'Checkout link copied' }) },
                  { label: 'Archive plan', icon: 'trash', danger: true, onSelect: () => toast({ title: `${plan.name} can't be archived`, description: `${formatNumber(plan.customers)} customers are on it.`, tone: 'bad' }) },
                ]}
              />
            }
          >
            <div className="plan-price big">
              <strong>{formatMoney(interval === 'monthly' ? plan.monthly : plan.yearly)}</strong>
              <span className="muted">per {interval === 'monthly' ? 'month' : 'year'}</span>
            </div>
            <p className="muted small">{plan.seatPrice ? `${formatMoney(plan.seatPrice)} per extra seat per month` : '1 seat included, no extra seats'}</p>
            <div className="plan-stats">
              <div>
                <span className="muted">Customers</span>
                <strong>{formatNumber(plan.customers)}</strong>
              </div>
              <div>
                <span className="muted">MRR</span>
                <strong>{formatMoney(plan.mrr)}</strong>
              </div>
            </div>
            <ul className="feature-list">
              {plan.features.map((feature) => (
                <li key={feature}>
                  <Icon name="check" size={16} />
                  {feature}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Modal
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing ? `Edit ${editing.name}` : ''}
        description="Changes apply to new subscriptions. Existing customers keep their current price."
      >
        {editing && (
          <form className="stack" onSubmit={save}>
            <div className="field">
              <label htmlFor="plan-description">Description</label>
              <input className="input" id="plan-description" name="description" defaultValue={editing.description} required />
            </div>
            <div className="form-grid">
              <div className="field">
                <label htmlFor="plan-monthly">Monthly price (USD)</label>
                <input className="input" id="plan-monthly" name="monthly" type="number" min="0" step="1" defaultValue={editing.monthly} required />
              </div>
              <div className="field">
                <label htmlFor="plan-seat">Price per extra seat (USD)</label>
                <input className="input" id="plan-seat" name="seatPrice" type="number" min="0" step="1" defaultValue={editing.seatPrice} required />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Save plan
              </button>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
