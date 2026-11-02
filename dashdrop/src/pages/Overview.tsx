import { Link } from 'react-router'
import { Card, Delta, PageHeader, StatCard, StatusBadge } from '../components/ui.tsx'
import { LineChart, ShareBars } from '../components/Charts.tsx'
import { ActivityList } from '../components/AppLayout.tsx'
import Icon from '../components/Icon.tsx'
import { kpis, movementThisMonth, mrrByMonth, planMix } from '../data/metrics.ts'
import { invoices, INVOICE_STATUS_LABELS } from '../data/invoices.ts'
import { activity } from '../data/activity.ts'
import { formatDate, formatMoney, formatNumber, formatSignedMoney, percentChange } from '../lib/format.ts'
import { usePageTitle } from '../lib/hooks.ts'

export default function Overview() {
  usePageTitle('Overview')
  const net = movementThisMonth.reduce((sum, item) => sum + item.value, 0)
  const maxMovement = Math.max(...movementThisMonth.map((item) => Math.abs(item.value)))
  const totalPlanMrr = planMix.reduce((sum, plan) => sum + plan.mrr, 0)

  return (
    <>
      <PageHeader
        title="Overview"
        description="Revenue and customers for Beacon HQ, updated Oct 31, 2026."
        actions={
          <Link className="btn btn-secondary" to="/reports/mrr">
            Open MRR report
            <Icon name="arrowRight" size={16} />
          </Link>
        }
      />

      <div className="stats">
        <StatCard label="MRR" value={formatMoney(kpis.mrr.value)} delta={<Delta value={percentChange(kpis.mrr.value, kpis.mrr.previous)} />} note="vs. last month" />
        <StatCard
          label="Active customers"
          value={formatNumber(kpis.customers.value)}
          delta={<Delta value={kpis.customers.value - kpis.customers.previous} suffix="" digits={0} />}
          note="vs. last month"
        />
        <StatCard
          label="Churn rate"
          value={`${kpis.churnRate.value.toFixed(1)}%`}
          delta={<Delta value={kpis.churnRate.value - kpis.churnRate.previous} suffix=" pts" invert />}
          note="vs. last month"
        />
        <StatCard label="ARPA" value={formatMoney(kpis.arpa.value, true)} delta={<Delta value={percentChange(kpis.arpa.value, kpis.arpa.previous)} />} note="vs. last month" />
      </div>

      <div className="grid grid-main">
        <Card title="Monthly recurring revenue" description="Nov 2025 to Oct 2026">
          <LineChart data={mrrByMonth} label="MRR grew from $31,240 in November 2025 to $48,320 in October 2026" />
        </Card>

        <Card title="MRR movement" description="October 2026">
          <ul className="movement">
            {movementThisMonth.map((item) => (
              <li key={item.key}>
                <div className="share-row">
                  <span>{item.label}</span>
                  <strong>{formatSignedMoney(item.value)}</strong>
                </div>
                <div className={`meter ${item.value < 0 ? 'meter-loss' : ''}`} aria-hidden="true">
                  <i style={{ width: `${(Math.abs(item.value) / maxMovement) * 100}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="movement-total">
            <span>Net new MRR</span>
            <strong>{formatSignedMoney(net)}</strong>
          </div>
        </Card>
      </div>

      <div className="grid grid-main">
        <Card
          title="Recent invoices"
          actions={
            <Link className="text-link" to="/invoices">
              View all
            </Link>
          }
          flush
        >
          <div className="table-scroll">
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">Invoice</th>
                  <th scope="col">Customer</th>
                  <th scope="col">Issued</th>
                  <th scope="col" className="num">
                    Amount
                  </th>
                  <th scope="col">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 6).map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="mono">
                      <Link className="row-link" to={`/invoices/${invoice.id}`}>
                        {invoice.id}
                      </Link>
                    </td>
                    <td>
                      <Link className="row-link" to={`/customers/${invoice.customerId}`}>
                        {invoice.customer}
                      </Link>
                    </td>
                    <td className="muted">{formatDate(invoice.issued)}</td>
                    <td className="num">{formatMoney(invoice.amount, true)}</td>
                    <td>
                      <StatusBadge status={invoice.status} label={INVOICE_STATUS_LABELS[invoice.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="stack-lg">
          <Card title="Plan mix" description="Share of MRR">
            <ShareBars
              rows={planMix.map((plan) => ({
                label: plan.plan,
                value: plan.mrr,
                display: `${Math.round((plan.mrr / totalPlanMrr) * 100)}%`,
                note: `${formatNumber(plan.customers)} customers, ${formatMoney(plan.mrr)}`,
              }))}
            />
          </Card>
          <Card title="Activity">
            <ActivityList items={activity} />
          </Card>
        </div>
      </div>
    </>
  )
}
