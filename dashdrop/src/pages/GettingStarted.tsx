import { useState } from 'react'
import { Link } from 'react-router'
import { Card, PageHeader, Progress } from '../components/ui.tsx'
import Icon, { type IconName } from '../components/Icon.tsx'
import { usePageTitle } from '../lib/hooks.ts'

interface Task {
  id: string
  title: string
  text: string
  to: string
  action: string
  icon: IconName
}

const TASKS: Task[] = [
  { id: 'billing', title: 'Connect your billing data', text: 'Beacon needs subscriptions and invoices to calculate MRR.', to: '/onboarding/billing', action: 'Connect', icon: 'link' },
  { id: 'team', title: 'Invite your team', text: 'Give finance and support their own logins.', to: '/settings?tab=workspace', action: 'Invite', icon: 'userPlus' },
  { id: 'alerts', title: 'Choose your alerts', text: 'Get an email when a payment fails or a customer cancels.', to: '/settings?tab=notifications', action: 'Set up', icon: 'bell' },
  { id: 'report', title: 'Review your first MRR report', text: 'See new, expansion, contraction and churn for each month.', to: '/reports/mrr', action: 'Open', icon: 'lineChart' },
]

/* First-run screen: a checklist and empty states, before any data arrives. */
export default function GettingStarted() {
  usePageTitle('Getting started')
  const [done, setDone] = useState<Set<string>>(() => new Set(['billing']))
  const toggle = (id: string) =>
    setDone((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  return (
    <>
      <PageHeader title="Welcome to Beacon" description="Four steps to your first revenue report. Most teams finish in about ten minutes." />

      <Card title="Setup checklist" description={`${done.size} of ${TASKS.length} done`} actions={<span className="muted small">{Math.round((done.size / TASKS.length) * 100)}%</span>}>
        <Progress value={done.size} max={TASKS.length} label="Setup progress" />
        <ul className="checklist">
          {TASKS.map((task) => {
            const isDone = done.has(task.id)
            return (
              <li key={task.id} className={isDone ? 'is-done' : undefined}>
                <button type="button" className="check-toggle" aria-pressed={isDone} onClick={() => toggle(task.id)}>
                  {isDone ? <Icon name="check" size={14} /> : null}
                  <span className="sr-only">{isDone ? `Mark "${task.title}" as not done` : `Mark "${task.title}" as done`}</span>
                </button>
                <span className="activity-icon tone-accent">
                  <Icon name={task.icon} size={16} />
                </span>
                <div>
                  <strong>{task.title}</strong>
                  <small>{task.text}</small>
                </div>
                <Link className="btn btn-secondary" to={task.to}>
                  {task.action}
                </Link>
              </li>
            )
          })}
        </ul>
      </Card>

      <div className="grid grid-3">
        <Card title="MRR">
          <div className="empty compact">
            <span className="empty-icon">
              <Icon name="lineChart" />
            </span>
            <strong>No revenue yet</strong>
            <p>Your MRR chart appears after the first import finishes.</p>
          </div>
        </Card>
        <Card title="Customers">
          <div className="empty compact">
            <span className="empty-icon">
              <Icon name="customers" />
            </span>
            <strong>No customers yet</strong>
            <p>Customers are created from your billing data.</p>
          </div>
        </Card>
        <Card title="Want to look around first?">
          <p className="muted">The demo workspace has a year of sample data for a fictional company.</p>
          <Link className="btn btn-primary" to="/">
            Open the demo overview
          </Link>
        </Card>
      </div>
    </>
  )
}
