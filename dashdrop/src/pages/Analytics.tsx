import { Card, Legend, PageHeader, StatCard } from '../components/ui.tsx'
import { MovementChart, ShareBars } from '../components/Charts.tsx'
import { cohorts, countries, funnel, movementByMonth } from '../data/metrics.ts'
import { formatMoney, formatNumber, formatSignedMoney } from '../lib/format.ts'
import { usePageTitle } from '../lib/hooks.ts'
import CohortTable from '../components/CohortTable.tsx'

export default function Analytics() {
  usePageTitle('Analytics')
  const last = movementByMonth[movementByMonth.length - 1]
  const totalGained = movementByMonth.reduce((sum, m) => sum + m.gained, 0)
  const totalLost = movementByMonth.reduce((sum, m) => sum + m.lost, 0)
  const countryTotal = countries.reduce((sum, c) => sum + c.mrr, 0)
  const signups = funnel[1].value
  const paid = funnel[3].value

  return (
    <>
      <PageHeader title="Analytics" description="How revenue moved over the last 12 months." />

      <div className="stats">
        <StatCard label="Net new MRR, October" value={formatSignedMoney(last.gained - last.lost)} note={`${formatMoney(last.gained)} gained`} />
        <StatCard label="Gained, 12 months" value={formatMoney(totalGained)} note="New and expansion" />
        <StatCard label="Lost, 12 months" value={formatMoney(totalLost)} note="Churn and contraction" />
        <StatCard label="Trial to paid" value={`${((paid / signups) * 100).toFixed(1)}%`} note="Last 30 days" />
      </div>

      <Card
        title="MRR gained and lost"
        description="Gained is new and expansion revenue. Lost is churn and contraction."
        actions={
          <Legend
            items={[
              { label: 'Gained', className: 'swatch-accent' },
              { label: 'Lost', className: 'swatch-loss' },
            ]}
          />
        }
      >
        <MovementChart data={movementByMonth} label="Monthly MRR gained and lost, November 2025 to October 2026" />
      </Card>

      <div className="grid grid-2">
        <Card title="Signup funnel" description="Last 30 days">
          <ShareBars
            rows={funnel.map((step, index) => ({
              label: step.label,
              value: step.value,
              display: formatNumber(step.value),
              note: index === 0 ? null : `${((step.value / funnel[index - 1].value) * 100).toFixed(1)}% of previous step`,
            }))}
          />
        </Card>
        <Card title="MRR by country" description="Current month">
          <ShareBars
            rows={countries.map((country) => ({
              label: country.name,
              value: country.mrr,
              display: formatMoney(country.mrr),
              note: `${Math.round((country.mrr / countryTotal) * 100)}% of MRR`,
            }))}
          />
        </Card>
      </div>

      <Card title="Revenue retention by cohort" description="Last 6 signup months. The full table is in Reports, Cohorts." flush>
        <CohortTable rows={cohorts.slice(-6)} metric="revenue" months={6} />
      </Card>
    </>
  )
}
