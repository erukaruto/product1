import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Avatar, Card, EmptyState, PageHeader, StatusBadge } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { customers, STATUS_LABELS } from '../../data/customers.ts'
import { invoices, INVOICE_STATUS_LABELS } from '../../data/invoices.ts'
import { subscriptions } from '../../data/billing.ts'
import { NAV, NAV_FOOTER } from '../../nav.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

const LIMIT = 6

/* Searches customers, invoices, subscriptions and app pages. The top bar search opens this page. */
export default function Search() {
  const [params, setParams] = useSearchParams()
  const query = params.get('q') ?? ''
  const q = query.trim().toLowerCase()
  usePageTitle(q ? `Search: ${query}` : 'Search')

  const results = useMemo(() => {
    if (!q) return null
    const has = (...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q))
    return {
      customers: customers.filter((c) => has(c.company, c.name, c.email)),
      invoices: invoices.filter((i) => has(i.id, i.customer)),
      subscriptions: subscriptions.filter((s) => has(s.id, s.customer)),
      pages: [...NAV.flatMap((g) => g.items), ...NAV_FOOTER].filter((item) => has(item.label)),
    }
  }, [q])

  const total = results ? results.customers.length + results.invoices.length + results.subscriptions.length + results.pages.length : 0

  return (
    <>
      <PageHeader title="Search" description={results ? `${total} results for "${query}"` : 'Customers, invoices, subscriptions and pages.'} />
      <form className="search-field wide big-search" role="search" onSubmit={(e) => e.preventDefault()}>
        <Icon name="search" size={18} />
        <label className="sr-only" htmlFor="search-page">
          Search
        </label>
        <input id="search-page" className="input" type="search" value={query} placeholder="Company, email, invoice number..." autoFocus onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {}, { replace: true })} />
      </form>

      {results && total === 0 && (
        <Card>
          <EmptyState title={`Nothing found for "${query}"`}>Try a company name, an email address or an invoice number such as INV-2250.</EmptyState>
        </Card>
      )}

      {results && results.customers.length > 0 && (
        <Card title="Customers" description={`${results.customers.length} found`} flush>
          <ul className="result-list">
            {results.customers.slice(0, LIMIT).map((c) => (
              <li key={c.id}>
                <Link to={`/customers/${c.id}`}>
                  <Avatar name={c.company} size={28} />
                  <span>
                    <strong>{c.company}</strong>
                    <small className="muted">{c.email}</small>
                  </span>
                  <StatusBadge status={c.status} label={STATUS_LABELS[c.status]} />
                </Link>
              </li>
            ))}
          </ul>
          {results.customers.length > LIMIT && (
            <Link className="text-link result-more" to={`/customers?q=${encodeURIComponent(query)}`}>
              See all {results.customers.length} customers
            </Link>
          )}
        </Card>
      )}

      {results && results.invoices.length > 0 && (
        <Card title="Invoices" description={`${results.invoices.length} found`} flush>
          <ul className="result-list">
            {results.invoices.slice(0, LIMIT).map((i) => (
              <li key={i.id}>
                <Link to={`/invoices/${i.id}`}>
                  <span className="activity-icon tone-accent">
                    <Icon name="invoices" size={16} />
                  </span>
                  <span>
                    <strong className="mono">{i.id}</strong>
                    <small className="muted">
                      {i.customer} · {formatMoney(i.amount, true)}
                    </small>
                  </span>
                  <StatusBadge status={i.status} label={INVOICE_STATUS_LABELS[i.status]} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {results && results.subscriptions.length > 0 && (
        <Card title="Subscriptions" description={`${results.subscriptions.length} found`} flush>
          <ul className="result-list">
            {results.subscriptions.slice(0, LIMIT).map((s) => (
              <li key={s.id}>
                <Link to={`/subscriptions/${s.id}`}>
                  <span className="activity-icon tone-accent">
                    <Icon name="repeat" size={16} />
                  </span>
                  <span>
                    <strong>{s.customer}</strong>
                    <small className="muted">
                      {s.plan}, {s.interval} · <span className="mono">{s.id}</span>
                    </small>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {results && results.pages.length > 0 && (
        <Card title="Pages" flush>
          <ul className="result-list">
            {results.pages.map((p) => (
              <li key={p.to}>
                <Link to={p.to}>
                  <span className="activity-icon tone-accent">
                    <Icon name={p.icon} size={16} />
                  </span>
                  <strong>{p.label}</strong>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
