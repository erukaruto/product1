import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Avatar, Card, PageHeader, StatusBadge, useToast } from '../components/ui.tsx'
import DataTable, { type Column } from '../components/DataTable.tsx'
import Icon from '../components/Icon.tsx'
import { customers, STATUS_LABELS } from '../data/customers.ts'
import { downloadText, formatDate, formatMoney, toCsv } from '../lib/format.ts'
import { usePageTitle } from '../lib/hooks.ts'
import type { Customer, CustomerStatus } from '../types.ts'

const FILTERS: Array<CustomerStatus | 'all'> = ['all', 'active', 'trial', 'past_due', 'canceled']

const COLUMNS: Column<Customer>[] = [
  {
    key: 'company',
    header: 'Customer',
    sortValue: (c) => c.company,
    cell: (c) => (
      <Link className="person-cell" to={`/customers/${c.id}`}>
        <Avatar name={c.company} size={32} />
        <span>
          <strong>{c.company}</strong>
          <small>{c.email}</small>
        </span>
      </Link>
    ),
  },
  { key: 'plan', header: 'Plan', sortValue: (c) => c.plan, cell: (c) => c.plan },
  { key: 'status', header: 'Status', sortValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} label={STATUS_LABELS[c.status]} /> },
  { key: 'mrr', header: 'MRR', align: 'right', sortValue: (c) => c.mrr, cell: (c) => (c.mrr ? formatMoney(c.mrr) : <span className="muted">$0</span>) },
  { key: 'country', header: 'Country', sortValue: (c) => c.country, cell: (c) => <span className="muted">{c.country}</span> },
  { key: 'joined', header: 'Joined', sortValue: (c) => c.joined, cell: (c) => <span className="muted">{formatDate(c.joined)}</span> },
]

export default function Customers() {
  usePageTitle('Customers')
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const status = (params.get('status') ?? 'all') as CustomerStatus | 'all'
  const [selected, setSelected] = useState<Set<string>>(new Set())

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(params)
    if (!value || value === 'all') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return customers
      .filter((c) => status === 'all' || c.status === status)
      .filter((c) => !needle || [c.company, c.name, c.email].some((field) => field.toLowerCase().includes(needle)))
  }, [query, status])

  const counts = useMemo(() => customers.reduce<Record<string, number>>((acc, c) => ({ ...acc, [c.status]: (acc[c.status] ?? 0) + 1 }), {}), [])

  function exportCsv() {
    const rows = selected.size ? filtered.filter((c) => selected.has(c.id)) : filtered
    const csv = toCsv(
      ['id', 'company', 'contact', 'email', 'plan', 'status', 'seats', 'mrr', 'country', 'joined'],
      rows.map((c) => [c.id, c.company, c.name, c.email, c.plan, STATUS_LABELS[c.status], c.seats, c.mrr, c.country, c.joined.toISOString().slice(0, 10)])
    )
    downloadText('beacon-customers.csv', csv)
    toast({ title: `Exported ${rows.length} customers` })
  }

  return (
    <>
      <PageHeader
        title="Customers"
        description={`${customers.length} accounts in this demo workspace.`}
        actions={
          <>
          <Link className="btn btn-ghost" to="/customers/import">
            <Icon name="upload" size={16} />
            Import
          </Link>
          <button type="button" className="btn btn-secondary" onClick={exportCsv}>
            <Icon name="download" size={16} />
            {selected.size ? `Export ${selected.size} selected` : 'Export CSV'}
          </button>
          </>
        }
      />

      <Card flush>
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={18} />
            <label className="sr-only" htmlFor="customer-search">
              Search customers
            </label>
            <input
              id="customer-search"
              className="input"
              type="search"
              placeholder="Search by company, name or email"
              value={query}
              onChange={(event) => updateParam('q', event.target.value)}
            />
          </div>
          <div className="segmented" role="group" aria-label="Filter by status">
            {FILTERS.map((value) => (
              <button key={value} type="button" aria-pressed={status === value} onClick={() => updateParam('status', value)}>
                {value === 'all' ? 'All' : STATUS_LABELS[value]}
                <span className="count">{value === 'all' ? customers.length : (counts[value] ?? 0)}</span>
              </button>
            ))}
          </div>
        </div>
        <DataTable
          label="Customers"
          rows={filtered}
          columns={COLUMNS}
          rowKey={(c) => c.id}
          initialSort={{ key: 'mrr', direction: 'desc' }}
          selectable
          selected={selected}
          onSelectedChange={setSelected}
          emptyTitle="No customers match your filters"
          emptyText="Try a different search term or status."
        />
      </Card>
    </>
  )
}
