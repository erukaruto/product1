import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { Card, PageHeader, StatCard, StatusBadge } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { subscriptions } from '../../data/billing.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const MONTHS = [
  { year: 2026, month: 10, label: 'November 2026' },
  { year: 2026, month: 11, label: 'December 2026' },
]
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

/* Renewal calendar for the next two months, from subscription renewal dates. */
export default function Renewals() {
  usePageTitle('Renewals')
  const [index, setIndex] = useState(0)
  const { year, month, label } = MONTHS[index]
  const [selected, setSelected] = useState<number | null>(null)

  const renewals = useMemo(
    () => subscriptions.filter((s) => s.renews && s.renews.getUTCFullYear() === year && s.renews.getUTCMonth() === month),
    [year, month]
  )
  const byDay = (day: number) => renewals.filter((s) => s.renews!.getUTCDate() === day)
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  const offset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7 // Monday first
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]
  const value = renewals.reduce((sum, s) => sum + s.amount, 0)
  const yearly = renewals.filter((s) => s.interval === 'yearly')
  const dayList = selected ? byDay(selected) : renewals

  return (
    <>
      <PageHeader title="Renewals" description="Subscriptions that renew in the coming weeks. Trials show the day they convert." />
      <div className="stats stats-3">
        <StatCard label={`Renewals in ${label.split(' ')[0]}`} value={renewals.length} />
        <StatCard label="Billed at renewal" value={formatMoney(value)} note="Sum of the next invoices" />
        <StatCard label="Yearly renewals" value={yearly.length} note={yearly.length ? 'Worth a check-in call' : 'None this month'} />
      </div>
      <div className="grid grid-main">
        <Card
          title={label}
          actions={
            <div className="row-actions">
              <button type="button" className="icon-button" disabled={index === 0} onClick={() => { setIndex(0); setSelected(null) }}>
                <Icon name="chevronLeft" />
                <span className="sr-only">Previous month</span>
              </button>
              <button type="button" className="icon-button" disabled={index === MONTHS.length - 1} onClick={() => { setIndex(1); setSelected(null) }}>
                <Icon name="chevronRight" />
                <span className="sr-only">Next month</span>
              </button>
            </div>
          }
        >
          <div className="calendar" role="grid" aria-label={`Renewals in ${label}`}>
            {WEEKDAYS.map((d) => (
              <span key={d} className="cal-head" role="columnheader">
                {d}
              </span>
            ))}
            {cells.map((day, i) =>
              day == null ? (
                <span key={`e${i}`} className="cal-empty" />
              ) : (
                <button
                  key={day}
                  type="button"
                  role="gridcell"
                  className={`cal-day${selected === day ? ' is-selected' : ''}${byDay(day).length ? ' has-items' : ''}`}
                  aria-pressed={selected === day}
                  aria-label={`${label.split(' ')[0]} ${day}: ${byDay(day).length} renewals`}
                  onClick={() => setSelected(selected === day ? null : day)}
                >
                  <span className="cal-num">{day}</span>
                  {byDay(day).length > 0 && <span className="cal-count">{byDay(day).length}</span>}
                </button>
              )
            )}
          </div>
        </Card>
        <Card title={selected ? `${label.split(' ')[0]} ${selected}` : `All of ${label.split(' ')[0]}`} description={`${dayList.length} renewals`} flush>
          <ul className="result-list" data-testid="renewal-list">
            {dayList.map((s) => (
              <li key={s.id}>
                <Link to={`/subscriptions/${s.id}`}>
                  <span className="cal-date">{s.renews!.getUTCDate()}</span>
                  <span>
                    <strong>{s.customer}</strong>
                    <small className="muted">
                      {s.plan}, {s.interval} · {formatMoney(s.amount)}
                    </small>
                  </span>
                  <StatusBadge status={s.status} label={s.status === 'trialing' ? 'Trial ends' : s.status === 'past_due' ? 'Past due' : 'Active'} />
                </Link>
              </li>
            ))}
            {dayList.length === 0 && <li className="muted inbox-empty">No renewals on this day.</li>}
          </ul>
        </Card>
      </div>
    </>
  )
}
