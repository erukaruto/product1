import { Link } from 'react-router'
import { Avatar, Card, PageHeader, StatCard, StatusBadge } from '../../components/ui.tsx'
import { health, healthBand } from '../../data/workspace.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

export default function AtRisk() {
  usePageTitle('At-risk accounts')
  const flagged = health.filter((h) => h.score < 70)
  const critical = flagged.filter((h) => h.score < 45)
  const mrrAtRisk = flagged.reduce((sum, h) => sum + h.customer.listMrr, 0)

  return (
    <>
      <PageHeader title="At-risk accounts" description="Health score starts at 85 and moves with each signal below. Under 70 is at risk, under 45 is critical." />
      <div className="stats stats-3">
        <StatCard label="Accounts flagged" value={flagged.length} note={`of ${health.length} in this workspace`} />
        <StatCard label="Critical" value={critical.length} note="Score under 45" />
        <StatCard label="MRR at risk" value={formatMoney(mrrAtRisk)} note="List price of flagged accounts" />
      </div>
      <Card title="Flagged accounts" description="Lowest score first" flush>
        <ul className="risk-list">
          {flagged.map(({ customer, score, signals }) => {
            const band = healthBand(score)
            return (
              <li key={customer.id}>
                <Link className="person-cell" to={`/customers/${customer.id}`}>
                  <Avatar name={customer.company} size={32} />
                  <span>
                    <strong>{customer.company}</strong>
                    <small>
                      {customer.plan}, {formatMoney(customer.listMrr)}/mo
                    </small>
                  </span>
                </Link>
                <ul className="signal-list" aria-label="Signals">
                  {signals.map((signal) => (
                    <li key={signal.label} className={signal.points < 0 ? 'neg' : 'pos'}>
                      {signal.label} <span>{signal.points > 0 ? `+${signal.points}` : signal.points}</span>
                    </li>
                  ))}
                </ul>
                <div className="score">
                  <strong className={`text-${band.tone}`}>{score}</strong>
                  <StatusBadge tone={band.tone} label={band.label} />
                </div>
              </li>
            )
          })}
        </ul>
      </Card>
    </>
  )
}
