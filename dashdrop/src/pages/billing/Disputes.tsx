import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Card, Modal, PageHeader, StatCard, StatusBadge, Tabs, useToast } from '../../components/ui.tsx'
import DataTable, { type Column } from '../../components/DataTable.tsx'
import Icon from '../../components/Icon.tsx'
import { billingCases, CASE_STATUS_LABELS } from '../../data/billing.ts'
import { formatDate, formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'
import type { BillingCase, CaseKind } from '../../types.ts'

export default function Disputes() {
  usePageTitle('Refunds & disputes')
  const toast = useToast()
  const [kind, setKind] = useState<CaseKind>('dispute')
  const [cases, setCases] = useState(billingCases)
  const [responding, setResponding] = useState<BillingCase | null>(null)
  const [evidence, setEvidence] = useState<string[]>([])

  const rows = cases.filter((c) => c.kind === kind)
  const open = cases.filter((c) => c.status === 'needs_response')
  const disputed = cases.filter((c) => c.kind === 'dispute').reduce((sum, c) => sum + c.amount, 0)
  const decided = cases.filter((c) => c.status === 'won' || c.status === 'lost')
  const won = decided.filter((c) => c.status === 'won').length

  function submitResponse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!responding) return
    setCases((list) => list.map((c) => (c.id === responding.id ? { ...c, status: 'under_review', respondBy: null } : c)))
    toast({ title: 'Response submitted', description: 'The card issuer usually decides within 60 days.' })
    setResponding(null)
    setEvidence([])
  }

  const columns: Column<BillingCase>[] = [
    { key: 'id', header: 'Case', sortValue: (c) => c.id, cell: (c) => <span className="mono">{c.id}</span> },
    {
      key: 'customer',
      header: 'Customer',
      sortValue: (c) => c.customer,
      cell: (c) => (
        <Link className="row-link" to={`/customers/${c.customerId}`}>
          {c.customer}
        </Link>
      ),
    },
    { key: 'amount', header: 'Amount', align: 'right', sortValue: (c) => c.amount, cell: (c) => formatMoney(c.amount, true) },
    { key: 'reason', header: 'Reason', sortValue: (c) => c.reason, cell: (c) => c.reason },
    { key: 'opened', header: 'Opened', sortValue: (c) => c.opened, cell: (c) => <span className="muted">{formatDate(c.opened)}</span> },
    {
      key: 'status',
      header: 'Status',
      sortValue: (c) => c.status,
      cell: (c) => (
        <span className="status-with-note">
          <StatusBadge status={c.status} label={CASE_STATUS_LABELS[c.status]} />
          {c.respondBy && <small className="muted">Respond by {formatDate(c.respondBy)}</small>}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      cell: (c) =>
        c.status === 'needs_response' ? (
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setResponding(c)}>
            Respond
          </button>
        ) : null,
    },
  ]

  return (
    <>
      <PageHeader title="Refunds & disputes" description="Chargebacks from card issuers and refunds you issued." />
      <div className="stats">
        <StatCard label="Needs response" value={open.length} note={open[0]?.respondBy ? `Next deadline ${formatDate(open[0].respondBy)}` : 'Nothing due'} />
        <StatCard label="Disputed amount" value={formatMoney(disputed, true)} note="All open and closed disputes" />
        <StatCard label="Win rate" value={decided.length ? `${Math.round((won / decided.length) * 100)}%` : '-'} note={`${won} of ${decided.length} decided`} />
        <StatCard label="Refunds" value={cases.filter((c) => c.kind === 'refund').length} note="Issued in the last 60 days" />
      </div>
      <Card flush>
        <div className="toolbar">
          <Tabs<CaseKind>
            label="Case type"
            value={kind}
            onChange={setKind}
            tabs={[
              { id: 'dispute', label: 'Disputes', count: cases.filter((c) => c.kind === 'dispute').length },
              { id: 'refund', label: 'Refunds', count: cases.filter((c) => c.kind === 'refund').length },
            ]}
          />
        </div>
        <DataTable label={kind === 'dispute' ? 'Disputes' : 'Refunds'} rows={rows} columns={columns} rowKey={(c) => c.id} pageSize={0} initialSort={{ key: 'opened', direction: 'desc' }} />
      </Card>

      <Modal
        open={responding != null}
        onClose={() => setResponding(null)}
        title="Respond to dispute"
        description={responding ? `${responding.customer}, ${formatMoney(responding.amount, true)}: "${responding.reason}"` : undefined}
      >
        <form id="dispute-form" className="stack" onSubmit={submitResponse}>
          <div className="field">
            <label htmlFor="dispute-note">Explanation for the card issuer</label>
            <textarea
              className="input"
              id="dispute-note"
              rows={4}
              required
              defaultValue="The customer signed up on our website, used the product for several weeks and did not contact support before disputing the charge. Login history and the signed terms are attached."
            />
          </div>
          <label className="dropzone small">
            <Icon name="upload" />
            <strong>Attach evidence</strong>
            <small>{evidence.length ? evidence.join(', ') : 'Receipts, login history or emails. PDF or PNG.'}</small>
            <input type="file" multiple className="sr-only" onChange={(event) => setEvidence([...(event.target.files ?? [])].map((file) => file.name))} />
          </label>
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={() => setResponding(null)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit response
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
