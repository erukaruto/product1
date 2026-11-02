import { useState } from 'react'
import { Card, PageHeader, Segmented, StatCard } from '../../components/ui.tsx'
import CohortTable from '../../components/CohortTable.tsx'
import { cohorts } from '../../data/metrics.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Metric = 'revenue' | 'logos'

const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length

export default function ReportCohorts() {
  usePageTitle('Cohorts')
  const [metric, setMetric] = useState<Metric>('revenue')
  const valuesAt = (month: number) => cohorts.map((c) => c[metric][month]).filter((v): v is number => v != null)

  return (
    <>
      <PageHeader
        title="Cohorts"
        description="Customers grouped by signup month. Each cell shows how much of the first month is kept."
        actions={
          <Segmented<Metric>
            label="Retention measure"
            value={metric}
            onChange={setMetric}
            options={[
              { id: 'revenue', label: 'Revenue' },
              { id: 'logos', label: 'Customers' },
            ]}
          />
        }
      />
      <div className="stats stats-3">
        <StatCard label="Average at month 3" value={`${average(valuesAt(3)).toFixed(0)}%`} note={`${valuesAt(3).length} cohorts`} />
        <StatCard label="Average at month 6" value={`${average(valuesAt(6)).toFixed(0)}%`} note={`${valuesAt(6).length} cohorts`} />
        <StatCard label="Average at month 11" value={`${average(valuesAt(11)).toFixed(0)}%`} note={`${valuesAt(11).length} cohort`} />
      </div>
      <Card
        title={metric === 'revenue' ? 'Revenue retention' : 'Customer retention'}
        description={metric === 'revenue' ? 'Percent of month 0 revenue still billed. Can pass 100% when customers upgrade.' : 'Percent of month 0 customers still paying.'}
        flush
      >
        <CohortTable rows={[...cohorts].reverse()} metric={metric} months={12} />
      </Card>
    </>
  )
}
