import { useMemo, useState } from 'react'
import { Card, PageHeader, StatusBadge, Tabs, useToast } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import Icon from '../../components/Icon.tsx'
import { auditLog, type AuditEvent } from '../../data/workspace.ts'
import { downloadText, toCsv } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Filter = 'all' | AuditEvent['category']

const time = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZone: 'UTC' })

const COLUMNS: Column<AuditEvent>[] = [
  { key: 'at', header: 'Time (UTC)', sortValue: (e) => e.at, cell: (e) => <span className="muted">{time.format(e.at)}</span> },
  { key: 'actor', header: 'Member', sortValue: (e) => e.actor, cell: (e) => e.actor },
  { key: 'action', header: 'Action', sortValue: (e) => e.action, cell: (e) => <strong className="weight-500">{e.action}</strong> },
  { key: 'target', header: 'Details', cell: (e) => <span className="muted">{e.target}</span> },
  { key: 'category', header: 'Type', sortValue: (e) => e.category, cell: (e) => <StatusBadge tone="neutral" label={e.category} /> },
  { key: 'ip', header: 'IP address', cell: (e) => <span className="mono muted">{e.ip}</span> },
]

export default function AuditLog() {
  usePageTitle('Audit log')
  const toast = useToast()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return auditLog.filter((e) => (filter === 'all' || e.category === filter) && (!q || `${e.actor} ${e.action} ${e.target}`.toLowerCase().includes(q)))
  }, [filter, query])

  return (
    <>
      <PageHeader
        title="Audit log"
        description="Who did what in the workspace. Kept for 12 months."
        actions={
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              downloadText('beacon-audit-log.csv', toCsv(['time', 'member', 'action', 'details', 'type', 'ip'], rows.map((e) => [e.at.toISOString(), e.actor, e.action, e.target, e.category, e.ip])))
              toast({ title: `Exported ${rows.length} events` })
            }}
          >
            <Icon name="download" size={16} />
            Export CSV
          </button>
        }
      />
      <Card flush>
        <div className="toolbar">
          <div className="search-field">
            <Icon name="search" size={18} />
            <label className="sr-only" htmlFor="audit-search">
              Search the audit log
            </label>
            <input id="audit-search" className="input" type="search" placeholder="Search members, actions, details" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Tabs<Filter>
            label="Event type"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All' },
              { id: 'auth', label: 'Sign-ins' },
              { id: 'team', label: 'Team' },
              { id: 'billing', label: 'Billing' },
              { id: 'settings', label: 'Settings' },
              { id: 'data', label: 'Data' },
            ]}
          />
        </div>
        <DataTable label="Audit log" rows={rows} columns={COLUMNS} rowKey={(e) => String(e.id)} pageSize={12} initialSort={{ key: 'at', direction: 'desc' }} emptyTitle="No events match" />
      </Card>
    </>
  )
}
