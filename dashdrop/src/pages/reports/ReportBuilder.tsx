import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { Card, PageHeader, Segmented, useToast } from '../../components/ui.tsx'
import { LineChart, ShareBars } from '../../components/Charts.tsx'
import { customerMonths, mrrMonths, planMix } from '../../data/metrics.ts'
import { countryReport } from '../../data/reports.ts'
import { formatMoney, formatNumber } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Metric = 'mrr' | 'customers' | 'churn' | 'arpa'
type Group = 'month' | 'plan' | 'country'

const METRICS: Array<{ id: Metric; label: string }> = [
  { id: 'mrr', label: 'MRR' },
  { id: 'customers', label: 'Customers' },
  { id: 'churn', label: 'Churn rate' },
  { id: 'arpa', label: 'ARPA' },
]

const format = (metric: Metric, value: number) =>
  metric === 'mrr' ? formatMoney(value) : metric === 'arpa' ? formatMoney(value, true) : metric === 'churn' ? `${value.toFixed(2)}%` : formatNumber(value)

/* Pick a metric and a grouping; the preview updates right away. Churn has no plan or country split in the demo data. */
export default function ReportBuilder() {
  usePageTitle('Report builder')
  const toast = useToast()
  const [params] = useSearchParams()
  const [metric, setMetric] = useState<Metric>((params.get('metric') as Metric) || 'mrr')
  const [group, setGroup] = useState<Group>((params.get('group') as Group) || 'month')
  const [name, setName] = useState('')
  const effectiveGroup: Group = metric === 'churn' ? 'month' : group

  const rows = useMemo(() => {
    if (effectiveGroup === 'month') {
      return mrrMonths.map((m, i) => {
        const c = customerMonths[i]
        const value = metric === 'mrr' ? m.end : metric === 'customers' ? c.end : metric === 'churn' ? Math.round(c.churnRate * 100) / 100 : Math.round((m.end / c.end) * 100) / 100
        return { label: m.label, full: m.full, value }
      })
    }
    if (effectiveGroup === 'plan') {
      return planMix.map((p) => ({ label: p.plan, full: p.plan, value: metric === 'mrr' ? p.mrr : metric === 'customers' ? p.customers : Math.round((p.mrr / p.customers) * 100) / 100 }))
    }
    return countryReport.map((c) => ({ label: c.name, full: c.name, value: metric === 'mrr' ? c.mrr : metric === 'customers' ? c.customers : Math.round(c.arpa * 100) / 100 }))
  }, [metric, effectiveGroup])

  return (
    <>
      <PageHeader
        title="Report builder"
        description="Choose what to measure and how to split it."
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => toast({ title: `Saved "${name.trim() || `${METRICS.find((m) => m.id === metric)?.label} by ${effectiveGroup}`}"`, description: 'Find it in Saved reports.' })}
          >
            Save report
          </button>
        }
      />
      <Card>
        <div className="builder-controls">
          <div className="field">
            <span className="field-label" id="metric-label">Metric</span>
            <Segmented<Metric> label="Metric" value={metric} onChange={setMetric} options={METRICS} />
          </div>
          <div className="field">
            <span className="field-label">Group by</span>
            <Segmented<Group>
              label="Group by"
              value={effectiveGroup}
              onChange={setGroup}
              options={[
                { id: 'month', label: 'Month' },
                { id: 'plan', label: 'Plan' },
                { id: 'country', label: 'Country' },
              ]}
            />
            {metric === 'churn' && <span className="field-hint">Churn rate is only available by month.</span>}
          </div>
          <div className="field">
            <label htmlFor="report-name">Name (optional)</label>
            <input className="input" id="report-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="For example: MRR by plan" />
          </div>
        </div>
      </Card>
      <Card title="Preview" description={`${METRICS.find((m) => m.id === metric)?.label} by ${effectiveGroup}`}>
        {effectiveGroup === 'month' ? (
          <LineChart
            data={rows}
            label={`${metric} by month`}
            format={(v) => format(metric, v)}
            tickFormat={metric === 'mrr' ? undefined : metric === 'churn' ? (v) => `${v.toFixed(1)}%` : metric === 'arpa' ? (v) => `$${v.toFixed(0)}` : (v) => formatNumber(v)}
          />
        ) : (
          <ShareBars rows={rows.map((r) => ({ label: r.label, value: r.value, display: format(metric, r.value) }))} />
        )}
      </Card>
      <Card title="Data" flush>
        <div className="table-scroll">
          <table className="table" data-testid="builder-table">
            <thead>
              <tr>
                <th scope="col">{effectiveGroup === 'month' ? 'Month' : effectiveGroup === 'plan' ? 'Plan' : 'Country'}</th>
                <th scope="col" className="num">{METRICS.find((m) => m.id === metric)?.label}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.full}>
                  <th scope="row">{r.full}</th>
                  <td className="num">{format(metric, r.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
