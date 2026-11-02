import { Card, Legend, PageHeader, Progress, StatCard } from '../../components/ui.tsx'
import { LineChart, MovementChart, ShareBars, Sparkline, StackedBarChart } from '../../components/Charts.tsx'
import { countries, mrrByMonth, mrrMonths, movementByMonth } from '../../data/metrics.ts'
import { formatMoney, formatSignedMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function UiCharts() {
  usePageTitle('Charts')
  const values = mrrByMonth.map((m) => m.value)
  return (
    <>
      <PageHeader title="Charts" description="SVG chart components from src/components/Charts.tsx. They resize with their container and follow the theme." />

      <div className="stats">
        <StatCard label="Stat card" value="$48,320" note="With a note" />
        <div className="stat">
          <span className="stat-label">With sparkline</span>
          <strong className="stat-value">1,284</strong>
          <Sparkline values={values} label="Customers trend, rising" />
        </div>
        <div className="stat">
          <span className="stat-label">With progress</span>
          <strong className="stat-value">70%</strong>
          <Progress value={7} max={10} label="Seats used" />
        </div>
        <div className="stat">
          <span className="stat-label">Progress tones</span>
          <div className="stack tight">
            <Progress value={80} label="Good" tone="good" />
            <Progress value={50} label="Warning" tone="warn" />
            <Progress value={20} label="Bad" tone="bad" />
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <Card title="<LineChart>" description="Hover for the tooltip">
          <LineChart data={mrrByMonth} height={220} label="Example line chart of MRR" />
        </Card>
        <Card title="<MovementChart>" description="Gained above, lost below">
          <MovementChart data={movementByMonth} height={220} label="Example gained and lost bar chart" />
        </Card>
      </div>

      <div className="grid grid-2">
        <Card
          title="<StackedBarChart>"
          description="Any number of series, up or down"
          actions={
            <Legend
              items={[
                { label: 'New', className: 'swatch-accent' },
                { label: 'Expansion', className: 'swatch-accent-light' },
                { label: 'Contraction', className: 'swatch-loss' },
                { label: 'Churn', className: 'swatch-loss-strong' },
              ]}
            />
          }
        >
          <StackedBarChart
            data={mrrMonths.slice(-6)}
            height={220}
            label="Example stacked bar chart"
            series={[
              { label: 'New', value: (m) => m.newMrr, tone: 'accent', direction: 'up' },
              { label: 'Expansion', value: (m) => m.expansion, tone: 'accent-light', direction: 'up' },
              { label: 'Contraction', value: (m) => m.contraction, tone: 'loss', direction: 'down' },
              { label: 'Churn', value: (m) => m.churn, tone: 'loss-strong', direction: 'down' },
            ]}
            summary={(m) => `${formatSignedMoney(m.net)} net`}
          />
        </Card>
        <Card title="<ShareBars>" description="Ranked shares">
          <ShareBars rows={countries.slice(0, 5).map((c) => ({ label: c.name, value: c.mrr, display: formatMoney(c.mrr) }))} />
        </Card>
      </div>
    </>
  )
}
