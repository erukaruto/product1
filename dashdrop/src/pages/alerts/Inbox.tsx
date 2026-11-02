import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import { Avatar, PageHeader, StatusBadge, Tabs, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { conversations as initial, type Conversation } from '../../data/workspace.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatDate } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

type Filter = Conversation['status']

const STATUS_LABEL: Record<Filter, string> = { open: 'Open', snoozed: 'Snoozed', closed: 'Closed' }

/* Customer conversations. UI only: replies are added on screen, nothing is sent. */
export default function Inbox() {
  usePageTitle('Inbox')
  const toast = useToast()
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>('open')
  const [activeId, setActiveId] = useState<string | null>(initial[0].id)
  const [draft, setDraft] = useState('')
  const list = items.filter((c) => c.status === filter)
  const active = items.find((c) => c.id === activeId && c.status === filter) ?? null

  function select(id: string) {
    setActiveId(id)
    setItems((all) => all.map((c) => (c.id === id ? { ...c, unread: false } : c)))
  }

  function reply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!active || !draft.trim()) return
    setItems((all) => all.map((c) => (c.id === active.id ? { ...c, messages: [...c.messages, { from: 'team', author: 'Lena Marsh', text: draft.trim(), at: TODAY }] } : c)))
    setDraft('')
    toast({ title: 'Reply sent', description: `To ${active.contact}` })
  }

  function setStatus(status: Filter) {
    if (!active) return
    setItems((all) => all.map((c) => (c.id === active.id ? { ...c, status } : c)))
    toast({ title: status === 'closed' ? 'Conversation closed' : 'Snoozed until tomorrow', tone: 'info' })
    setActiveId(null)
  }

  return (
    <>
      <PageHeader title="Inbox" description="Messages from customers, next to their revenue data." />
      <div className={`inbox${active ? ' has-active' : ''}`}>
        <section className="card inbox-list" aria-label="Conversations">
          <div className="toolbar">
            <Tabs<Filter>
              label="Conversation status"
              value={filter}
              onChange={(f) => {
                setFilter(f)
                setActiveId(null)
              }}
              tabs={(['open', 'snoozed', 'closed'] as Filter[]).map((s) => ({ id: s, label: STATUS_LABEL[s], count: items.filter((c) => c.status === s).length }))}
            />
          </div>
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button type="button" className={`conversation${c.id === active?.id ? ' is-active' : ''}${c.unread ? ' is-unread' : ''}`} onClick={() => select(c.id)}>
                  <Avatar name={c.contact} size={32} />
                  <span>
                    <strong>{c.customer}</strong>
                    <span className="conversation-subject">{c.subject}</span>
                    <small className="muted">{c.messages[c.messages.length - 1].text}</small>
                  </span>
                  {c.unread && <span className="unread-dot" aria-label="Unread" />}
                </button>
              </li>
            ))}
            {list.length === 0 && <li className="muted inbox-empty">No {STATUS_LABEL[filter].toLowerCase()} conversations.</li>}
          </ul>
        </section>
        <section className="card inbox-thread" aria-label="Conversation">
          {active ? (
            <>
              <header className="thread-head">
                <button type="button" className="icon-button thread-back" onClick={() => setActiveId(null)}>
                  <Icon name="arrowLeft" size={16} />
                  <span className="sr-only">Back to conversations</span>
                </button>
                <div>
                  <h2>{active.subject}</h2>
                  <p className="muted small">
                    {active.contact} at{' '}
                    <Link className="text-link" to={`/customers/${active.customerId}`}>
                      {active.customer}
                    </Link>
                  </p>
                </div>
                <StatusBadge tone={active.status === 'open' ? 'accent' : 'neutral'} label={STATUS_LABEL[active.status]} />
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setStatus('snoozed')}>
                    Snooze
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setStatus('closed')}>
                    Close
                  </button>
                </div>
              </header>
              <ol className="messages">
                {active.messages.map((m, i) => (
                  <li key={i} className={m.from === 'team' ? 'from-team' : 'from-customer'}>
                    <span className="message-meta">
                      {m.author} · {formatDate(m.at)}
                    </span>
                    <p>{m.text}</p>
                  </li>
                ))}
              </ol>
              <form className="reply" onSubmit={reply}>
                <label className="sr-only" htmlFor="reply">
                  Reply to {active.contact}
                </label>
                <textarea className="input" id="reply" rows={3} placeholder={`Reply to ${active.contact}`} value={draft} onChange={(e) => setDraft(e.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={!draft.trim()}>
                  <Icon name="send" size={16} />
                  Send
                </button>
              </form>
            </>
          ) : (
            <div className="empty">
              <span className="empty-icon">
                <Icon name="mail" />
              </span>
              <strong>Choose a conversation</strong>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
