import { useMemo, useState } from 'react'
import { Card, PageHeader, Segmented, StatCard } from '../../components/ui.tsx'
import { LineChart } from '../../components/Charts.tsx'
import { forecast, SCENARIOS } from '../../data/reports.ts'
import { mrrByMonth } from '../../data/metrics.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Scenario = keyof typeof SCENARIOS | 'custom'

/* A simple compound-growth forecast. Change the scenario or type your own monthly growth. */
export default function ReportForecast() {
  usePageTitle('Forecast')
  const [scenario, setScenario] = useState<Scenario>('base')
  const [custom, setCustom] = useState('3')
  const growth = scenario === 'custom' ? Number(custom) || 0 : SCENARIOS[scenario].growth
  const start = mrrByMonth[mrrByMonth.length - 1].value
  const projected = useMemo(() => forecast(start, growth), [start, growth])
  const end = projected[projected.length - 1].value
  const chart = [...mrrByMonth.slice(-6), ...projected.map((p) => ({ ...p, full: `${p.full} (forecast)` }))]

  return (
    <>
      <PageHeader
        title="Forecast"
        description="Projected MRR for the next 6 months, from October's MRR and a monthly growth rate."
        actions={
          <Segmented<Scenario>
            label="Scenario"
            value={scenario}
            onChange={setScenario}
            options={[
              { id: 'conservative', label: 'Conservative' },
              { id: 'base', label: 'Base' },
              { id: 'optimistic', label: 'Optimistic' },
              { id: 'custom', label: 'Custom' },
            ]}
          />
        }
      />
      {scenario === 'custom' && (
        <Card>
          <div className="field narrow-field">
            <label htmlFor="growth">Monthly net growth (%)</label>
            <input className="input" id="growth" type="number" step="0.1" min="-20" max="50" value={custom} onChange={(e) => setCustom(e.target.value)} />
          </div>
        </Card>
      )}
      <div className="stats stats-3">
        <StatCard label="Monthly growth used" value={`${growth.toFixed(1)}%`} note={scenario === 'base' ? 'Average of the last 12 months' : SCENARIOS[scenario as keyof typeof SCENARIOS]?.label ?? 'Your number'} />
        <StatCard label="MRR in April 2027" value={<span data-testid="forecast-end">{formatMoney(end)}</span>} note={`From ${formatMoney(start)} today`} />
        <StatCard label="ARR run rate in April" value={formatMoney(end * 12)} note="April MRR x 12" />
      </div>
      <Card title="Actual and projected MRR" description="Last 6 months actual, next 6 months projected">
        <LineChart data={chart} label={`MRR from May 2026 to April 2027, projected to reach ${formatMoney(end)}`} />
      </Card>
      <Card title="Projection" description="A forecast, not a promise. It assumes the same growth every month." flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col" className="num">Projected MRR</th>
                <th scope="col" className="num">Change</th>
              </tr>
            </thead>
            <tbody>
              {projected.map((p, i) => (
                <tr key={p.full}>
                  <th scope="row">{p.full}</th>
                  <td className="num">{formatMoney(p.value)}</td>
                  <td className="num muted">{formatMoney(p.value - (i === 0 ? start : projected[i - 1].value))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
