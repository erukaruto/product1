import type { CSSProperties } from 'react'
import type { Cohort } from '../data/metrics.ts'

interface CohortTableProps {
  rows: Cohort[]
  metric: 'revenue' | 'logos'
  /** Number of month columns to show. */
  months: number
}

/** Retention heatmap. Cell color goes from light (85% or less) to a 40% accent fill (100%+), which keeps text readable in every theme. */
export default function CohortTable({ rows, metric, months }: CohortTableProps) {
  const columns = Array.from({ length: months }, (_, i) => `Month ${i}`)
  const floor = metric === 'revenue' ? 85 : 70
  return (
    <div className="table-scroll">
      <table className="table cohort">
        <caption className="sr-only">{metric === 'revenue' ? 'Revenue retention' : 'Customer retention'} by signup month</caption>
        <thead>
          <tr>
            <th scope="col">Cohort</th>
            <th scope="col" className="num">
              Customers
            </th>
            {columns.map((column) => (
              <th scope="col" key={column} className="num">
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cohort) => (
            <tr key={cohort.label}>
              <th scope="row">{cohort.label}</th>
              <td className="num muted">{cohort.customers}</td>
              {columns.map((column, index) => {
                const value = cohort[metric][index]
                if (value == null) return <td key={column} />
                const strength = Math.max(8, Math.min(100, ((value - floor) / (100 - floor)) * 100))
                return (
                  <td key={column} className="num">
                    <span className="heat" style={{ '--heat': `${strength * 0.4}%` } as CSSProperties}>
                      {value}%
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
