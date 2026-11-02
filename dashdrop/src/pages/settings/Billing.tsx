import { Card, KeyValue, Progress, StatusBadge, useToast } from '../../components/ui.tsx'
import SettingsShell from '../../components/SettingsShell.tsx'
import Icon from '../../components/Icon.tsx'
import { members } from '../../data/workspace.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

/* Beacon HQ's own subscription to Beacon (the workspace plan), not your customers' billing. */
const RECEIPTS = [
  { id: 'BQ-0412', date: 'Oct 1, 2026', amount: 91 },
  { id: 'BQ-0388', date: 'Sep 1, 2026', amount: 91 },
  { id: 'BQ-0361', date: 'Aug 1, 2026', amount: 85 },
]

export default function Billing() {
  usePageTitle('Plan & billing')
  const toast = useToast()
  const seats = members.length
  const total = 49 + (seats - 1) * 6

  return (
    <SettingsShell title="Plan & billing" description="Your workspace's own Beacon plan and receipts.">
      <div className="stack-lg">
        <Card title="Growth plan" description="$49 per month, plus $6 per extra seat" actions={<StatusBadge tone="good" label="Active" />}>
          <div className="plan-stats">
            <div>
              <span className="muted">Next payment</span>
              <strong>{formatMoney(total)} on Nov 1</strong>
            </div>
            <div>
              <span className="muted">Seats</span>
              <strong>{seats} of 10</strong>
            </div>
          </div>
          <Progress value={seats} max={10} label="Seats used" />
          <div className="row-actions top-gap">
            <button type="button" className="btn btn-primary" onClick={() => toast({ title: 'Upgrade to Scale', description: 'This would open checkout in a real app.', tone: 'info' })}>
              Upgrade to Scale
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => toast({ title: `Switching to yearly saves ${formatMoney(total * 2)} a year`, description: 'Yearly is 10 months for 12.', tone: 'info' })}>
              Switch to yearly
            </button>
          </div>
        </Card>
        <Card title="Payment method">
          <KeyValue
            items={[
              { label: 'Card', value: 'Visa ending 4242, expires 08/28' },
              { label: 'Billing email', value: 'billing@beacon.example' },
              { label: 'Tax ID', value: 'GB 123 4567 89' },
            ]}
          />
          <div className="row-actions top-gap">
            <button type="button" className="btn btn-secondary" onClick={() => toast({ title: 'Card form would open here', tone: 'info' })}>
              <Icon name="card" size={16} />
              Update card
            </button>
          </div>
        </Card>
        <Card title="Receipts" flush>
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Receipt</th>
                  <th scope="col">Date</th>
                  <th scope="col" className="num">Amount</th>
                  <th scope="col">
                    <span className="sr-only">Download</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {RECEIPTS.map((r) => (
                  <tr key={r.id}>
                    <td className="mono">{r.id}</td>
                    <td className="muted">{r.date}</td>
                    <td className="num">{formatMoney(r.amount, true)}</td>
                    <td className="num">
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => toast({ title: `${r.id} downloaded` })}>
                        <Icon name="download" size={16} />
                        PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </SettingsShell>
  )
}
