import { Card, Legend, PageHeader, StatCard } from '../../components/ui.tsx'
import { StackedBarChart } from '../../components/Charts.tsx'
import { planByMonth } from '../../data/reports.ts'
import { formatMoney, formatSignedMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const PLANS = ['Starter', 'Growth', 'Scale'] as const

export default function ReportPlans() {
  usePageTitle('Revenue by plan')
  const first = planByMonth[0]
  const last = planByMonth[planByMonth.length - 1]

  return (
    <>
      <PageHeader title="Revenue by plan" description="Which plans your MRR comes from, Nov 2025 to Oct 2026." />
      <div className="stats stats-3">
        {PLANS.map((plan) => (
          <StatCard
            key={plan}
            label={`${plan}, October`}
            value={formatMoney(last[plan])}
            note={`${Math.round((last[plan] / last.total) * 100)}% of MRR, ${formatSignedMoney(last[plan] - first[plan])} in 12 months`}
          />
        ))}
      </div>
      <Card
        title="MRR by plan"
        description="Each bar is the month-end MRR, split by plan"
        actions={
          <Legend
            items={[
              { label: 'Starter', className: 'swatch-loss-strong' },
              { label: 'Growth', className: 'swatch-accent' },
              { label: 'Scale', className: 'swatch-accent-light' },
            ]}
          />
        }
      >
        <StackedBarChart
          data={planByMonth}
          label="Monthly recurring revenue by plan, November 2025 to October 2026"
          series={[
            { label: 'Starter', value: (m) => m.Starter, tone: 'loss-strong', direction: 'up' },
            { label: 'Growth', value: (m) => m.Growth, tone: 'accent', direction: 'up' },
            { label: 'Scale', value: (m) => m.Scale, tone: 'accent-light', direction: 'up' },
          ]}
          summary={(m) => `${formatMoney(m.total)} total`}
        />
      </Card>
      <Card title="Monthly table" description="Starter + Growth + Scale = total MRR" flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                {PLANS.map((p) => (
                  <th key={p} scope="col" className="num">
                    {p}
                  </th>
                ))}
                <th scope="col" className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {[...planByMonth].reverse().map((m) => (
                <tr key={m.full}>
                  <th scope="row">{m.full}</th>
                  {PLANS.map((p) => (
                    <td key={p} className="num">
                      {formatMoney(m[p])}
                    </td>
                  ))}
                  <td className="num">
                    <strong>{formatMoney(m.total)}</strong>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
