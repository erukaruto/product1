import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Card, PageHeader, StatCard, StatusBadge, Tabs } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import Icon from '../../components/Icon.tsx'
import { invoices, INVOICE_STATUS_LABELS } from '../../data/invoices.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { Invoice, InvoiceStatus } from '../../types.ts'

type Filter = InvoiceStatus | 'all'

const COLUMNS: Column<Invoice>[] = [
  {
    key: 'id',
    header: 'Invoice',
    sortValue: (i) => i.id,
    cell: (i) => (
      <Link className="row-link mono" to={`/invoices/${i.id}`}>
        {i.id}
      </Link>
    ),
  },
  {
    key: 'customer',
    header: 'Customer',
    sortValue: (i) => i.customer,
    cell: (i) => (
      <Link className="row-link" to={`/customers/${i.customerId}`}>
        {i.customer}
      </Link>
    ),
  },
  { key: 'issued', header: 'Issued', sortValue: (i) => i.issued, cell: (i) => <span className="muted">{formatDate(i.issued)}</span> },
  { key: 'due', header: 'Due', sortValue: (i) => i.due, cell: (i) => <span className="muted">{formatDate(i.due)}</span> },
  { key: 'amount', header: 'Amount', align: 'right', sortValue: (i) => i.amount, cell: (i) => formatMoney(i.amount, true) },
  { key: 'status', header: 'Status', sortValue: (i) => i.status, cell: (i) => <StatusBadge status={i.status} label={INVOICE_STATUS_LABELS[i.status]} /> },
]

export default function Invoices() {
  usePageTitle('Invoices')
  const [tab, setTab] = useState<Filter>('all')

  const totals = useMemo(() => {
    const of = (status: InvoiceStatus) => invoices.filter((i) => i.status === status)
    return (['paid', 'open', 'overdue'] as const).reduce(
      (acc, status) => ({ ...acc, [status]: { amount: of(status).reduce((sum, i) => sum + i.amount, 0), count: of(status).length } }),
      {} as Record<InvoiceStatus, { amount: number; count: number }>
    )
  }, [])

  const rows = useMemo(() => (tab === 'all' ? invoices : invoices.filter((invoice) => invoice.status === tab)), [tab])

  return (
    <>
      <PageHeader
        title="Invoices"
        description="August to October 2026."
        actions={
          <Link className="btn btn-primary" to="/invoices/new">
            <Icon name="plus" size={16} />
            New invoice
          </Link>
        }
      />

      <div className="stats stats-3">
        <StatCard label="Paid" value={formatMoney(totals.paid.amount, true)} note={`${totals.paid.count} invoices`} />
        <StatCard label="Open" value={formatMoney(totals.open.amount, true)} note={`${totals.open.count} invoices, not yet due`} />
        <StatCard label="Overdue" value={formatMoney(totals.overdue.amount, true)} note={`${totals.overdue.count} invoices`} />
      </div>

      <Card flush>
        <div className="toolbar">
          <Tabs<Filter>
            label="Invoice status"
            value={tab}
            onChange={setTab}
            tabs={[
              { id: 'all', label: 'All', count: invoices.length },
              { id: 'paid', label: 'Paid', count: totals.paid.count },
              { id: 'open', label: 'Open', count: totals.open.count },
              { id: 'overdue', label: 'Overdue', count: totals.overdue.count },
            ]}
          />
        </div>
        <DataTable label="Invoices" rows={rows} columns={COLUMNS} rowKey={(i) => i.id} pageSize={12} emptyTitle="No invoices with this status" />
      </Card>
    </>
  )
}
