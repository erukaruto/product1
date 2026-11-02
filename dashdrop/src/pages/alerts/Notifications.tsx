import { useState } from 'react'
import { Link } from 'react-router'
import { Card, EmptyState, PageHeader, Tabs } from '../../components/ui.tsx'
import Icon, { type IconName } from '../../components/Icon.tsx'
import { notifications as initial, type NotificationKind } from '../../data/workspace.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatDate } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Filter = 'all' | 'unread' | NotificationKind

const ICON: Record<NotificationKind, [IconName, string]> = {
  alert: ['bell', 'warn'],
  billing: ['card', 'accent'],
  team: ['userPlus', 'good'],
  system: ['info', 'accent'],
}

function relative(date: Date): string {
  const hours = (TODAY.getTime() - date.getTime()) / 3600000
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min ago`
  if (hours < 24) return `${Math.round(hours)} hours ago`
  return formatDate(date)
}

export default function Notifications() {
  usePageTitle('Notifications')
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>('all')
  const unread = items.filter((n) => !n.read).length
  const shown = items.filter((n) => (filter === 'all' ? true : filter === 'unread' ? !n.read : n.kind === filter))

  return (
    <>
      <PageHeader
        title="Notifications"
        description={`${unread} unread`}
        actions={
          <>
            <button type="button" className="btn btn-secondary" disabled={unread === 0} onClick={() => setItems((list) => list.map((n) => ({ ...n, read: true })))}>
              <Icon name="check" size={16} />
              Mark all as read
            </button>
            <Link className="btn btn-ghost" to="/settings?tab=notifications">
              Settings
            </Link>
          </>
        }
      />
      <Card flush>
        <div className="toolbar">
          <Tabs<Filter>
            label="Filter notifications"
            value={filter}
            onChange={setFilter}
            tabs={[
              { id: 'all', label: 'All', count: items.length },
              { id: 'unread', label: 'Unread', count: unread },
              { id: 'alert', label: 'Alerts' },
              { id: 'billing', label: 'Billing' },
              { id: 'team', label: 'Team' },
            ]}
          />
        </div>
        {shown.length === 0 ? (
          <EmptyState title="You're all caught up" icon="checkCircle" />
        ) : (
          <ul className="notification-list">
            {shown.map((n) => {
              const [icon, tone] = ICON[n.kind]
              return (
                <li key={n.id} className={n.read ? undefined : 'is-unread'}>
                  <span className={`activity-icon tone-${tone}`}>
                    <Icon name={icon} size={16} />
                  </span>
                  <div>
                    {n.link ? (
                      <Link className="row-link" to={n.link} onClick={() => setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}>
                        {n.title}
                      </Link>
                    ) : (
                      <strong>{n.title}</strong>
                    )}
                    <small className="muted">{n.body}</small>
                  </div>
                  <time className="muted small">{relative(n.at)}</time>
                  <button
                    type="button"
                    className="icon-button small"
                    onClick={() => setItems((list) => list.map((x) => (x.id === n.id ? { ...x, read: !x.read } : x)))}
                  >
                    <Icon name={n.read ? 'mail' : 'check'} size={14} />
                    <span className="sr-only">{n.read ? `Mark "${n.title}" as unread` : `Mark "${n.title}" as read`}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
