import { Link, useParams } from 'react-router'
import { Avatar, Card, EmptyState, KeyValue, PageHeader, StatCard, StatusBadge } from '../components/ui.tsx'
import Icon from '../components/Icon.tsx'
import { getCustomer, STATUS_LABELS } from '../data/customers.ts'
import { invoicesFor, INVOICE_STATUS_LABELS } from '../data/invoices.ts'
import { subscriptionFor } from '../data/billing.ts'
import { TODAY } from '../data/metrics.ts'
import { formatDate, formatMoney } from '../lib/format.ts'
import { usePageTitle } from '../lib/hooks.ts'

function monthsBetween(start: Date, end: Date): number {
  return Math.max(1, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth())
}

export default function CustomerDetail() {
  const { id } = useParams()
  const customer = getCustomer(id)
  usePageTitle(customer ? customer.company : 'Customer not found')

  const back = (
    <Link className="back-link" to="/customers">
      <Icon name="arrowLeft" size={16} />
      Customers
    </Link>
  )

  if (!customer) {
    return (
      <>
        <PageHeader title="Customer not found" back={back} />
        <Card>
          <EmptyState
            title={`No customer with the ID "${id}"`}
            action={
              <Link className="text-link" to="/customers">
                Back to customers
              </Link>
            }
          />
        </Card>
      </>
    )
  }

  const customerInvoices = invoicesFor(customer.id)
  const subscription = subscriptionFor(customer.id)
  const paidTotal = customerInvoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const tenure = monthsBetween(customer.joined, TODAY)
  const latest = customerInvoices[0]

  const timeline = [
    customer.status === 'past_due' && { title: 'Payment failed', detail: `Card declined for ${formatMoney(customer.listMrr)}`, date: 'Oct 29, 2026' },
    customer.status === 'canceled' && { title: 'Subscription canceled', detail: 'Reason given: "Moving to an in-house tool"', date: 'Oct 30, 2026' },
    { title: 'Last active', detail: `${customer.name} signed in`, date: formatDate(customer.lastSeen) },
    latest && { title: `Invoice ${latest.id}`, detail: `${formatMoney(latest.amount, true)}, ${INVOICE_STATUS_LABELS[latest.status].toLowerCase()}`, date: formatDate(latest.issued) },
    { title: `Started ${customer.status === 'trial' ? 'a trial' : `on ${customer.plan}`}`, detail: `${customer.seats} ${customer.seats === 1 ? 'seat' : 'seats'}`, date: formatDate(customer.joined) },
  ].filter((event): event is { title: string; detail: string; date: string } => Boolean(event))

  return (
    <>
      <PageHeader
        back={back}
        title={
          <span className="title-with-avatar">
            <Avatar name={customer.company} size={40} />
            {customer.company}
          </span>
        }
        description={`${customer.name} · ${customer.email}`}
        actions={
          <>
            <StatusBadge status={customer.status} label={STATUS_LABELS[customer.status]} />
            <Link className="btn btn-secondary" to={`/customers/${customer.id}/edit`}>
              <Icon name="edit" size={16} />
              Edit
            </Link>
            <a className="btn btn-secondary" href={`mailto:${customer.email}`}>
              <Icon name="mail" size={16} />
              Email
            </a>
          </>
        }
      />

      <div className="stats">
        <StatCard label="MRR" value={formatMoney(customer.mrr)} note={`${customer.plan} plan`} />
        <StatCard label="Paid to date" value={formatMoney(paidTotal, true)} note="Last 3 months" />
        <StatCard label="Seats" value={customer.seats} note={customer.plan === 'Starter' ? 'Starter includes 1 seat' : 'Billed per seat'} />
        <StatCard label="Customer for" value={customer.status === 'trial' ? 'Trial' : `${tenure} ${tenure === 1 ? 'month' : 'months'}`} note={`Since ${formatDate(customer.joined)}`} />
      </div>

      <div className="grid grid-main">
        <Card title="Invoices" flush>
          {customerInvoices.length === 0 ? (
            <EmptyState title="No invoices yet" icon="invoices">
              Trial accounts get their first invoice when the trial ends.
            </EmptyState>
          ) : (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Invoice</th>
                    <th scope="col">Issued</th>
                    <th scope="col">Due</th>
                    <th scope="col" className="num">
                      Amount
                    </th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {customerInvoices.map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="mono">
                        <Link className="row-link" to={`/invoices/${invoice.id}`}>
                          {invoice.id}
                        </Link>
                      </td>
                      <td className="muted">{formatDate(invoice.issued)}</td>
                      <td className="muted">{formatDate(invoice.due)}</td>
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

        <div className="stack-lg">
          <Card title="Details">
            <KeyValue
              items={[
                { label: 'Contact', value: customer.name },
                { label: 'Email', value: customer.email },
                {
                  label: 'Subscription',
                  value: subscription ? (
                    <Link className="text-link" to={`/subscriptions/${subscription.id}`}>
                      {customer.plan}, {subscription.interval}
                    </Link>
                  ) : (
                    customer.plan
                  ),
                },
                { label: 'Country', value: customer.country },
                { label: 'Customer ID', value: <span className="mono">{customer.id}</span> },
              ]}
            />
          </Card>
          <Card title="Timeline">
            <ol className="timeline">
              {timeline.map((event) => (
                <li key={event.title}>
                  <strong>{event.title}</strong>
                  <span>{event.detail}</span>
                  <time>{event.date}</time>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  )
}
