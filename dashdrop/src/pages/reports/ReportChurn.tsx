import { Link } from 'react-router'
import { Card, Delta, PageHeader, StatCard, StatusBadge } from '../../components/ui.tsx'
import { LineChart, ShareBars } from '../../components/Charts.tsx'
import { churnReasons, customerMonths, kpis, mrrMonths } from '../../data/metrics.ts'
import { customers, STATUS_LABELS } from '../../data/customers.ts'
import { formatDate, formatMoney, formatPercent } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function ReportChurn() {
  usePageTitle('Churn report')
  const month = customerMonths[customerMonths.length - 1]
  const mrr = mrrMonths[mrrMonths.length - 1]
  const revenueChurn = (mrr.churn / mrr.start) * 100
  const netRevenueChurn = ((mrr.churn + mrr.contraction - mrr.expansion) / mrr.start) * 100
  const totalReasons = churnReasons.reduce((sum, r) => sum + r.customers, 0)
  const atRisk = customers.filter((c) => c.status === 'past_due' || c.status === 'canceled')

  return (
    <>
      <PageHeader title="Churn" description="Customers and revenue lost each month. Churn rate = customers lost / customers at the start of the month." />
      <div className="stats">
        <StatCard
          label="Customer churn, October"
          value={`${kpis.churnRate.value.toFixed(1)}%`}
          delta={<Delta value={kpis.churnRate.value - kpis.churnRate.previous} suffix=" pts" invert />}
          note="vs. September"
        />
        <StatCard label="Customers lost, October" value={month.churned} note={`of ${month.start.toLocaleString('en-US')} at the start`} />
        <StatCard label="Revenue churn, October" value={formatPercent(revenueChurn)} note={`${formatMoney(mrr.churn)} of ${formatMoney(mrr.start)}`} />
        <StatCard label="Net revenue churn, October" value={formatPercent(netRevenueChurn)} note="After expansion" />
      </div>

      <div className="grid grid-main">
        <Card title="Customer churn rate" description="Nov 2025 to Oct 2026">
          <LineChart
            data={customerMonths.map((m) => ({ label: m.label, full: m.full, value: Math.round(m.churnRate * 100) / 100 }))}
            label="Monthly customer churn rate, between 1.8% and 2.7%"
            format={(v) => `${v.toFixed(2)}%`}
            tickFormat={(v) => `${v.toFixed(1)}%`}
          />
        </Card>
        <Card title="Why customers left" description={`October, ${totalReasons} cancellations`}>
          <ShareBars
            rows={churnReasons.map((r) => ({
              label: r.reason,
              value: r.customers,
              display: String(r.customers),
              note: `${Math.round((r.customers / totalReasons) * 100)}%`,
            }))}
          />
        </Card>
      </div>

      <Card title="Accounts to follow up" description="Past due or canceled in this demo workspace." flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Customer</th>
                <th scope="col">Plan</th>
                <th scope="col" className="num">List price</th>
                <th scope="col">Status</th>
                <th scope="col">Last active</th>
              </tr>
            </thead>
            <tbody>
              {atRisk.map((c) => (
                <tr key={c.id}>
                  <td>
                    <Link className="row-link" to={`/customers/${c.id}`}>
                      {c.company}
                    </Link>
                  </td>
                  <td>{c.plan}</td>
                  <td className="num">{formatMoney(c.listMrr)}/mo</td>
                  <td>
                    <StatusBadge status={c.status} label={STATUS_LABELS[c.status]} />
                  </td>
                  <td className="muted">{formatDate(c.lastSeen)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
