import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { Card, PageHeader, useToast } from '../../components/ui.tsx'
import Icon from '../../components/Icon.tsx'
import { customers } from '../../data/customers.ts'
import { TODAY } from '../../data/metrics.ts'
import { formatMoney } from '../../lib/format.ts'
import { usePageTitle } from '../../lib/hooks.ts'

interface Line {
  id: number
  description: string
  quantity: string
  unitPrice: string
}

const toNumber = (value: string) => {
  const n = Number.parseFloat(value)
  return Number.isFinite(n) && n >= 0 ? n : 0
}

/* UI only: the invoice is not saved. Totals are calculated as you type. */
export default function InvoiceNew() {
  usePageTitle('New invoice')
  const navigate = useNavigate()
  const toast = useToast()
  const [customerId, setCustomerId] = useState('')
  const [terms, setTerms] = useState('14')
  const [taxRate, setTaxRate] = useState('0')
  const [lines, setLines] = useState<Line[]>([{ id: 1, description: 'Growth plan, monthly', quantity: '1', unitPrice: '49' }])
  const [submitted, setSubmitted] = useState(false)

  const subtotal = useMemo(() => lines.reduce((sum, line) => sum + toNumber(line.quantity) * toNumber(line.unitPrice), 0), [lines])
  const tax = subtotal * (toNumber(taxRate) / 100)
  const total = subtotal + tax
  const issued = TODAY.toISOString().slice(0, 10)

  const lineErrors = lines.map((line) => !line.description.trim() || toNumber(line.quantity) <= 0)
  const customerError = submitted && !customerId
  const hasErrors = !customerId || lineErrors.some(Boolean)

  const update = (id: number, patch: Partial<Line>) => setLines((list) => list.map((line) => (line.id === id ? { ...line, ...patch } : line)))

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (hasErrors) return
    const company = customers.find((c) => c.id === customerId)?.company
    toast({ title: 'Invoice sent', description: `${formatMoney(total, true)} to ${company}.` })
    navigate('/invoices')
  }

  return (
    <>
      <PageHeader
        back={
          <Link className="back-link" to="/invoices">
            <Icon name="arrowLeft" size={16} />
            Invoices
          </Link>
        }
        title="New invoice"
        description="One-off charges such as onboarding or extra seats. Subscriptions are invoiced automatically."
      />

      <form className="grid grid-main" onSubmit={onSubmit} noValidate>
        <Card title="Details">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="inv-customer">Customer</label>
              <select className="input" id="inv-customer" value={customerId} onChange={(event) => setCustomerId(event.target.value)} aria-invalid={customerError} aria-describedby="inv-customer-error">
                <option value="">Choose a customer</option>
                {[...customers]
                  .sort((a, b) => a.company.localeCompare(b.company))
                  .map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.company}
                    </option>
                  ))}
              </select>
              {customerError && (
                <span id="inv-customer-error" className="field-error">
                  Choose who the invoice is for.
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="inv-terms">Payment terms</label>
              <select className="input" id="inv-terms" value={terms} onChange={(event) => setTerms(event.target.value)}>
                <option value="0">Due on receipt</option>
                <option value="14">Net 14</option>
                <option value="30">Net 30</option>
              </select>
            </div>
            <div className="field">
              <label htmlFor="inv-issued">Issue date</label>
              <input className="input" id="inv-issued" type="date" defaultValue={issued} />
            </div>
            <div className="field">
              <label htmlFor="inv-tax">Tax rate (%)</label>
              <input className="input" id="inv-tax" type="number" min="0" step="0.5" inputMode="decimal" value={taxRate} onChange={(event) => setTaxRate(event.target.value)} />
            </div>
          </div>

          <h3 className="section-title">Line items</h3>
          <div className="line-items">
            <div className="line-head" aria-hidden="true">
              <span>Description</span>
              <span>Qty</span>
              <span>Unit price</span>
              <span className="num">Amount</span>
              <span />
            </div>
            {lines.map((line, index) => (
              <div key={line.id} className="line-row">
                <input
                  className="input"
                  aria-label={`Description, line ${index + 1}`}
                  value={line.description}
                  onChange={(event) => update(line.id, { description: event.target.value })}
                  aria-invalid={submitted && lineErrors[index]}
                />
                <input className="input" aria-label={`Quantity, line ${index + 1}`} type="number" min="1" inputMode="numeric" value={line.quantity} onChange={(event) => update(line.id, { quantity: event.target.value })} />
                <input className="input" aria-label={`Unit price, line ${index + 1}`} type="number" min="0" step="0.01" inputMode="decimal" value={line.unitPrice} onChange={(event) => update(line.id, { unitPrice: event.target.value })} />
                <span className="num line-amount">{formatMoney(toNumber(line.quantity) * toNumber(line.unitPrice), true)}</span>
                <button type="button" className="icon-button" disabled={lines.length === 1} onClick={() => setLines((list) => list.filter((item) => item.id !== line.id))}>
                  <Icon name="trash" size={16} />
                  <span className="sr-only">Remove line {index + 1}</span>
                </button>
              </div>
            ))}
            {submitted && lineErrors.some(Boolean) && <span className="field-error">Each line needs a description and a quantity of at least 1.</span>}
            <button
              type="button"
              className="btn btn-ghost add-row"
              onClick={() => setLines((list) => [...list, { id: Math.max(...list.map((l) => l.id)) + 1, description: '', quantity: '1', unitPrice: '0' }])}
            >
              <Icon name="plus" size={16} />
              Add line
            </button>
          </div>

          <div className="field">
            <label htmlFor="inv-notes">Notes (shown on the invoice)</label>
            <textarea className="input" id="inv-notes" rows={3} placeholder="Thanks for your business." />
          </div>
        </Card>

        <div className="stack-lg sticky-side">
          <Card title="Summary">
            <dl className="invoice-totals compact" aria-live="polite">
              <div>
                <dt>Subtotal</dt>
                <dd data-testid="subtotal">{formatMoney(subtotal, true)}</dd>
              </div>
              <div>
                <dt>Tax ({toNumber(taxRate)}%)</dt>
                <dd>{formatMoney(tax, true)}</dd>
              </div>
              <div className="total">
                <dt>Total</dt>
                <dd data-testid="total">{formatMoney(total, true)}</dd>
              </div>
            </dl>
            <p className="muted small summary-note">Due {terms === '0' ? 'on receipt' : `${terms} days after the issue date`}.</p>
            <div className="stack">
              <button type="submit" className="btn btn-primary btn-block">
                <Icon name="send" size={16} />
                Send invoice
              </button>
              <button type="button" className="btn btn-secondary btn-block" onClick={() => toast({ title: 'Draft saved', tone: 'info' })}>
                Save draft
              </button>
            </div>
          </Card>
        </div>
      </form>
    </>
  )
}
