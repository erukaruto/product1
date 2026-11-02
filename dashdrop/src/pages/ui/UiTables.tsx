import { useMemo, useState } from 'react'
import { Card, PageHeader, StatusBadge, useToast } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import Icon from '../../components/Icon.tsx'
import { customers, STATUS_LABELS } from '../../data/customers.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { Customer } from '../../types.ts'

const COLUMNS: Column<Customer>[] = [
  { key: 'company', header: 'Company', sortValue: (c) => c.company, cell: (c) => <strong className="weight-500">{c.company}</strong> },
  { key: 'plan', header: 'Plan', sortValue: (c) => c.plan, cell: (c) => c.plan },
  { key: 'seats', header: 'Seats', align: 'right', sortValue: (c) => c.seats, cell: (c) => c.seats },
  { key: 'mrr', header: 'MRR', align: 'right', sortValue: (c) => c.mrr, cell: (c) => formatMoney(c.mrr) },
  { key: 'status', header: 'Status', sortValue: (c) => c.status, cell: (c) => <StatusBadge status={c.status} label={STATUS_LABELS[c.status]} /> },
]

export default function UiTables() {
  usePageTitle('Tables')
  const toast = useToast()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [query, setQuery] = useState('')
  const rows = useMemo(() => customers.filter((c) => c.company.toLowerCase().includes(query.trim().toLowerCase())), [query])

  return (
    <>
      <PageHeader title="Tables" description="<DataTable> handles sorting, pagination and selection. Pages pass in already-filtered rows." />

      <Card title="Sortable table with selection" flush>
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={18} />
            <label className="sr-only" htmlFor="table-search">
              Filter by company
            </label>
            <input id="table-search" className="input" type="search" placeholder="Filter by company" value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          {selected.size > 0 && (
            <div className="bulk-bar" role="status">
              <span>{selected.size} selected</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => toast({ title: `Tagged ${selected.size} customers` })}>
                Add tag
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelected(new Set())}>
                Clear
              </button>
            </div>
          )}
        </div>
        <DataTable label="Example customers" rows={rows} columns={COLUMNS} rowKey={(c) => c.id} pageSize={8} selectable selected={selected} onSelectedChange={setSelected} initialSort={{ key: 'company', direction: 'asc' }} />
      </Card>

      <div className="grid grid-2">
        <Card title="Compact table" flush>
          <div className="table-scroll">
            <table className="table compact">
              <thead>
                <tr>
                  <th scope="col">Plan</th>
                  <th scope="col" className="num">Customers</th>
                  <th scope="col" className="num">Price</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Starter</td>
                  <td className="num">647</td>
                  <td className="num">$19</td>
                </tr>
                <tr>
                  <td>Growth</td>
                  <td className="num">577</td>
                  <td className="num">$49</td>
                </tr>
                <tr>
                  <td>Scale</td>
                  <td className="num">60</td>
                  <td className="num">$129</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
        <Card title="Empty table" flush>
          <DataTable label="Empty example" rows={[] as Customer[]} columns={COLUMNS} rowKey={(c) => c.id} emptyTitle="No customers yet" emptyText="Customers appear here after your first import." />
        </Card>
      </div>
    </>
  )
}
