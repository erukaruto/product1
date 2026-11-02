import { Card, PageHeader, Progress, StatCard } from '../../components/ui.tsx'
import { countryReport } from '../../data/reports.ts'
import { formatMoney, formatNumber } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function ReportCountries() {
  usePageTitle('Revenue by country')
  const total = countryReport.reduce((sum, c) => sum + c.mrr, 0)
  const customers = countryReport.reduce((sum, c) => sum + c.customers, 0)
  const fastest = [...countryReport].filter((c) => c.code !== 'XX').sort((a, b) => b.growth - a.growth)[0]

  return (
    <>
      <PageHeader title="Revenue by country" description="Where your MRR and customers are, based on the billing address." />
      <div className="stats stats-3">
        <StatCard label="Countries listed" value={countryReport.length - 1} note="Plus all others grouped" />
        <StatCard label="Largest market" value="United States" note={`${Math.round((countryReport[0].mrr / total) * 100)}% of MRR`} />
        <StatCard label="Fastest growing" value={fastest.name} note={`+${fastest.growth.toFixed(1)}% vs. September`} />
      </div>
      <Card title="By country" description={`${formatMoney(total)} MRR, ${formatNumber(customers)} customers`} flush>
        <div className="table-scroll">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Country</th>
                <th scope="col">Share of MRR</th>
                <th scope="col" className="num">MRR</th>
                <th scope="col" className="num">vs. September</th>
                <th scope="col" className="num">Customers</th>
                <th scope="col" className="num">ARPA</th>
              </tr>
            </thead>
            <tbody>
              {countryReport.map((c) => (
                <tr key={c.code}>
                  <th scope="row">{c.name}</th>
                  <td className="share-cell">
                    <Progress value={c.mrr} max={countryReport[0].mrr} label={`${c.name} share`} />
                    <span className="muted small">{((c.mrr / total) * 100).toFixed(1)}%</span>
                  </td>
                  <td className="num">{formatMoney(c.mrr)}</td>
                  <td className={`num ${c.growth >= 0 ? 'text-good' : 'text-bad'}`}>+{c.growth.toFixed(1)}%</td>
                  <td className="num">{formatNumber(c.customers)}</td>
                  <td className="num">{formatMoney(c.arpa, true)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  )
}
