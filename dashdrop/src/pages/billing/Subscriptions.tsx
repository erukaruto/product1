import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Card, PageHeader, StatCard, StatusBadge, Tabs } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import { subscriptions, SUBSCRIPTION_STATUS_LABELS } from '../../data/billing.ts'
import { formatDate, formatMoney, formatNumber } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { Subscription, SubscriptionStatus } from '../../types.ts'

type Filter = SubscriptionStatus | 'all'

const COLUMNS: Column<Subscription>[] = [
  {
    key: 'customer',
    header: 'Customer',
    sortValue: (s) => s.customer,
    cell: (s) => (
      <Link className="row-link" to={`/subscriptions/${s.id}`}>
        {s.customer}
      </Link>
    ),
  },
  { key: 'plan', header: 'Plan', sortValue: (s) => s.plan, cell: (s) => s.plan },
  { key: 'interval', header: 'Billing', sortValue: (s) => s.interval, cell: (s) => <span className="muted">{s.interval === 'yearly' ? 'Yearly' : 'Monthly'}</span> },
  { key: 'seats', header: 'Seats', align: 'right', sortValue: (s) => s.seats, cell: (s) => s.seats },
  { key: 'mrr', header: 'MRR', align: 'right', sortValue: (s) => s.mrr, cell: (s) => (s.mrr ? formatMoney(s.mrr) : <span className="muted">$0</span>) },
  { key: 'status', header: 'Status', sortValue: (s) => s.status, cell: (s) => <StatusBadge status={s.status} label={SUBSCRIPTION_STATUS_LABELS[s.status]} /> },
  {
    key: 'renews',
    header: 'Renews',
    sortValue: (s) => s.renews ?? new Date(0),
    cell: (s) => <span className="muted">{s.renews ? formatDate(s.renews) : s.canceled ? `Ended ${formatDate(s.canceled)}` : '-'}</span>,
  },
]

export default function Subscriptions() {
  usePageTitle('Subscriptions')
  const [filter, setFilter] = useState<Filter>('all')
  const count = (status: SubscriptionStatus) => subscriptions.filter((s) => s.status === status).length
  const rows = useMemo(() => (filter === 'all' ? subscriptions : subscriptions.filter((s) => s.status === filter)), [filter])
  const mrr = subscriptions.reduce((sum, s) => sum + s.mrr, 0)
  const yearly = subscriptions.filter((s) => s.interval === 'yearly' && s.status !== 'canceled').length

  return (
    <>
      <PageHeader title="Subscriptions" description={`${subscriptions.length} subscriptions in this demo workspace.`} />
      <div className="stats">
        <StatCard label="Active" value={formatNumber(count('active'))} note={`${formatMoney(mrr)} MRR in this list`} />
        <StatCard label="Trialing" value={formatNumber(count('trialing'))} note="14-day trials" />
        <StatCard label="Past due" value={formatNumber(count('past_due'))} note="Payment retries running" />
        <StatCard label="Billed yearly" value={formatNumber(yearly)} note="Pay 10 months, get 12" />
      </div>
      <Card flush>
        <div className="toolbar">
          <Tabs<Filter>
            label="Subscription status"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All', count: subscriptions.length },
              { id: 'active', label: 'Active', count: count('active') },
              { id: 'trialing', label: 'Trialing', count: count('trialing') },
              { id: 'past_due', label: 'Past due', count: count('past_due') },
              { id: 'canceled', label: 'Canceled', count: count('canceled') },
            ]}
          />
        </div>
        <DataTable label="Subscriptions" rows={rows} columns={COLUMNS} rowKey={(s) => s.id} initialSort={{ key: 'mrr', direction: 'desc' }} emptyTitle="No subscriptions with this status" />
      </Card>
    </>
  )
}
