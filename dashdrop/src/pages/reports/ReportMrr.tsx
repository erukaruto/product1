import { Card, Legend, PageHeader, StatCard, useToast } from '../../components/ui.tsx'
import { LineChart, StackedBarChart } from '../../components/Charts.tsx'
import Icon from '../../components/Icon.tsx'
import { kpis, mrrByMonth, mrrMonths } from '../../data/metrics.ts'
import { downloadText, formatMoney, formatSignedMoney, percentChange, toCsv } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function ReportMrr() {
  usePageTitle('MRR report')
  const toast = useToast()
  const last = mrrMonths[mrrMonths.length - 1]
  const growth12 = percentChange(last.end, mrrMonths[0].start)

  function exportCsv() {
    downloadText(
      'beacon-mrr.csv',
      toCsv(
        ['month', 'start', 'new', 'expansion', 'contraction', 'churn', 'net', 'end'],
        mrrMonths.map((m) => [m.full, m.start, m.newMrr, m.expansion, -m.contraction, -m.churn, m.net, m.end])
      )
    )
    toast({ title: 'MRR report exported' })
  }

  return (
    <>
      <PageHeader
        title="MRR"
        description="Monthly recurring revenue and what changed it, Nov 2025 to Oct 2026."
        actions={
          <button type="button" className="btn btn-secondary" onClick={exportCsv}>
            <Icon name="download" size={16} />
            Export CSV
          </button>
        }
      />
      <div className="stats">
        <StatCard label="MRR, October" value={formatMoney(kpis.mrr.value)} note={`${formatSignedMoney(last.net)} this month`} />
        <StatCard label="Growth, 12 months" value={`${growth12.toFixed(1)}%`} note={`From ${formatMoney(mrrMonths[0].start)}`} />
        <StatCard label="New and expansion, October" value={formatMoney(last.newMrr + last.expansion)} note={`${formatMoney(last.newMrr)} new, ${formatMoney(last.expansion)} expansion`} />
        <StatCard label="Churn and contraction, October" value={formatMoney(last.churn + last.contraction)} note={`${formatMoney(last.churn)} churn, ${formatMoney(last.contraction)} contraction`} />
      </div>

      <Card
        title="MRR movement by month"
        description="Above the line: new and expansion. Below: contraction and churn."
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
          data={mrrMonths}
          label="MRR movement by month, split into new, expansion, contraction and churn"
          series={[
            { label: 'New', value: (m) => m.newMrr, tone: 'accent', direction: 'up' },
            { label: 'Expansion', value: (m) => m.expansion, tone: 'accent-light', direction: 'up' },
            { label: 'Contraction', value: (m) => m.contraction, tone: 'loss', direction: 'down' },
            { label: 'Churn', value: (m) => m.churn, tone: 'loss-strong', direction: 'down' },
          ]}
          summary={(m) => `${formatSignedMoney(m.net)} net`}
        />
      </Card>

      <Card title="MRR at month end">
        <LineChart data={mrrByMonth} height={220} label="MRR at the end of each month, November 2025 to October 2026" />
      </Card>

      <Card title="Monthly breakdown" description="Each row: start + new + expansion - contraction - churn = end." flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="num">Start</th>
                <th scope="col" className="num">New</th>
                <th scope="col" className="num">Expansion</th>
                <th scope="col" className="num">Contraction</th>
                <th scope="col" className="num">Churn</th>
                <th scope="col" className="num">Net</th>
                <th scope="col" className="num">End</th>
              </tr>
            </thead>
            <tbody>
              {[...mrrMonths].reverse().map((m) => (
                <tr key={m.full}>
                  <th scope="row">{m.full}</th>
                  <td className="num muted">{formatMoney(m.start)}</td>
                  <td className="num">{formatSignedMoney(m.newMrr)}</td>
                  <td className="num">{formatSignedMoney(m.expansion)}</td>
                  <td className="num">{formatSignedMoney(-m.contraction)}</td>
                  <td className="num">{formatSignedMoney(-m.churn)}</td>
                  <td className={`num ${m.net >= 0 ? 'text-good' : 'text-bad'}`}>{formatSignedMoney(m.net)}</td>
                  <td className="num">
                    <strong>{formatMoney(m.end)}</strong>
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
