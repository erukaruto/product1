import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, Dropdown, PageHeader, StatCard, StatusBadge, Tabs, useToast } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import { payments, PAYMENT_STATUS_LABELS } from '../../data/billing.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { Payment, PaymentStatus } from '../../types.ts'

type Filter = PaymentStatus | 'all'

export default function Payments() {
  usePageTitle('Payments')
  const toast = useToast()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('all')
  const rows = useMemo(() => (filter === 'all' ? payments : payments.filter((p) => p.status === filter)), [filter])
  const count = (status: PaymentStatus) => payments.filter((p) => p.status === status).length
  const since = new Date(TODAY.getTime() - 30 * 86400000)
  const collected = payments.filter((p) => p.status === 'succeeded' && p.date >= since).reduce((sum, p) => sum + p.amount, 0)
  const failed = payments.filter((p) => p.status === 'failed').reduce((sum, p) => sum + p.amount, 0)
  const refunded = payments.filter((p) => p.status === 'refunded').reduce((sum, p) => sum + p.amount, 0)

  const columns: Column<Payment>[] = [
    { key: 'id', header: 'Payment', sortValue: (p) => p.id, cell: (p) => <span className="mono">{p.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      sortValue: (p) => p.customer,
      cell: (p) => (
        <Link className="row-link" to={`/customers/${p.customerId}`}>
          {p.customer}
        </Link>
      ),
    },
    { key: 'amount', header: 'Amount', align: 'right', sortValue: (p) => p.amount, cell: (p) => formatMoney(p.amount, true) },
    { key: 'method', header: 'Method', sortValue: (p) => p.method, cell: (p) => <span className="muted">{p.method}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (p) => p.status,
      cell: (p) => (
        <span className="status-with-note">
          <StatusBadge status={p.status} label={PAYMENT_STATUS_LABELS[p.status]} />
          {p.failureReason && <small className="muted">{p.failureReason}</small>}
        </span>
      ),
    },
    { key: 'date', header: 'Date', sortValue: (p) => p.date, cell: (p) => <span className="muted">{formatDate(p.date)}</span> },
    {
      key: 'actions',
      header: '',
      cell: (p) => (
        <Dropdown
          label={`Actions for ${p.id}`}
          items={[
            { label: 'View invoice', icon: 'invoices', onSelect: () => navigate(`/invoices/${p.invoiceId}`) },
            { label: 'Retry payment', icon: 'refresh', disabled: p.status !== 'failed', onSelect: () => toast({ title: 'Retry scheduled', description: `${p.customer}, ${formatMoney(p.amount, true)}.` }) },
            { label: 'Refund', icon: 'repeat', danger: true, disabled: p.status !== 'succeeded', onSelect: () => toast({ title: 'Refund started', description: 'It can take 5 to 10 days to reach the customer.', tone: 'info' }) },
          ]}
        />
      ),
    },
  ]

  return (
    <>
      <PageHeader title="Payments" description="Card and bank payments for subscription invoices." />
      <div className="stats stats-3">
        <StatCard label="Collected, last 30 days" value={formatMoney(collected, true)} />
        <StatCard label="Failed" value={formatMoney(failed, true)} note={`${count('failed')} payments to retry`} />
        <StatCard label="Refunded" value={formatMoney(refunded, true)} note={`${count('refunded')} payments`} />
      </div>
      <Card flush>
        <div className="toolbar">
          <Tabs<Filter>
            label="Payment status"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All', count: payments.length },
              { id: 'succeeded', label: 'Succeeded', count: count('succeeded') },
              { id: 'failed', label: 'Failed', count: count('failed') },
              { id: 'refunded', label: 'Refunded', count: count('refunded') },
            ]}
          />
        </div>
        <DataTable label="Payments" rows={rows} columns={columns} rowKey={(p) => p.id} initialSort={{ key: 'date', direction: 'desc' }} emptyTitle="No payments with this status" />
      </Card>
    </>
  )
}
