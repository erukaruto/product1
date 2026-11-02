import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { Card, EmptyState, KeyValue, Modal, PageHeader, StatusBadge, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { getSubscription, plans, SUBSCRIPTION_STATUS_LABELS } from '../../data/billing.ts'
import { getCustomer } from '../../data/customers.ts'
import { invoicesFor, INVOICE_STATUS_LABELS } from '../../data/invoices.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { PlanName } from '../../types.ts'

export default function SubscriptionDetail() {
  const { id } = useParams()
  const subscription = getSubscription(id)
  const customer = getCustomer(subscription?.customerId)
  usePageTitle(subscription ? `${subscription.customer} subscription` : 'Subscription not found')
  const toast = useToast()
  const [changeOpen, setChangeOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [newPlan, setNewPlan] = useState<PlanName>(subscription?.plan ?? 'Growth')
  const [status, setStatus] = useState(subscription?.status)

  const back = (
    <Link className="back-link" to="/subscriptions">
      <Icon name="arrowLeft" size={16} />
      Subscriptions
    </Link>
  )

  if (!subscription || !customer || !status) {
    return (
      <>
        <PageHeader title="Subscription not found" back={back} />
        <Card>
          <EmptyState title={`No subscription with the ID "${id}"`} />
        </Card>
      </>
    )
  }

  const plan = plans.find((p) => p.name === subscription.plan)
  const upcoming = subscription.renews && status !== 'canceled'

  return (
    <>
      <PageHeader
        back={back}
        title={subscription.customer}
        description={
          <>
            <span className="mono">{subscription.id}</span> · {subscription.plan} plan, billed {subscription.interval}
          </>
        }
        actions={
          <>
            <StatusBadge status={status} label={SUBSCRIPTION_STATUS_LABELS[status]} />
            <button type="button" className="btn btn-secondary" disabled={status === 'canceled'} onClick={() => setChangeOpen(true)}>
              Change plan
            </button>
            <button type="button" className="btn btn-danger-ghost" disabled={status === 'canceled'} onClick={() => setCancelOpen(true)}>
              Cancel
            </button>
          </>
        }
      />

      <div className="grid grid-main">
        <div className="stack-lg">
          <Card title="Plan">
            <div className="plan-summary">
              <div>
                <strong>{subscription.plan}</strong>
                <span className="muted">{plan?.description}</span>
              </div>
              <div className="plan-price">
                <strong>{formatMoney(subscription.amount)}</strong>
                <span className="muted">per {subscription.interval === 'yearly' ? 'year' : 'month'}</span>
              </div>
            </div>
            <KeyValue
              items={[
                { label: 'Seats', value: subscription.seats },
                { label: 'MRR', value: formatMoney(subscription.mrr) },
                { label: 'Started', value: formatDate(subscription.started) },
                { label: status === 'canceled' ? 'Ended' : 'Next renewal', value: status === 'canceled' ? formatDate(subscription.canceled ?? new Date()) : subscription.renews ? formatDate(subscription.renews) : '-' },
              ]}
            />
          </Card>
          <Card title="Invoices" flush>
            {invoicesFor(customer.id).length === 0 ? (
              <EmptyState title="No invoices yet" icon="invoices">
                The first invoice is created when the trial ends.
              </EmptyState>
            ) : (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th scope="col">Invoice</th>
                      <th scope="col">Issued</th>
                      <th scope="col" className="num">
                        Amount
                      </th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoicesFor(customer.id).map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="mono">
                          <Link className="row-link" to={`/invoices/${invoice.id}`}>
                            {invoice.id}
                          </Link>
                        </td>
                        <td className="muted">{formatDate(invoice.issued)}</td>
                        <td className="num">{formatMoney(invoice.amount, true)}</td>
                        <td>
                          <StatusBadge status={invoice.status} label={INVOICE_STATUS_LABELS[invoice.status]} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
        <div className="stack-lg">
          <Card title="Customer">
            <KeyValue
              items={[
                {
                  label: 'Company',
                  value: (
                    <Link className="text-link" to={`/customers/${customer.id}`}>
                      {customer.company}
                    </Link>
                  ),
                },
                { label: 'Billing contact', value: customer.name },
                { label: 'Email', value: customer.email },
                { label: 'Country', value: customer.country },
              ]}
            />
          </Card>
          <Card title="Upcoming invoice">
            {upcoming && subscription.renews ? (
              <KeyValue
                items={[
                  { label: 'Date', value: formatDate(subscription.renews) },
                  { label: 'Amount', value: formatMoney(subscription.amount, true) },
                  { label: 'Payment method', value: 'Card on file' },
                ]}
              />
            ) : (
              <p className="muted">No upcoming invoice.</p>
            )}
          </Card>
        </div>
      </div>

      <Modal
        open={changeOpen}
        onClose={() => setChangeOpen(false)}
        title="Change plan"
        description={`${subscription.customer} is on ${subscription.plan}. The new price applies from the next renewal.`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setChangeOpen(false)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              disabled={newPlan === subscription.plan}
              onClick={() => {
                setChangeOpen(false)
                toast({ title: 'Plan change scheduled', description: `${subscription.customer} moves to ${newPlan} on the next renewal.` })
              }}
            >
              Schedule change
            </button>
          </>
        }
      >
        <div className="option-cards" role="radiogroup" aria-label="Plan">
          {plans.map((option) => (
            <button key={option.name} type="button" role="radio" aria-checked={newPlan === option.name} className="option-card" onClick={() => setNewPlan(option.name)}>
              <span>
                <strong>
                  {option.name}
                  {option.name === subscription.plan ? ' (current)' : ''}
                </strong>
                <small>
                  {formatMoney(option.monthly)} per month{option.seatPrice ? `, ${formatMoney(option.seatPrice)} per extra seat` : ''}
                </small>
              </span>
            </button>
          ))}
        </div>
      </Modal>

      <Modal
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        size="sm"
        title="Cancel this subscription?"
        description={`${subscription.customer} keeps access until the end of the current period. This can't be undone from the demo.`}
        footer={
          <>
            <button type="button" className="btn btn-ghost" onClick={() => setCancelOpen(false)}>
              Keep subscription
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                setCancelOpen(false)
                setStatus('canceled')
                toast({ title: 'Subscription canceled', tone: 'info' })
              }}
            >
              Cancel subscription
            </button>
          </>
        }
      />
    </>
  )
}
